<?php
// ZAPAX GLOBAL inquiry handler for Apache/cPanel hosting (POST /api/inquiry, rewritten by .htaccess).
// Mirrors server/inquiry-core.mjs. Secrets live OUTSIDE public_html in zapax-mail-config.php:
//   <?php return ['RESEND_API_KEY' => 're_...', 'MAIL_FROM' => 'ZAPAX GLOBAL <inquiries@yourdomain>', 'MAIL_TO' => 'info@yourdomain'];
declare(strict_types=1);
header('Content-Type: application/json');
header('Cache-Control: no-store');

function respond(int $status, array $body): void { http_response_code($status); echo json_encode($body); exit; }
function clean($v, int $max): string {
  $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string)($v ?? '')) ?? '';
  return mb_substr(trim($v), 0, $max);
}
function render(string $tpl, array $d, bool $html): string {
  return preg_replace_callback('/\{\{(\w+)\}\}/', function ($m) use ($d, $html) {
    $v = $d[$m[1]] ?? '';
    if ($v === '' && in_array($m[1], ['phone', 'quantity', 'port', 'message'], true)) $v = 'Not provided';
    return $html ? nl2br(htmlspecialchars($v, ENT_QUOTES, 'UTF-8'), false) : $v;
  }, $tpl);
}
function send_mail(string $key, array $mail): void {
  $ch = curl_init('https://api.resend.com/emails');
  curl_setopt_array($ch, [
    CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $key, 'Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($mail),
  ]);
  $out = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($out === false || $code < 200 || $code >= 300) throw new RuntimeException("Email API $code: " . substr((string)$out, 0, 300));
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond(405, ['ok' => false, 'error' => 'method']);
$templates = json_decode((string)file_get_contents(__DIR__ . '/email-templates.json'), true);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && $origin !== $templates['allowedOrigin']) respond(403, ['ok' => false, 'error' => 'origin']);

$started = (float)($_POST['started'] ?? 0);
if (!empty($_POST['website']) || !$started || microtime(true) * 1000 - $started < 3000) respond(200, ['ok' => true]);

$max = ['name' => 100, 'company' => 150, 'email' => 150, 'country' => 80, 'phone' => 30, 'product' => 80, 'quantity' => 100, 'destination_port' => 100, 'message' => 4000];
$d = [];
foreach ($max as $k => $m) $d[$k] = clean($_POST[$k] ?? '', $m);
$invalid = array_values(array_filter(['name', 'company', 'email', 'country', 'product'], fn($k) => $d[$k] === ''));
if ($d['email'] !== '' && !preg_match('/^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/', $d['email'])) $invalid[] = 'email';
if ($d['phone'] !== '' && !preg_match('/^[+()\d\s.-]{6,30}$/', $d['phone'])) $invalid[] = 'phone';
if ($invalid) respond(400, ['ok' => false, 'error' => 'validation', 'fields' => array_values(array_unique($invalid))]);
$d['port'] = $d['destination_port'];

$cfgFile = dirname(__DIR__, 2) . '/zapax-mail-config.php';
$cfg = is_file($cfgFile) ? require $cfgFile : [];
if (empty($cfg['RESEND_API_KEY']) || empty($cfg['MAIL_FROM']) || empty($cfg['MAIL_TO'])) { error_log('ZAPAX GLOBAL inquiry: mail config missing'); respond(500, ['ok' => false, 'error' => 'config']); }
$to = array_values(array_filter(array_map('trim', explode(',', $cfg['MAIL_TO']))));
$subject = fn(string $t) => mb_substr(preg_replace('/[\r\n]+/', ' ', render($t, $d, false)) ?? '', 0, 200);

try {
  send_mail($cfg['RESEND_API_KEY'], ['from' => $cfg['MAIL_FROM'], 'to' => $to, 'reply_to' => $d['email'],
    'subject' => $subject($templates['team']['subject']), 'html' => render($templates['team']['html'], $d, true), 'text' => render($templates['team']['text'], $d, false)]);
} catch (Throwable $e) { error_log('ZAPAX GLOBAL team email failed: ' . $e->getMessage()); respond(502, ['ok' => false, 'error' => 'send']); }

try {
  send_mail($cfg['RESEND_API_KEY'], ['from' => $cfg['MAIL_FROM'], 'to' => [$d['email']], 'reply_to' => $to[0],
    'subject' => $subject($templates['reply']['subject']), 'html' => render($templates['reply']['html'], $d, true), 'text' => render($templates['reply']['text'], $d, false)]);
} catch (Throwable $e) { error_log('ZAPAX GLOBAL confirmation email failed: ' . $e->getMessage()); respond(200, ['ok' => true, 'confirmation' => false]); }

respond(200, ['ok' => true, 'confirmation' => true]);
