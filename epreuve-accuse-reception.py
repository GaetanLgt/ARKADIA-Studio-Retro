# -*- coding: utf-8 -*-
"""epreuve-accuse-reception.py — l'épreuve de l'accusé de réception, SANS MICRO.

CE QU'ELLE PROUVE, ET CE QU'ELLE NE PROUVE PAS
──────────────────────────────────────────────────────────────────────────────
Elle exerce **le publieur** du service de voix (`publier_entendu`) et le slot unique
qu'il écrit. Elle N'OUVRE PAS LE MICRO : elle n'appelle jamais `/ecouter` ni
`/ecouter-auto`, elle appelle seulement la fonction qui publie. *Une épreuve qui
demande à un humain de parler n'est pas une épreuve, c'est une répétition.*

Ce qu'elle n'établit PAS : que la route `/ecouter-auto` appelle bien le publieur —
ça se lit dans le fichier, ça ne se mesure qu'avec une phrase réelle. C'est écrit
dans la fiche, section « ce que ce chantier n'établit pas ».

LE TEXTE D'ÉPREUVE EST MARQUÉ COMME TEL, ET C'EST VOLONTAIRE : si ce texte
apparaissait un jour sur le Bureau, il dirait de lui-même qu'il est une épreuve —
jamais une phrase de Gaëtan.

USAGE
    python epreuve-accuse-reception.py            le publieur écrit, on relit
    python epreuve-accuse-reception.py --nettoyer  on efface le slot d'épreuve
"""

import importlib.util
import json
import os
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

# Le service est nommé avec un tiret : `import serveur-voix` est impossible.
# On le charge donc PAR SON CHEMIN — c'est le fichier du poste, jamais une copie.
CHEMIN_SERVICE = r"C:\IA\gl-digital-lab\poste-local\serveur-voix.py"
TEXTE_EPREUVE = ("ÉPREUVE — ceci est un texte d'essai, pas une phrase entendue "
                 "par le poste. Accents, apostrophes et guillemets compris.")
# La phrase que la ROUTE rendra à l'étape 6 : elle est fausse exprès, et elle le dit.
PHRASE_DE_LA_ROUTE = "phrase d'épreuve rendue par la route, aucun micro n'a été ouvert"


def charger_service():
    """Charge serveur-voix.py sans démarrer le service (main() est sous __main__).

    ⚠️ Il FAUT mettre le dossier du service dans `sys.path` : `serveur-voix.py`
    importe `purge_voix` (ligne 1209, un module voisin). Lancé depuis un autre
    dossier, l'import levait `ModuleNotFoundError: No module named 'purge_voix'` —
    mesuré le 20/09/2026. *Un module qui importe son voisin suppose son dossier ;
    le lancer d'ailleurs est une preuve qu'on ne l'a pas éprouvé.*
    """
    dossier = os.path.dirname(CHEMIN_SERVICE)
    if dossier not in sys.path:
        sys.path.insert(0, dossier)
    spec = importlib.util.spec_from_file_location("service_voix_epreuve", CHEMIN_SERVICE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)      # n'ouvre pas le micro, ne lie aucun port
    return module


