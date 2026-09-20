"""Teste la chaîne RAG Open WebUI sans worker ni Temporal.

C'est le script à lancer quand `query_rag` échoue : il isole les quatre causes
possibles (port mort, jeton refusé, route changée, collection vide) au lieu de
te rendre une trace httpx de 80 lignes.

Usage : uv run python diag_rag.py [question]
"""

from __future__ import annotations

import os
import sys

import httpx
from dotenv import load_dotenv

load_dotenv(override=True)

sys.path.insert(0, "src")
from workflows.samus_rag import CARNETS, QUERY_ENDPOINT, WEBUI_URL, _rag_token  # noqa: E402

QUESTION = " ".join(sys.argv[1:]) or "test de connexion"


def etape(titre: str) -> None:
    print(f"\n--- {titre} ---")


def main() -> int:
    print(f"RAG_URL  : {WEBUI_URL}")
    print(f"endpoint : {QUERY_ENDPOINT}")

    etape("1. le port répond-il ?")
    try:
        health = httpx.get(f"{WEBUI_URL}/health", timeout=5.0)
        print(f"  OK — HTTP {health.status_code}")
    except httpx.ConnectError:
        print(f"  ÉCHEC — rien n'écoute sur {WEBUI_URL}")
        print("  → Open WebUI est arrêté, ou son port n'est pas publié côté Windows.")
        print("  → Vérifie : curl.exe http://127.0.0.1:8080/health")
        print("  → Si le conteneur tourne dans WSL2 : docker ps, et contrôle le -p 8080:8080")
        return 1
    except httpx.HTTPError as exc:
        print(f"  ÉCHEC — {type(exc).__name__}: {exc}")
        return 1

    etape("2. le jeton est-il de la bonne nature ?")
    try:
        token = _rag_token()
    except RuntimeError as exc:
        print(f"  ÉCHEC — {exc}")
        return 1

    if token.startswith("sk-"):
        print(f"  clé d'API Open WebUI ({len(token)} caractères)")
    elif token.startswith("eyJ"):
        print(f"  ÉCHEC — ce n'est pas une clé d'API mais un JWT de session "
              f"navigateur ({len(token)} caractères).")
        print("  → Il expire avec la session et meurt à chaque redémarrage du")
        print("    conteneur. Une vraie clé ressemble à sk- + 32 caractères hex.")
        print("  → Open WebUI → Paramètres → Compte → Clés API → Créer une clé.")
        print("  → Colle-la dans .env : RAG_TOKEN=sk-...")
        return 1
    else:
        print(f"  jeton de forme inattendue ({len(token)} caractères, "
              f"commence par {token[:3]!r})")

    etape("3. le jeton est-il accepté ?")
    headers = {"Authorization": f"Bearer {token}"}
    who = httpx.get(f"{WEBUI_URL}/api/v1/auths/", headers=headers, timeout=10.0)
    if who.status_code in (401, 403):
        print(f"  ÉCHEC — HTTP {who.status_code} : clé refusée.")
        print("  → La clé a-t-elle été remplacée par une plus récente sur le")
        print("    même compte ? Le compte est-il encore actif ?")
        print("  → ENABLE_API_KEYS est-il bien activé côté serveur ?")
        return 1
    print(f"  OK — HTTP {who.status_code}")

    etape("4. la route de requête existe-t-elle ?")
    carnet = os.environ.get("DIAG_CARNET", "agence")
    payload = {
        "collection_names": [CARNETS[carnet]],
        "query": QUESTION,
        "k": 3,
    }
    resp = httpx.post(QUERY_ENDPOINT, headers=headers, json=payload, timeout=60.0)
    if resp.status_code == 404:
        print(f"  ÉCHEC — HTTP 404 sur {QUERY_ENDPOINT}")
        print("  → la route a changé de nom dans cette version d'Open WebUI.")
        return 1
    if resp.status_code in (401, 403):
        print(f"  ÉCHEC — HTTP {resp.status_code} alors que l'étape 3 passait.")
        print("  → ENABLE_API_KEY_ENDPOINT_RESTRICTIONS est probablement actif et")
        print("    cette route n'est pas dans API_KEY_ALLOWED_ENDPOINTS.")
        return 1
    if resp.status_code >= 400:
        print(f"  ÉCHEC — HTTP {resp.status_code} : {resp.text[:400]}")
        return 1
    print(f"  OK — HTTP {resp.status_code}")

    etape(f"5. le carnet '{carnet}' renvoie-t-il des extraits ?")
    data = resp.json()
    documents = (data.get("documents") or [[]])[0]
    metadatas = (data.get("metadatas") or [[]])[0]
    if not documents:
        print("  VIDE — la collection existe mais ne renvoie rien pour cette question.")
        print(f"  → uuid interrogé : {CARNETS[carnet]}")
        return 1
    print(f"  OK — {len(documents)} extrait(s)")
    for index, (document, metadata) in enumerate(zip(documents, metadatas), start=1):
        source = (metadata or {}).get("name", "source inconnue")
        apercu = " ".join((document or "").split())[:120]
        print(f"    [{index}] {source} — {apercu}…")

    print("\nChaîne RAG complète : OK.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
