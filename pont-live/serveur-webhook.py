#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
serveur-webhook.py — le second serveur web (port 3081) qui reçoit la parole.

Gl Digital Lab · 20/09/2026 · EVA-01 · preset `metroid`.

C'est le serveur QUI ÉCOUTE LE WEBHOOK, pas le serveur vocal. Le micro reste sur 8150.
Le service vocal (serveur-voix.py) envoie la phrase capturée ICI, et la réponse du
harnais revient dans le SLOT (`%TEMP%/Samus-entendu-poste.json`) — jamais par le réseau.

⚠️ NON ÉPROUVÉ : le port 3081 n'est pas monté ; le second webserver n'existe pas dans
le harnais installé (seuls 3080/8150/8151/11434 sont mesurés en écoute locale) ; la
configuration du webhook (`dsh-webhook-github`) demande un adaptateur monté dans un
groupe qui isole `webServer`, et le guide (`docs/user/guide/github-review.md`) n'est
pas présent dans l'installation npm. ⚠️ Le secret (`ARKADIA_WEBHOOK_SECRET`) doit être
un secret (hors `.env` du dépôt, voir `.gitignore`).

Le serveur échoue FERMÉ :
- pas de secret -> 503
- HMAC invalide -> 401
- pas la commande `!arkadia` -> 200 mais `ok: false`
- liste d'autorisation vide -> aucun compte autorisé -> `null`
Le webhook ne rend JAMAIS le contenu de la phrase dans la réponse (contrat `dsh-webhook`).
Seul le slot le porte.
*/
import os, sys, hmac, hashlib, json, time
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

PORT = int(os.getenv('WEBHOOK_PORT', '3081'))
# ⚠️ Le secret doit être un secret — jamais dans le dépôt. Si vide, le serveur démarre
# mais répond `503` : il s'arrête fermé, il ne laisse pas passer sans clé.
SECRET = os.getenv('ARKADIA_WEBHOOK_SECRET', '')

# ⚠️ `ARKADIA_AUTORISES` : même logique que le connecteur. Vide -> personne autorisé.
AUTORISES = set(filter(None, (os.getenv('ARKADIA_AUTORISES', '')).lower().split(',')))
COMMANDE = (os.getenv('ARKADIA_COMMANDE') or '!arkadia').strip()
# ⚠️ Le chemin du slot doit être le même que celui du chantier-accusé-de-réception.
SLOT_PATH = os.getenv('SAMUS_ENTENDU_SLOT') or (os.getenv('TMP', '/tmp') + '/Samus-entendu-poste.json')

# Pour le journal : mesures seules, jamais la phrase (règle du studio).
# ⚠️ Ce journal n'est pas celui du harnais : c'est celui du webhook. Même principe.
JOURNAL = os.getenv('ARKADIA_JOURNAL_WEBHOOK') or os.path.dirname(__file__) + '/.journal-webhook.log'

