# samus-boucle-locale.ps1 — le vase clos : ta voix -> son cerveau -> ta voix
#
# Ecrit le 20/09/2026 pour Gaëtan. EVA01.
#
# CE QUE CA FAIT
#   boucle : /ecouter-auto  ->  /demander  ->  /dire (dans /demander)
#   Tout en local, sur le port 8150. Rien ne sort de la machine.
#
# POURQUOI C'EST EN SERIE, ET PAS EN PARALLELE — ce n'est pas un detail, c'est LE point
#   Le casque de Gaëtan est A LA FOIS le micro et la sortie (Stealth 600X Gen 3,
#   USB Audio Class). Quand Samus parle, sa voix entre dans son propre micro.
#   Le studio a mesure ce defaut le 17/09/2026 (discord-bot/oreille.js, ligne ~415) :
#   le bot se repondait INDEFINIMENT.
#   -> Une boucle SEQUENTIELLE est un demi-duplex par construction : on n'ecoute pas
#      pendant qu'elle parle. C'est la garde la plus simple qui existe, et elle suffit ici.
#   -> La pause de $ReposApresVoix secondes laisse retomber la queue de son propre son.
#
# CE QUE CA N'EST PAS
#   - Pas de mot declencheur, pas d'ecoute permanente cachee : la boucle s'arrete avec
#     Ctrl+C, et elle est bornee par -Tours.
#   - Pas de journal de conversation : seuls le texte entendu et la reponse sont ecrits
#     dans la console. Rien n'est conserve sur le disque.
#
param(
  [int]$Tours = 3,              # combien d'echanges avant de s'arreter
  [int]$ReposApresVoix = 2      # secondes de silence apres sa voix, avant de reecouter
)

$Base = "http://127.0.0.1:8150"
$Json = @{ "Content-Type" = "application/json; charset=utf-8" }

function Poste($route, $corps) {
  $octets = [System.Text.Encoding]::UTF8.GetBytes(($corps | ConvertTo-Json -Compress))
  Invoke-RestMethod -Uri "$Base/$route" -Method Post -Headers $Json -Body $octets -TimeoutSec 240
}

Write-Host ""
Write-Host "  VASE CLOS — $Tours echange(s). Parle, elle attend la fin de ta phrase." -ForegroundColor Cyan
Write-Host "  Pour arreter : Ctrl+C." -ForegroundColor DarkGray
Write-Host ""

for ($i = 1; $i -le $Tours; $i++) {
  Write-Host "  [$i/$Tours] elle ecoute..." -ForegroundColor DarkGray
  # ⚠️ silence_ms EST PASSÉ EXPLICITEMENT, ET CE N'EST PAS UNE PRECAUTION INUTILE.
  # Mesure du 20/09/2026 (chantier-seuil-parole) : le defaut du service etait 900 ms,
  # et le processus VIVANT garde sa valeur en memoire — il n'a pas de rechargement a chaud.
  # Le reglage corrige (1800 ms) vit dans le FICHIER ; seul un appelant qui le passe
  # explicitement en beneficie. Un appel sans silence_ms retombe sur 900 en memoire
  # -> et coupe la parole ENCORE PLUS VITE que les 1100 ms qui l'ont coupee.
  try { $e = Poste "ecouter-auto" @{ silence_ms = 1800 } }
  catch { Write-Host "  ecoute impossible : $($_.Exception.Message)" -ForegroundColor Red; break }

  # ⚠️ GARDE AJOUTEE APRES UN ECHEC MESURE, le 20/09/2026 a 05h40 (premier essai de cette boucle).
  # Ce qui s'est passe : 5,5 s d'audio capturees, motif « fin de phrase detectee », et `texte` VIDE.
  # La boucle a quand meme appele /demander avec une question vide -> le service a repondu
  # **422 (Unprocessable Entity)** et la boucle est morte.
  # Une transcription vide n'est pas une question : on ne l'envoie pas au cerveau.
  # Corollaire du studio : un « ok:true » sur l'ecoute ne dit rien de la qualite de ce qui a ete entendu.
  if (-not $e.parole_detectee -or -not $e.texte -or $e.texte.Trim().Length -lt 2) {
    Write-Host "  (rien d'exploitable — bruit de fond ou silence) : $($e.secondes_captees) s capturees, texte vide" -ForegroundColor DarkYellow
    continue
  }
  Write-Host "  ENTENDU  : $($e.texte)" -ForegroundColor White
  Write-Host "             ($($e.secondes_captees) s d'audio, motif : $($e.motif))" -ForegroundColor DarkGray

  Write-Host "  elle reflechit..." -ForegroundColor DarkGray
  try { $d = Poste "demander" @{ question = $e.texte; voix = "piper" } }
  catch { Write-Host "  cerveau injoignable : $($_.Exception.Message)" -ForegroundColor Red; break }

  Write-Host "  REPONDU  : $($d.reponse)" -ForegroundColor Green
  Write-Host "             (cerveau $($d.cerveau_ms) ms · voix $($d.voix_ms) ms · rien ne sort : $(-not $d.sorti_de_la_machine))" -ForegroundColor DarkGray
  Write-Host ""
  Start-Sleep -Seconds $ReposApresVoix
}

Write-Host "  Boucle terminee." -ForegroundColor Cyan