def main():
    sv = charger_service()
    print("═" * 74)
    print("  ÉPREUVE DE L'ACCUSÉ DE RÉCEPTION — sans micro, sans service arrêté")
    print("═" * 74)
    print(f"  service chargé   : {CHEMIN_SERVICE}")
    print(f"  slot (publieur)  : {sv.FICHIER_ENTENDU}")
    print(f"  durée annoncée   : {sv.ENTENDU_TTL_S} s")

    if "--nettoyer" in sys.argv:
        try:
            os.remove(sv.FICHIER_ENTENDU)
            print("  → slot d'épreuve EFFACÉ.")
        except FileNotFoundError:
            print("  → rien à effacer (le slot n'existait pas).")
        return 0

    # 0. `/sante` tel que le NOUVEAU code le rend — sans lancer le service, donc sans
    #    charger Whisper sur le GPU (un seul job GPU à la fois, règle du studio).
    #    C'est la pièce qui empêche `/sante` de mentir : il déclare l'exception.
    if "--sante" in sys.argv:
        s = sv.sante()
        print("  /sante (nouveau code, importé — aucun modèle chargé) :")
        print("    journal_de_conversation : " + str(s["journal_de_conversation"]))
        print("    entendu                 : " + json.dumps(s["entendu"], ensure_ascii=False))
        return 0

    # 1. Un texte vide ne publie RIEN — c'est la borne qui évite d'afficher une
    #    transcription rejetée (hallucination filtrée) comme si elle avait été dite.
    avant = os.path.exists(sv.FICHIER_ENTENDU)
    rien = sv.publier_entendu("   ", langue="fr", secondes=1.0)
    print(f"\n  1. texte vide → publication : {rien} "
          f"(attendu None) · slot inchangé : {os.path.exists(sv.FICHIER_ENTENDU) == avant}")

    # 2. La publication réelle, dans le slot unique.
    e = sv.publier_entendu(TEXTE_EPREUVE, langue="fr", secondes=2.3, duree_ms=21267,
                           oreille_ms=980, motif="fin de phrase detectee",
                           origine="épreuve — aucun micro n'a été ouvert")
    print(f"  2. publication → id {e['id']} · expire_le {e['expire_le']} "
          f"· compteur entendu_publies = {sv.ETAT['entendu_publies']}")

    # 3. Ce qui est RÉELLEMENT sur le disque, relu par un autre lecteur.
    brut = open(sv.FICHIER_ENTENDU, encoding="utf-8").read()
    d = json.loads(brut)
    print(f"  3. relu du disque ({len(brut.encode('utf-8'))} octets UTF-8) :")
    for cle in ("id", "quand", "expire_le", "ttl_s", "langue", "secondes_captees",
                "duree_ms", "motif", "micro", "origine"):
        print(f"       {cle:<20} = {d.get(cle)}")
    print(f"       texte                = « {d['texte'][:60]}… »")

    # 4. Le fichier dit-il ce qu'il est ? Un slot qui ne dit pas qui l'écrit ni qui
    #    l'efface est un fichier qu'on retrouve dans six mois sans savoir quoi en faire.
    print(f"  4. traçabilité : écrit par « {d.get('ecrit_par')} » · "
          f"lu et effacé par « {d.get('lu_et_efface_par')} »")

    # 5. Les bornes de vie privée, affirmées telles qu'elles sont tenues.
    print(f"  5. bornes : hors du dossier servi = "
          f"{'poste-local' not in sv.FICHIER_ENTENDU} · un seul slot = "
          f"{'jsonl' not in sv.FICHIER_ENTENDU} (pas un journal à lignes) · "
          f"TTL = {d['ttl_s']} s")

    # 6. LA ROUTE ELLE-MÊME — la seule preuve qui manquait, et elle ne demande PAS
    #    de micro : on substitue l'oreille (`enregistrer_jusqu_au_silence`) et le
    #    transcripteur (`transcrire`) par des doublures, et on APPELLE `do_POST` pour
    #    de vrai. C'est la route du fichier qui tourne, pas une copie de sa logique.
    #    *Un câblage qui n'est pas éprouvé est un câblage qu'on espère.*
    print("\n  6. épreuve de la ROUTE /ecouter-auto (oreille et transcripteur doublés) :")
    sv.publier_entendu("efface-moi", origine="épreuve — état de départ")
    depart = json.load(open(sv.FICHIER_ENTENDU, encoding="utf-8"))["id"]
    sv.enregistrer_jusqu_au_silence = lambda **k: (
        sv.WAV_QUESTION, 2.3, True, "fin de phrase detectee", -38.1)
    sv.transcrire = lambda wav: (PHRASE_DE_LA_ROUTE, "fr")

    class FauxHandler(sv.Handler):
        """Un Handler sans socket : on ne veut pas du réseau, on veut du CÂBLAGE."""
        def __init__(self, chemin, corps):
            self.path = chemin
            self.command = "POST"
            self.octets = json.dumps(corps).encode("utf-8")
            self.headers = {"Content-Length": str(len(self.octets)),
                            "Content-Type": "application/json"}
            self.rfile = __import__("io").BytesIO(self.octets)
            self.wfile = __import__("io").BytesIO()

        def log_message(self, *a):
            pass

        def send_response(self, *a, **k):
            pass

        def send_header(self, *a, **k):
            pass

        def end_headers(self):
            pass

    h = FauxHandler("/ecouter-auto", {"max_secondes": 20})
    h.do_POST()
    reponse = json.loads(h.wfile.getvalue().decode("utf-8"))
    print(f"       réponse de la route : ok={reponse.get('ok')} · "
          f"parole_detectee={reponse.get('parole_detectee')} · "
          f"motif={reponse.get('motif')} · texte=« {reponse.get('texte')} »")

    apres = json.load(open(sv.FICHIER_ENTENDU, encoding="utf-8"))
    different = apres["id"] != depart
    meme_phrase = apres.get("texte") == PHRASE_DE_LA_ROUTE
    print(f"       le slot a-t-il CHANGÉ d'entrée : {different} · "
          f"porte-t-il la phrase de la route : {meme_phrase}")
    print(f"       provenance publiée : « {apres.get('origine')} » · "
          f"coupure : {apres.get('motif')}")
    print(f"       → la route /ecouter-auto publie : {different and meme_phrase}")

    print("\n  ⚠️ Ce que cette épreuve n'établit TOUJOURS PAS : que la transcription")
    print("     d'une VRAIE phrase arrive jusqu'au bandeau. Ici Whisper est doublé et")
    print("     le service en cours n'est pas celui-ci (il tourne sur le code d'avant,")
    print("     chargé en mémoire). Il faut UNE phrase réelle après redémarrage —")
    print("     c'est écrit dans la fiche, section « ce que ce chantier n'établit pas ».")
    return 0


if __name__ == "__main__":
    sys.exit(main())
