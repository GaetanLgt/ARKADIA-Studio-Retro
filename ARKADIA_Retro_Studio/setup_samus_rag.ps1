[CmdletBinding()]
param(
    [string]$ProjectRoot = (Get-Location).Path,
    [ValidateSet('3000', '8080')]
    [string]$WebUiHostPort = '3000',
    [switch]$StartWorker,
    [switch]$SkipOpenWebUI
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Require-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Commande introuvable : $Name. Installe-la puis relance ce script."
    }
}

function Set-EnvValue([string]$Path, [string]$Name, [string]$Value) {
    $lines = @()
    if (Test-Path $Path) {
        $lines = @(Get-Content -LiteralPath $Path -Encoding UTF8)
    }

    $escaped = [regex]::Escape($Name)
    $found = $false
    $updated = foreach ($line in $lines) {
        if ($line -match "^\s*$escaped\s*=") {
            $found = $true
            "$Name=$Value"
        } else {
            $line
        }
    }

    if (-not $found) {
        $updated += "$Name=$Value"
    }

    Set-Content -LiteralPath $Path -Value $updated -Encoding UTF8
}

function Get-ContainerPort([string]$ContainerName) {
    $ports = docker inspect --format '{{range $p, $conf := .NetworkSettings.Ports}}{{if $conf}}{{(index $conf 0).HostPort}}{{end}}{{end}}' $ContainerName 2>$null
    return ($ports | Select-Object -First 1).Trim()
}

function Test-TcpPort([int]$Port) {
    return (Test-NetConnection -ComputerName '127.0.0.1' -Port $Port -WarningAction SilentlyContinue).TcpTestSucceeded
}

function Wait-TcpPort([int]$Port, [int]$TimeoutSeconds = 90) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-TcpPort $Port) {
            return $true
        }
        Start-Sleep -Seconds 2
    }
    return $false
}

