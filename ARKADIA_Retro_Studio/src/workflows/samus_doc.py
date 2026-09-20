"""Samus Doc — répond aux questions en s'appuyant sur la documentation du studio ARKADIA."""

from pathlib import Path

import mistralai.workflows as workflows
from pydantic import BaseModel

# Dossiers de documentation (hors projet code)
DOC_ROOT = Path(r"C:\Users\neosp\Desktop\ARKADIA Studio Retro")
DOC_DIRS = [
    "01-LE-SAS-et-sa-structure",
    "02-LE-DOSSIER-DU-28-SEPTEMBRE",
    "03-LES-AIDES-ET-LE-FINANCEMENT",
    "04-LE-PROJET-ET-SES-PREUVES",
    "05-LES-QUESTIONS-A-POSER",
    "06-L-ETAT-DU-STUDIO",
]
MAX_CHARS_PER_FILE = 8000  # tronque les fichiers très longs
MAX_TOTAL_CHARS = 120_000  # garde-fou global

SYSTEM_PROMPT = """Tu es Samus, l'assistante IA personnelle de Gaetan pour son studio ARKADIA Retro Studio.
Tu réponds en français, de façon directe et utile, sans blabla.
Tu t'appuies EXCLUSIVEMENT sur la documentation fournie ci-dessous pour répondre.
Si la réponse ne s'y trouve pas, dis-le clairement au lieu d'inventer.
Quand c'est pertinent, cite le nom du fichier d'où vient l'information."""


@workflows.activity()
async def load_doc() -> str:
    """Charge et concatène la documentation du studio."""
    parts: list[str] = []
    total = 0
    for dir_name in DOC_DIRS:
        for path in sorted((DOC_ROOT / dir_name).glob("*.md")):
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            if len(text) > MAX_CHARS_PER_FILE:
                text = text[:MAX_CHARS_PER_FILE] + "\n[...tronqué...]"
            header = f"### FICHIER : {dir_name}/{path.name}\n"
            parts.append(header + text)
            total += len(header) + len(text)
            if total > MAX_TOTAL_CHARS:
                parts.append("\n[Limite de contexte atteinte — documentation partielle]")
                break
    if not parts:
        return "Aucune documentation trouvée."
    return "\n\n---\n\n".join(parts)


@workflows.activity()
async def answer_with_doc(question: str, doc: str) -> str:
    """Répond à la question en s'appuyant sur la documentation."""
    prompt = f"""Documentation du studio ARKADIA :

{doc}

---

Question de Gaetan : {question}"""

    request = workflows_mistralai.ChatCompletionRequest(
        model="mistral-medium-latest",
        messages=[
            workflows_mistralai.SystemMessage(content=SYSTEM_PROMPT),
            workflows_mistralai.UserMessage(content=prompt),
        ],
    )
    response = await workflows_mistralai.mistralai_chat_complete(request)
    try:
        return response.choices[0].message.content or ""
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(f"Réponse inattendue du modèle : {response!r}") from exc


class SamusDocInput(BaseModel):
    question: str


@workflows.workflow.define(
    name="samus-doc",
    workflow_display_name="Samus Doc",
    workflow_description="Répond aux questions en s'appuyant sur la documentation du studio ARKADIA.",
)
class SamusDocWorkflow:
    @workflows.workflow.entrypoint
    async def run(self, input: SamusDocInput) -> str:
        doc = await load_doc()
        return await answer_with_doc(input.question, doc)