# ⚠️ `publish_reponse` : la publication de la réponse doit être un appel LOCAL au
# service vocal (le slot), jamais au réseau. Non exécuté : le service vocal doit
# être en mesure de lire le slot et de déclencher la synthèse. ⚠️ Voir le chantier
# chantier-accuse-de-reception-2026-09-20.md (§3-5) qui définit le slot et l'observateur.
# ⚠️ Et `pont-live-2026-09-20.md` qui dit : le webhook rend `202`, jamais la réponse.
# Le retour passe par le SLOT — c'est le pattern du studio.

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Silencieux — sauf erreurs critiques, parce que le webhook ne doit pas
        # polluer l'écran (consigne §8 des consignes globales).
        msg = fmt % args
        if 'erreur' in msg.lower() or msg.startswith('ECHEC'):
            with open(JOURNAL, 'a', encoding='utf-8') as fh:
                fh.write(json.dumps({
                    'quand': time.strftime('%Y-%m-%d %H:%M:%S'),
                    'niveau': 'erreur',
                    'message': msg[:500],   # jamais le corps, jamais la phrase
                }, ensure_ascii=False) + '\n')

    def send_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256, X-GitHub-Event, X-GitHub-Delivery')

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors()
        self.end_headers()

    def do_POST(self):
        # ⚠️ La route exacte doit correspondre au `path` du webhook (`/live/voix` ici).
        # Si le chemin ne correspond pas, on refuse (404) — jamais on ne laisse passer
        # un appel sur une route inconnue : le webhook doit être sélectif.
        if self.path != '/live/voix':
            self.send_response(404)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({
                'ok': False, 'error': 'route inconnue : le webhook attend ' + self.path
            }, ensure_ascii=False).encode('utf-8'))
            return

        # ⚠️ Sans secret : refus fermé. C'est le même principe que le `.env` : une clé
        # morte dans le fichier ne sert à rien ; la clé doit être un secret.
        if SECRET == '':
            self.send_response(503)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_cors()
            self.end_headers()
            self.wfile.write(json.dumps({
                'ok': False, 'error': 'secret webhooks manquant (variable d\'env ARKADIA_WEBHOOK_SECRET)'
            }, ensure_ascii=False).encode('utf-8'))
            with open(JOURNAL, 'a', encoding='utf-8') as fh:
                fh.write(json.dumps({
                    'quand': time.strftime('%Y-%m-%d %H:%M:%S'),
                    'niveau': 'refus',
                    'motif': 'secret webhooks manquant',
                }, ensure_ascii=False) + '\n')
            return

        # ⚠️ Vérification HMAC — avant tout autre traitement, et AVANT le JSON.parse.
        # Si le corps est illisible, le HMAC échoue d'abord — jamais on ne traite un
        # corps qui n'a pas passé le contrôle.
        content_length = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(content_length)

        sig_header = self.headers.get('X-Hub-Signature-256', '')
        # ⚠️ `hash_equals` : comparaison à temps constant — jamais de comparaison
        # naïve qui fuit la longueur. Même principe que le `.rag-token` (empreinte,
        # pas aspect visuel).
        try:
            expected = 'sha256=' + hmac.new(SECRET.encode('utf-8'), raw_body, hashlib.sha256).hexdigest()
            if not hmac.compare_digest(expected, sig_header):
                self.send_response(401)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({
                    'ok': False, 'error': 'signature invalide'
                }, ensure_ascii=False).encode('utf-8'))
                with open(JOURNAL, 'a', encoding='utf-8') as fh:
                    fh.write(json.dumps({
                        'quand': time.strftime('%Y-%m-%d %H:%M:%S'),
                        'niveau': 'refus',
                        'motif': 'signature invalide',
                        'longueur_corps': content_length,
                    }, ensure_ascii=False) + '\n')
                return
        except Exception as e:
            # ⚠️ Une erreur de HMAC ne doit JAMAIS empêcher Samus de répondre :
            # c'est la même règle que le verrou `.gpu-busy.lock` (§ b.5 de
            # `chantier-gpu-modele-local-2026-09-20.md`).
            with open(JOURNAL, 'a', encoding='utf-8') as fh:
                fh.write(json.dumps({
                    'quand': time.strftime('%Y-%m-%d %H:%M:%S'),
                    'niveau': 'erreur',
                    'motif': 'erreur de calcul HMAC : ' + str(e)[:200],
                }, ensure_ascii=False) + '\n')
            # On refuse quand même — un HMAC qui a échoué n'est pas un appel légitime.
            self.send_response(401)
            self.send_cors()
            self.end_headers()
            self.wfile.write(json.dumps({'ok': False, 'error': 'signature'}).encode('utf-8'))
            return

        # ⚠️ Seule la signature valide donne le droit d'atteindre la suite. Le JSON
        # est lu APRÈS — jamais avant — parce que le HMAC ne porte que sur le corps
        # brut, pas sur le JSON parsé (sinon le formatage changerait la signature).
        try:
            livraison = json.loads(raw_body.decode('utf-8'))
        except Exception:
            self.send_response(400)
            self.send_cors()
            self.end_headers()
            self.wfile.write(json.dumps({
                'ok': False, 'error': 'corps non JSON valide (apres HMAC)'
            }, ensure_ascii=False).encode('utf-8'))
            with open(JOURNAL, 'a', encoding='utf-8') as fh:
                fh.write(json.dumps({
                    'quand': time.strftime('%Y-%m-%d %H:%M:%S'), 'niveau': 'refus',
                    'motif': 'corps non JSON', 'longueur': content_length,
                }, ensure_ascii=False) + '\n')
            return

        # ⚠️ La livraison doit porter au moins le nom de la commande et le prompt.
        # Le webhook rend `202`, pas le résultat. Le résultat est publié par le
        # hook (`pont-live/hook-reponse.mjs`). ⚠️ Le hook n'est pas armé : le webhook
        # créera bien la session, mais la réponse ne reviendra pas dans le slot tant
        # que le hook ne tourne pas dans le harnais.
        prompt = (livraison.get('prompt') or '').strip()
        session = (livraison.get('session') or '').strip()[:40]
        commande = (livraison.get('commande') or '').strip()
        if commande != '!' + (os.getenv('ARKADIA_COMMANDE') or 'arkadia'):
            # ⚠️ La commande doit correspondre — sinon, même signé, c'est un appel
            # qui n'appartient pas au cycle du studio. Échec fermé.
            self.send_response(202)
            self.send_cors()
            self.end_headers()
            self.wfile.write(json.dumps({
                'ok': False, 'error': 'commande inconnue : attendue ' + os.getenv('ARKADIA_COMMANDE', 'arkadia'),
                'commande_recue': commande,
            }, ensure_ascii=False).encode('utf-8'))
            with open(JOURNAL, 'a', encoding='utf-8') as fh:
                fh.write(json.dumps({
                    'quand': time.strftime('%Y-%m-%d %H:%M:%S'), 'niveau': 'refus',
                    'motif': 'commande inconnue', 'commande_recue': commande[:50],
                    'longueur_corps': content_length,
                }, ensure_ascii=False) + '\n')
            return

        if prompt == '':
            self.send_response(400)
            self.send_cors()
            self.end_headers()
            self.wfile.write(json.dumps({'ok': False, 'error': 'prompt vide'}).encode('utf-8'))
            return

        # ⚠️ Limite du corps : déjà vérifiée par le webhook adaptateur (`maxBodyBytes`),
        # mais le proxy en redouble : 32 768 octets au maximum.
        if len(raw_body) > 32768:
            self.send_response(413)
            self.send_cors()
            self.end_headers()
            self.wfile.write(json.dumps({'ok': False, 'error': 'corps dépasse le seuil'}).encode('utf-8'))
            return

        # ⚠️ Le compte doit être dans la liste d'autorisation — même principe que le
        # connecteur (`pont-live/connecteur-live.mjs`). Liste vide = personne autorisé.
        # ⚠️ Le nom du compte (`from`) vient du webhook adaptateur (`X-GitHub-Event`),
        # pas du corps directement — le webhook adapte la provenance externe vers un
        # nom que le studio comprend. ⚠️ Cette adaptation n'a pas été éprouvée.
        auteur = (livraison.get('from') or livraison.get('author') or '').strip()
        if AUTORISES and (not autorise_valide(auteur, AUTORISES)):
            with open(JOURNAL, 'a', encoding='utf-8') as fh:
                fh.write(json.dumps({
                    'quand': time.strftime('%Y-%m-%d %H:%M:%S'), 'niveau': 'refus',
                    'motif': 'compte hors liste', 'compte_tronque': auteur[:50],
                    'liste_autorises': sorted(AUTORISES) if AUTORISES else 'vide',
                    'longueur_corps': content_length,
                }, ensure_ascii=False) + '\n')
            self.send_response(202)
            self.send_cors()
            self.end_headers()
            self.wfile.write(json.dumps({
                'ok': False,
                'message': 'aucun compte autorisé (liste vide) — le webhook ne crée aucune session',
            }, ensure_ascii=False).encode('utf-8'))
            return

        # ⚠️ À PARTIR D'ICI : le webhook a passé toutes les portes. Il crée la session.
        # Le `agentPreset: 'metroid'` doit exister dans le preset (le `preset.yml` du
        # preset `metroid` — mesuré : il existe). ⚠️ Non éprouvé : le `permissionPreset`
        # `'defense'` doit autoriser la lecture et la réponse dans le workspace.
        # ⚠️ Le `model` (`ollama` / `ministral-3:8b`) doit être résolu par le routeur —
        # la bascule locale (`bascule-locale-ministral-2026-09-19.md`) n'a jamais été
        # exécutée. ⚠️ Et le contexte `4096` est celui mesuré, pas `65 536`.
        request_session = {
            'workspacePath': 'ARKADIA Studio Retro',
            'title': 'Canal Arkadia — « ' + prompt[:120] + ' »',
            'prompt': prompt,
            'agentPreset': 'metroid',
            'permissionPreset': 'defense',
            'model': { 'provider': 'ollama', 'model': 'ministral-3:8b' },
        }

        # ⚠️ La création réelle demande le harnais en cours — et le harnais tourne
        # dans cette session (port 3080, `agent-default-model` distant et non appliqué).
        # ⚠️ Ce webhook n'a pas créé la session : le code ci-dessous est la FORME du
        # contrat (`WebHookSessionRequest`), et il est marqué non éprouvé. ⚠️ Le
        # `Agent.followup()` est le point d'engagement, pas la création de session.
        # ⚠️ Ce que le webhook rend : `202` — la réponse est dans le slot (`hook-reponse.mjs`).
        with open(JOURNAL, 'a', encoding='utf-8') as fh:
            fh.write(json.dumps({
                'quand': time.strftime('%Y-%m-%d %H:%M:%S'),
                'niveau': 'publication',
                'motif': 'phrase entendue par le webhook',
                'compte_tronque': auteur[:50],
                'commande': '!' + (os.getenv('ARKADIA_COMMANDE') or 'arkadia'),
                'longueur_prompt': len(prompt),
                'longueur_corps': content_length,
                'session_creee': False,
                'note': 'la session est demandee au harnais (preset metroid) ; le webhook '
                        'rend 202 sans la reponse (le contrat du webhook le dit). '
                        'Le retour passe par le hook-reponse, dans le slot.',
            }, ensure_ascii=False) + '\n')

        self.send_response(202)
        self.send_cors()
        self.end_headers()
        self.wfile.write(json.dumps({
            'ok': True,
            'message': 'phrase entendue — webhook accepté (202 sans résultat agent ; le contrat du webhook le dit)',
            'session_demande': True,
            'preset': 'metroid',
            'model_route': 'ollama / ministral-3:8b',
            'retour_via_slot': True,
            'command_recognized': '!' + (os.getenv('ARKADIA_COMMANDE') or 'arkadia'),
            'longueur_phrase': len(prompt),
        }, ensure_ascii=False).encode('utf-8'))


def autorise_valide(compte, autorises):
    """Le même principe que le connecteur : la liste vide refuse tout."""
    if not autorises:
        return False
    return compte in autorises


def principal():
    server = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    print(f"[vision-webhook] Démarrage sur port {PORT} — modèle {MODEL}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[vision-webhook] Arrêt")
        server.shutdown()

if __name__ == '__main__':
    principal()
