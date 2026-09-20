# veille-lot.ps1 — recuperer les sous-titres de veille EN LOT, sans se faire couper
#
# Ecrit le 20/09/2026 apres un HTTP 429. Ce qui a change la donne :
#
#   ⛔ La fiche du studio disait : « le 429 vient de --sub-langs "fr.*,en.*" ».
#      C'est INCOMPLET, et je l'ai paye deux fois ce matin :
#      **le 429 vient AUSSI de la CADENCE.** Cinq videos en quelques minutes -> YouTube coupe.
#
#   ⭐ D'ou ce script : UNE video a la fois, une PAUSE entre chaque, et on ne
#      retente pas en boucle. C'est « au premier plantage on s'arrete », applique au reseau.
#
# USAGE :
#   1. mets les identifiants dans  veille-a-traiter.txt   (un par ligne, rien d'autre)
#   2. lance :  & .\veille-lot.ps1
#   3. les rates sont ecrits dans    veille-echecs.txt    -> relance plus tard
#
param(
  [string]$Liste   = "C:\IA\gl-digital-lab\veille-video\veille-a-traiter.txt",
  [string]$Sortie  = "C:\IA\gl-digital-lab\veille-video\transcriptions",
  [int]$PauseS     = 25,     # ⭐ LE parametre qui compte : la cadence
  [switch]$Forcer            # retelecharger meme si le fichier existe deja
)

$env:PATH += ";C:\Program Files\nodejs"   # ⚠️ piege ⓪ : node n'est PAS dans le PATH sur EVA-01

if (-not (Test-Path $Liste)) { New-Item -ItemType File -Path $Liste -Force | Out-Null; Write-Host "Liste creee (vide) : $Liste"; exit 0 }
$ids = Get-Content $Liste | Where-Object { $_.Trim() -ne '' -and $_ -notmatch '^#' } | ForEach-Object { $_.Trim() }
if (-not $ids) { Write-Host "La liste est vide. Ajoute des identifiants dans $Liste"; exit 0 }

# reprendre les echecs precedents
$echecs = @()
if (Test-Path "C:\IA\gl-digital-lab\veille-video\veille-echecs.txt") {
  $echecs = @(Get-Content "C:\IA\gl-digital-lab\veille-video\veille-echecs.txt" | Where-Object { $_.Trim() -ne '' })
  $ids = @($ids + $echecs) | Select-Object -Unique
}

Write-Host ""
Write-Host "  $($ids.Count) identifiant(s) a traiter · pause de $PauseS s entre chaque" -ForegroundColor Cyan
Write-Host ""

$ok = 0; $skipped = 0; $rates = @()
foreach ($id in $ids) {
  # deja la ? — dans les DEUX formes : transcription locale (meilleure) ou sous-titres YouTube
  $local = Get-ChildItem $Sortie -Filter "*$id*whisper*"  -ErrorAction SilentlyContinue
  $youtube = Get-ChildItem $Sortie -Filter "*$id*fr*.vtt" -ErrorAction SilentlyContinue

  if ($local -and -not $Forcer) {
    Write-Host ("  [SKIP] {0}  -- DEJA TRANSCRIT EN LOCAL (meilleur que YouTube)" -f $id) -ForegroundColor DarkGray
    $skipped++; continue
  }
  if ($youtube -and -not $Forcer) {
    Write-Host ("  [SKIP] {0}  -- deja telecharge" -f $id) -ForegroundColor DarkGray
    $skipped++; continue
  }

  Write-Host ("  [{0}] {1} ... " -f $ok, $id) -NoNewline
  $res = & yt-dlp --js-runtimes node --cookies-from-browser firefox `
                  --skip-download --write-auto-subs --write-subs `
                  --sub-langs "fr.*" --sub-format vtt `
                  -o (Join-Path $Sortie "%(id)s.%(ext)s") `
                  "https://www.youtube.com/watch?v=$id" 2>&1
  $erreur = $res | Select-String -Pattern "429|ERROR|bot|Sign in" | Select-Object -Last 1
  if ($erreur) {
    Write-Host "ECHEC" -ForegroundColor Red
    Write-Host ("         {0}" -f $erreur.Line.Trim()) -ForegroundColor DarkRed
    $rates += $id
  } else {
    $f = Get-ChildItem $Sortie -Filter "*$id*" -ErrorAction SilentlyContinue
    if ($f) { Write-Host ("OK  ({0:N0} o)" -f ($f[0].Length)) -ForegroundColor Green; $ok++ }
    else    { Write-Host "RIEN ECRIT (c'est le piege : le code sort 0 et rien n'est ecrit)" -ForegroundColor Red; $rates += $id }
  }
  Start-Sleep -Seconds $PauseS     # <- la cadence
}

$fichierEchecs = "C:\IA\gl-digital-lab\veille-video\veille-echecs.txt"
if ($rates.Count) { $rates | Set-Content -LiteralPath $fichierEchecs -Encoding UTF8 } else { Remove-Item -LiteralPath $fichierEchecs -ErrorAction SilentlyContinue }

Write-Host ""
Write-Host ("  Bilan : {0} recupere(s) · {1} deja la · {2} en echec" -f $ok, $skipped, $rates.Count) -ForegroundColor Cyan
if ($rates.Count) { Write-Host "  Rates, a relancer plus tard : $($rates -join ' ')" -ForegroundColor Yellow
                    Write-Host "  Ils sont dans veille-echecs.txt — le prochain lancement les reprend tout seuls." -ForegroundColor DarkGray }
