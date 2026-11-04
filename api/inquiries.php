<?php
/* ========================================================
   TECH SHUTTER HUB - Inquiries & Careers Retrieval API (PHP)
   GET: Returns client bookings & career submissions (Admin Protected)
   ======================================================== */

require_once __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

requireAdmin();

$type = $_GET['type'] ?? 'all';
$inquiries = readDataFile(INQUIRIES_FILE);
$careers = readDataFile(CAREERS_FILE);

if ($type === 'careers') {
    jsonResponse([
        'success' => true,
        'count' => count($careers),
        'data' => $careers
    ]);
}

if ($type === 'inquiries') {
    jsonResponse([
        'success' => true,
        'count' => count($inquiries),
        'data' => $inquiries
    ]);
}

jsonResponse([
    'success' => true,
    'totalInquiries' => count($inquiries),
    'totalCareers' => count($careers),
    'inquiries' => $inquiries,
    'careers' => $careers,
    'data' => $inquiries
]);
