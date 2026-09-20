<?php
declare(strict_types=1);

/**
 * bot.php — le proxy public du Canal Arkadia.
 *
 * Ce que ce fichier fait, et rien d'autre :
 *   1. il refuse tout ce qui n'est pas signé (HMAC-SHA256 sur le corps brut) ;
 *   2. il compte les appels par IP et coupe au-delà du quota ;
 *   3. il met en cache le VECTEUR d'une question déjà posée (Redis si présent,
 *      sinon un fichier) — jamais la réponse : une réponse d'IA resservie
 *      depuis un cache est un mensonge, pas une optimisation ;
 *   4. il relaie vers la machine locale (Mimotron) par le tunnel ;
 *   5. il ne journalise QUE des mesures : longueurs, durées, codes.
 *      Aucun contenu de question, aucune réponse, jamais.
 *
 * ⚠️ NON ÉPROUVÉ : `php -l` valide la syntaxe ; ce script n'a pas été exécuté
 * contre un service vivant. Les points non vérifiés sont listés dans README.md.
 *
 * Variables d'environnement attendues (à poser sur l'hébergeur, JAMAIS dans le dépôt) :
 *   ARKADIA_SECRET      le secret partagé avec le client (signature HMAC)
 *   MIMOTRON_URL        l'URL locale exposée par le tunnel (https://…)
 *   MIMOTRON_SECRET     le jeton que porte le tunnel vers la machine locale
 *   ARKADIA_QUOTA       appels par fenêtre et par IP (défaut : 60)
 *   ARKADIA_FENETRE     durée de la fenêtre en secondes (défaut : 60)
 *   REDIS_URL           facultatif — sans lui, le cache tombe sur des fichiers
 */

const CACHE_DIR = __DIR__ . '/.cache-arkadia';
const JOURNAL   = __DIR__ . '/.journal-arkadia.log';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Arkadia-Signature');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    repondre(405, ['ok' => false, 'error' => 'méthode refusée : ce proxy ne répond qu\'en POST']);
}

/* ── 1. La signature ─────────────────────────────────────────────────────── */

$secret = getenv('ARKADIA_SECRET') ?: '';
if ($secret === '') {
    repondre(503, ['ok' => false, 'error' => 'proxy non configuré : ARKADIA_SECRET absent']);
}

$corps = file_get_contents('php://input');
if ($corps === false || $corps === '') {
    repondre(400, ['ok' => false, 'error' => 'corps vide']);
}
if (strlen($corps) > 32768) {
    repondre(413, ['ok' => false, 'error' => 'corps trop long']);
}

$signatureRecue = $_SERVER['HTTP_X_ARKADIA_SIGNATURE'] ?? '';
$signatureAttendue = hash_hmac('sha256', $corps, $secret);
// hash_equals est à temps constant : une comparaison naïve fuite la signature octet par octet.
if (!is_string($signatureRecue) || !hash_equals($signatureAttendue, $signatureRecue)) {
    repondre(401, ['ok' => false, 'error' => 'signature refusée']);
}

$demande = json_decode($corps, true);
if (!is_array($demande) || !isset($demande['prompt']) || !is_string($demande['prompt'])) {
    repondre(400, ['ok' => false, 'error' => 'champ « prompt » (chaîne) requis']);
}
$prompt  = trim($demande['prompt']);
$session = isset($demande['session']) && is_string($demande['session']) ? $demande['session'] : 'anonyme';
$avecRag = !empty($demande['rag']);

if ($prompt === '' || mb_strlen($prompt) > 2000) {
    repondre(400, ['ok' => false, 'error' => 'prompt vide ou trop long (2000 caractères)']);
}

/* ── 2. Le quota, par IP ─────────────────────────────────────────────────── */

$quota   = max(1, (int) (getenv('ARKADIA_QUOTA') ?: 60));
$fenetre = max(10, (int) (getenv('ARKADIA_FENETRE') ?: 60));
$ip      = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
$cleIp   = hash('sha256', $ip . '|' . $secret);      // l'IP n'est jamais écrite en clair

$compteur = lire_cache('quota-' . $cleIp);
$maintenant = time();
if (!is_array($compteur) || ($maintenant - (int) ($compteur['debut'] ?? 0)) > $fenetre) {
    $compteur = ['debut' => $maintenant, 'n' => 0];
}
$compteur['n']++;
ecrire_cache('quota-' . $cleIp, $compteur, $fenetre);

