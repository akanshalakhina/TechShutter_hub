<?php
/* ========================================================
   TECH SHUTTER HUB - Admin Login API (PHP)
   POST: Authenticates admin credentials and returns JWT/HMAC token
   ======================================================== */

require_once __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$body = getJsonBody();
$user = trim($body['username'] ?? '');
$pass = trim($body['password'] ?? '');

$validUser = getenv('ADMIN_USER') ?: 'admin';
$validPass = getenv('ADMIN_PASS') ?: 'techshutter2026';

if ($user === $validUser && $pass === $validPass) {
    $token = generateAdminToken();
    jsonResponse([
        'success' => true,
        'message' => 'Authentication successful.',
        'token' => $token,
        'user' => [
            'username' => 'admin',
            'role' => 'Studio Administrator'
        ]
    ]);
}

jsonResponse([
    'success' => false,
    'message' => 'Invalid username or password.'
], 401);

