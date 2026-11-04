<?php
/* ========================================================
   TECH SHUTTER HUB - Admin Login & Session API (PHP)
   POST: Authenticates admin credentials and returns HMAC token
   GET: Verifies active session token
   ======================================================== */

require_once __DIR__ . '/common.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (verifyAdminToken()) {
        jsonResponse([
            'success' => true,
            'authenticated' => true,
            'user' => [
                'username' => 'admin',
                'role' => 'Studio Administrator'
            ]
        ]);
    } else {
        jsonResponse([
            'success' => false,
            'authenticated' => false,
            'message' => 'Session expired or invalid token.'
        ], 401);
    }
}

if ($method === 'POST') {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (strpos($path, 'logout') !== false) {
        jsonResponse(['success' => true, 'message' => 'Logged out successfully.']);
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
            'message' => 'Authentication successful. Welcome, Studio Director.',
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
}

jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