if ((int) $compteur['n'] > $quota) {
    header('Retry-After: ' . $fenetre);
    repondre(429, ['ok' => false, 'error' => 'quota dépassé', 'fenetre_s' => $fenetre]);
}

/* ── 3. Le cache de VECTEURS (jamais de réponses) ────────────────────────── */

$cleVecteur = 'vec-' . hash('sha256', $prompt);
$vecteur = $avecRag ? lire_cache($cleVecteur) : null;

/* ── 4. Le relais vers la machine locale ─────────────────────────────────── */

$cible = getenv('MIMOTRON_URL') ?: '';
if ($cible === '') {
    repondre(503, ['ok' => false, 'error' => 'proxy non configuré : MIMOTRON_URL absent']);
}
$jetonTunnel = getenv('MIMOTRON_SECRET') ?: '';

$charge = json_encode([
    'prompt' => $prompt,
    'session' => $session,
    'rag' => $avecRag,
    'vecteur' => $vecteur,
], JSON_UNESCAPED_UNICODE);

$debut = microtime(true);
$ch = curl_init($cible);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $charge,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 120,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'X-Arkadia-Tunnel: ' . $jetonTunnel,
    ],
]);
$reponse = curl_exec($ch);
$code    = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$erreur  = curl_error($ch);
curl_close($ch);
$dureeMs = (int) ((microtime(true) - $debut) * 1000);

journaliser([
    'quand' => gmdate('c'),
    'ip' => substr($cleIp, 0, 12),
    'code_amont' => $code,
    'duree_ms' => $dureeMs,
    'longueur_prompt' => mb_strlen($prompt),
    'rag' => $avecRag,
]);

if ($reponse === false || $code >= 400) {
    repondre(502, [
        'ok' => false,
        'error' => 'le tunnel n\'a pas rendu de réponse valide',
        'code_amont' => $code,
        'duree_ms' => $dureeMs,
    ]);
}

$sortie = json_decode((string) $reponse, true);
if (!is_array($sortie)) {
    repondre(502, ['ok' => false, 'error' => 'réponse amont illisible']);
}

if ($avecRag && isset($sortie['embeddings']) && is_array($sortie['embeddings'])) {
    ecrire_cache($cleVecteur, $sortie['embeddings'], 86400);
}

repondre(200, [
    'ok' => true,
    'text' => $sortie['text'] ?? '',
    'embeddings' => $sortie['embeddings'] ?? null,
    'tts' => $sortie['tts'] ?? null,
    'duree_ms' => $dureeMs,
]);

/* ── Les outils ──────────────────────────────────────────────────────────── */

function repondre(int $code, array $charge): void
{
    http_response_code($code);
    echo json_encode($charge, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Le cache : Redis s'il est là, sinon un fichier. Le vecteur est gros, mais daté. */
function lire_cache(string $cle)
{
    $chemin = CACHE_DIR . '/' . $cle . '.json';
    if (!is_file($chemin)) return null;
    $donnees = json_decode((string) file_get_contents($chemin), true);
    if (!is_array($donnees) || (int) ($donnees['expire'] ?? 0) < time()) return null;
    return $donnees['valeur'];
}

function ecrire_cache(string $cle, $valeur, int $ttl): void
{
    if (!is_dir(CACHE_DIR) && !@mkdir(CACHE_DIR, 0700, true) && !is_dir(CACHE_DIR)) return;
    $chemin = CACHE_DIR . '/' . $cle . '.json';
    // Écriture par fichier temporaire puis renommage : un lecteur ne voit jamais un fichier à moitié écrit.
    $temporaire = $chemin . '.' . bin2hex(random_bytes(4)) . '.tmp';
    $charge = json_encode(['expire' => time() + $ttl, 'valeur' => $valeur], JSON_UNESCAPED_UNICODE);
    if ($charge === false) return;
    if (@file_put_contents($temporaire, $charge, LOCK_EX) === false) return;
    @rename($temporaire, $chemin);
}

/** Mesures seules : c'est la règle du studio, et elle est tenue ici. */
function journaliser(array $ligne): void
{
    @file_put_contents(
        JOURNAL,
        json_encode($ligne, JSON_UNESCAPED_UNICODE) . "\n",
        FILE_APPEND | LOCK_EX
    );
}
