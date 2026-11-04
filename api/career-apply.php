<?php
/* ========================================================
   TECH SHUTTER HUB - Career Application API (PHP)
   POST: Receives job applications & appends to career_applications.json
   ======================================================== */

require_once __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$body = getJsonBody();

$name = trim($body['name'] ?? '');
$email = trim($body['email'] ?? '');
$role = trim($body['role'] ?? 'Creative Production');

if (empty($name) || empty($email)) {
    jsonResponse(['success' => false, 'message' => 'Name and email are required.'], 400);
}

$apps = readDataFile(CAREERS_FILE);

$newApp = [
    'id' => 'app-' . time() . '-' . rand(100, 999),
    'name' => $name,
    'email' => $email,
    'phone' => trim($body['phone'] ?? ''),
    'role' => $role,
    'portfolio' => trim($body['portfolio'] ?? ''),
    'experience' => trim($body['experience'] ?? ''),
    'message' => trim($body['message'] ?? ''),
    'createdAt' => date('c')
];

array_unshift($apps, $newApp);
writeDataFile(CAREERS_FILE, $apps);

jsonResponse([
    'success' => true,
    'message' => 'Thank you for applying to Tech Shutter Hub! Our production lead will review your portfolio.',
    'data' => $newApp
], 201);

