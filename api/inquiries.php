<?php
/* ========================================================
   TECH SHUTTER HUB - Inquiries Retrieval API (PHP)
   GET: Returns inquiries list (Admin Protected)
   ======================================================== */

require_once __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

requireAdmin();

$inquiries = readDataFile(INQUIRIES_FILE);

jsonResponse([
    'success' => true,
    'count' => count($inquiries),
    'data' => $inquiries
]);

