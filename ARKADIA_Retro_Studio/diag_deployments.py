"""État du deployment Mistral Workflows : workers vivants ? depuis quand ?

Rappel de sémantique (schéma du SDK, DeploymentResponse) :
  is_active           = « au moins un worker est actuellement vivant »
  active_worker_count = workers vivants dans la fenêtre de liveness
  worker_count        = workers enregistrés, vivants ou non

Donc `is_active: False` ne dit RIEN sur le versioning ni sur le build_id :
cela veut dire qu'aucun worker ne tournait au moment de l'appel.

Usage : uv run python diag_deployments.py
"""

from __future__ import annotations

import os
import sys

from dotenv import load_dotenv

load_dotenv(override=True)

from mistralai.workflows.client import get_mistral_client  # noqa: E402

NAME = os.environ.get("DEPLOYMENT_NAME", "EVA01-ARKADIA_Retro_Studio-bold-falcon")


def main() -> int:
    client = get_mistral_client(
        api_key=os.environ["MISTRAL_API_KEY"],
        server_url=os.environ.get("SERVER_URL", "https://api.mistral.ai"),
    )

    print(f"Deployment : {NAME}\n")

    try:
        detail = client.workflows.deployments.get_deployment(name=NAME)
    except Exception as exc:
        print(f"get_deployment a échoué : {type(exc).__name__}: {exc}", file=sys.stderr)
        return 1

    print("--- état ---")
    print(f"  id                  : {detail.id}")
    print(f"  is_active           : {detail.is_active}")
    print(f"  worker_count        : {detail.worker_count}")
    print(f"  active_worker_count : {detail.active_worker_count}")
    print(f"  created_at          : {detail.created_at}")
    print(f"  updated_at          : {detail.updated_at}")

    print("\n--- workers ---")
    if not detail.workers:
        print("  aucun worker enregistré")
    for worker in detail.workers:
        etat = "VIVANT" if worker.is_active else "mort"
        print(f"  {worker.name:<20} {etat:<7} dernier enregistrement : {worker.updated_at}")

    print("\n--- verdict ---")
    if detail.is_active:
        print("  Le deployment est actif : un worker répond.")
    else:
        print("  Aucun worker vivant. Lance-le, puis relance ce script :")
        print("      make start-worker")
        print("  (ou : uv run python -m entrypoints.dev)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
