<?php
/* ========================================================
   TECH SHUTTER HUB - Media Upload API (PHP)
   POST: Uploads image or video file to /assets/uploads/
   ======================================================== */

require_once __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

requireAdmin();

if (empty($_FILES['file'])) {
    jsonResponse(['success' => false, 'message' => 'No file uploaded.'], 400);
}

$file = $_FILES['file'];
$uploadDir = dirname(__DIR__) . '/assets/uploads/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'webm'];

if (!in_array($ext, $allowed)) {
    jsonResponse(['success' => false, 'message' => 'Invalid file extension. Allowed: jpg, jpeg, png, webp, mp4, mov, webm'], 400);
}

$filename = 'upload_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
$dest = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $dest)) {
    $url = '/assets/uploads/' . $filename;
    jsonResponse([
        'success' => true,
        'message' => 'File uploaded successfully.',
        'url' => $url,
        'filename' => $filename
    ], 201);
}

jsonResponse(['success' => false, 'message' => 'Failed to move uploaded file.'], 500);

