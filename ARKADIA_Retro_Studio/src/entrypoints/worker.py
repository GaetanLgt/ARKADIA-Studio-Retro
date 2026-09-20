import asyncio
import mistralai.workflows as workflows

from workflows.samus_rag import SamusRagWorkflow


async def main() -> None:
    await workflows.run_worker([SamusRagWorkflow])


if __name__ == "__main__":
    asyncio.run(main())