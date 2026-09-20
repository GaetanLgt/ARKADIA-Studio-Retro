"""Déclenche un workflow Mistral depuis la ligne de commande."""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from typing import Any

from dotenv import load_dotenv
from mistralai.workflows.client import get_mistral_client


load_dotenv(override=True)

DEFAULT_WORKFLOW = os.environ.get("WORKFLOW_ID", "samus-rag").strip()
VALID_CARNETS = {"agence", "metroid", "arkadia"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Exécute un workflow Mistral, notamment Samus RAG.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples PowerShell :
  uv run python -m entrypoints.start --workflow samus-rag --input '{"question":"Salut Samus","carnet":"agence","k":5}'
  uv run python -m entrypoints.start --interactive
        """.strip(),
    )

    parser.add_argument(
        "--workflow",
        default=DEFAULT_WORKFLOW,
        help=(
            "Nom ou UUID du workflow à exécuter "
            f"(défaut : {DEFAULT_WORKFLOW!r})."
        ),
    )

    parser.add_argument(
        "--input",
        dest="input_json",
        default=None,
        help=(
            "Entrée JSON du workflow. Exemple : "
            '\'{"question":"Salut","carnet":"agence","k":5}\''
        ),
    )

    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Demande la question et le carnet dans le terminal.",
    )

    return parser.parse_args()


def validate_samus_input(payload: dict[str, Any]) -> dict[str, Any]:
    """Valide et normalise l'entrée attendue par SamusRagInput."""
    question = payload.get("question")

    if not isinstance(question, str) or not question.strip():
        raise ValueError(
            "Le champ JSON obligatoire 'question' doit être une chaîne non vide."
        )

    carnet = str(payload.get("carnet", "agence")).strip().lower()
    carnet = carnet.rstrip("!?.;, ").strip() or "agence"

    if carnet not in VALID_CARNETS:
        valeurs = ", ".join(sorted(VALID_CARNETS))
        raise ValueError(
            f"Champ 'carnet' invalide : {carnet!r}. "
            f"Valeurs possibles : {valeurs}."
        )

    k = payload.get("k", 5)

    if isinstance(k, bool):
        raise ValueError("Le champ 'k' doit être un entier entre 1 et 20.")

    try:
        k = int(k)
    except (TypeError, ValueError) as exc:
        raise ValueError(
            "Le champ 'k' doit être un entier entre 1 et 20."
        ) from exc

    if not 1 <= k <= 20:
        raise ValueError("Le champ 'k' doit être compris entre 1 et 20.")

    return {
        "question": question.strip(),
        "carnet": carnet,
        "k": k,
    }


def get_interactive_input() -> dict[str, Any]:
    """Construit l'entrée Samus depuis le terminal."""
    question = input("\nQuestion pour Samus : ").strip()
    carnet = input(
        "Carnet [agence / metroid / arkadia] (agence) : "
    ).strip()

    return validate_samus_input(
        {
            "question": question,
            "carnet": carnet or "agence",
            "k": 5,
        }
    )


def get_json_input(raw_input: str) -> dict[str, Any]:
    """Parse et valide l'argument --input."""
    try:
        payload = json.loads(raw_input)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "L'argument --input doit être un JSON valide. "
            "Exemple : "
            '\'{"question":"Salut Samus","carnet":"agence","k":5}\''
        ) from exc

    if not isinstance(payload, dict):
        raise ValueError(
            "L'argument --input doit représenter un objet JSON, pas une liste "
            "ni une valeur simple."
        )

    return validate_samus_input(payload)


async def main() -> None:
    args = parse_args()

    if args.interactive and args.input_json is not None:
        raise ValueError(
            "Utilise soit --interactive, soit --input, mais pas les deux."
        )

    if args.interactive:
        workflow_input = get_interactive_input()
    elif args.input_json is not None:
        workflow_input = get_json_input(args.input_json)
    else:
        raise ValueError(
            "Aucune entrée fournie. Utilise --input '<json>' "
            "ou le mode --interactive."
        )

    workflow_identifier = args.workflow.strip()

    if not workflow_identifier:
        raise ValueError(
            "Le nom ou l'UUID du workflow ne peut pas être vide."
        )

    print(f"\nWorkflow : {workflow_identifier}")
    print(f"Carnet : {workflow_input['carnet']}")
    print("Interrogation du workflow Samus RAG…\n")

    client = get_mistral_client()

    try:
        result = await client.workflows.execute_workflow_and_wait_async(
            workflow_identifier=workflow_identifier,
            input=workflow_input,
        )
    except Exception as exc:
        print("\n--- ÉCHEC DU WORKFLOW ---", file=sys.stderr)
        print(f"Type : {type(exc).__name__}", file=sys.stderr)
        print(f"Message : {exc}", file=sys.stderr)
        print(f"Représentation : {exc!r}", file=sys.stderr)

        for attribute in (
            "execution_id",
            "workflow_execution_id",
            "run_id",
            "status",
            "detail",
            "response",
            "body",
        ):
            value = getattr(exc, attribute, None)
            if value is not None:
                print(f"{attribute} : {value!r}", file=sys.stderr)

        raise

    print("Réponse de Samus :\n")
    print(result)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nExécution annulée.", file=sys.stderr)
        raise SystemExit(130)
    except Exception as exc:
        print(f"\nErreur : {exc}", file=sys.stderr)
        raise SystemExit(1)