try {
    $ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
    $srcPath = Join-Path $ProjectRoot 'src'
    $samusPath = Join-Path $srcPath 'workflows\samus_rag.py'
    $workerPath = Join-Path $srcPath 'entrypoints\worker.py'
    $envPath = Join-Path $ProjectRoot '.env'

    if (-not (Test-Path $samusPath)) {
        throw "Fichier Samus introuvable : $samusPath"
    }

    Require-Command 'docker'
    Require-Command 'uv'

    Write-Step 'Vérification de Docker'
    docker info *> $null
    Write-Ok 'Docker est disponible.'

    if (-not $SkipOpenWebUI) {
        Write-Step 'Configuration d’Open WebUI'
        $containerName = 'open-webui'
        $existing = docker ps -a --filter "name=^/$containerName$" --format '{{.Names}}' 2>$null

        if ($existing) {
            $status = docker inspect --format '{{.State.Running}}' $containerName
            if ($status -ne 'true') {
                docker start $containerName *> $null
                Write-Ok 'Conteneur Open WebUI démarré.'
            } else {
                Write-Ok 'Conteneur Open WebUI déjà actif.'
            }

            $detectedPort = Get-ContainerPort $containerName
            if ($detectedPort) {
                $WebUiHostPort = $detectedPort
            }
        } else {
            if (Test-TcpPort ([int]$WebUiHostPort)) {
                throw "Le port $WebUiHostPort est déjà utilisé par un autre service. Relance avec -WebUiHostPort 8080 ou libère le port."
            }

            docker volume create open-webui *> $null
            docker run -d `
                --name $containerName `
                --restart unless-stopped `
                -p "${WebUiHostPort}:8080" `
                -v 'open-webui:/app/backend/data' `
                --add-host 'host.docker.internal:host-gateway' `
                'ghcr.io/open-webui/open-webui:main' *> $null
            Write-Ok "Conteneur Open WebUI créé sur le port $WebUiHostPort."
        }

        Write-Step 'Attente d’Open WebUI'
        if (-not (Wait-TcpPort ([int]$WebUiHostPort))) {
            docker logs --tail 80 open-webui
            throw "Open WebUI ne répond pas sur le port $WebUiHostPort après 90 secondes. Les derniers logs sont affichés ci-dessus."
        }
        Write-Ok "Open WebUI répond sur http://127.0.0.1:$WebUiHostPort"
    }

    Write-Step 'Mise à jour de la configuration Samus'
    $webuiUrl = "http://127.0.0.1:$WebUiHostPort"
    $samusContent = Get-Content -LiteralPath $samusPath -Raw -Encoding UTF8
    $pattern = '(?m)^WEBUI_URL\s*=\s*["''][^"'']*["'']\s*$'
    $replacement = "WEBUI_URL = `"$webuiUrl`""

    if ($samusContent -match $pattern) {
        $samusContent = [regex]::Replace($samusContent, $pattern, $replacement)
    } else {
        $samusContent = "$replacement`r`n$samusContent"
    }

    Set-Content -LiteralPath $samusPath -Value $samusContent -Encoding UTF8
    Write-Ok "WEBUI_URL configurée : $webuiUrl"

    Write-Step 'Vérification du worker Samus'
    if (-not (Test-Path $workerPath)) {
        $workerDirectory = Split-Path -Parent $workerPath
        New-Item -ItemType Directory -Path $workerDirectory -Force *> $null
        @'
import asyncio
import mistralai.workflows as workflows
from workflows.samus_rag import SamusRagWorkflow


async def main() -> None:
    await workflows.run_worker([SamusRagWorkflow])


if __name__ == "__main__":
    asyncio.run(main())
'@ | Set-Content -LiteralPath $workerPath -Encoding UTF8
        Write-Ok 'worker.py créé.'
    } else {
        Write-Ok 'worker.py déjà présent : non modifié.'
    }

    Write-Step 'Vérification de .env'
    if (-not (Test-Path $envPath)) {
        New-Item -ItemType File -Path $envPath -Force *> $null
    }
    Set-EnvValue -Path $envPath -Name 'WORKFLOW_ID' -Value 'samus-rag'
    Write-Ok 'WORKFLOW_ID=samus-rag défini.'

    $envContent = Get-Content -LiteralPath $envPath -Raw -Encoding UTF8
    if ($envContent -notmatch '(?m)^\s*MISTRAL_API_KEY\s*=\s*\S+') {
        Write-Warn 'MISTRAL_API_KEY est absente du .env. Le worker Mistral ne pourra pas se connecter tant que tu ne l’ajoutes pas.'
    }
    if ($envContent -notmatch '(?m)^\s*RAG_TOKEN\s*=\s*\S+') {
        $fallbackToken = 'C:\IA\gl-digital-lab\.rag-token'
        if (-not (Test-Path $fallbackToken)) {
            Write-Warn 'RAG_TOKEN absente et fichier C:\IA\gl-digital-lab\.rag-token introuvable. Le RAG refusera la requête après démarrage.'
        }
    }

    Write-Host "`nConfiguration terminée." -ForegroundColor Green
    Write-Host "Open WebUI : $webuiUrl"
    Write-Host "Samus : $samusPath"
    Write-Host "`nEnsuite :" -ForegroundColor Yellow
    Write-Host "1. Ouvre $webuiUrl dans ton navigateur et importe/restaure tes collections si nécessaire."
    Write-Host "2. Lance le worker : uv run python -m entrypoints.worker"
    Write-Host "3. Dans un second terminal : uv run python -m entrypoints.start --workflow samus-rag --interactive"

    if ($StartWorker) {
        Write-Step 'Démarrage du worker Samus'
        Push-Location $ProjectRoot
        try {
            uv run python -m entrypoints.worker
        } finally {
            Pop-Location
        }
    }
} catch {
    Write-Host "`nÉCHEC : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
