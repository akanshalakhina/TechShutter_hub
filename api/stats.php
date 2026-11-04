<?php
/* ========================================================
   TECH SHUTTER HUB - Dashboard Stats API (PHP)
   GET: Returns project, category, inquiry, and career counts
   ======================================================== */

require_once __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$projects = readDataFile(PROJECTS_FILE);
if (empty($projects) && file_exists(dirname(__DIR__) . '/projects.json')) {
    $projects = readDataFile(dirname(__DIR__) . '/projects.json');
}

$inquiries = readDataFile(INQUIRIES_FILE);
$careers = readDataFile(CAREERS_FILE);

$categories = array_values(array_unique(array_filter(array_column($projects, 'category'))));
$rituals = array_values(array_unique(array_filter(array_column($projects, 'weddingRitual'))));

jsonResponse([
    'success' => true,
    'totalProjects' => count($projects),
    'totalCategories' => count($categories),
    'totalInquiries' => count($inquiries),
    'totalCareers' => count($careers),
    'categories' => $categories,
    'weddingRituals' => $rituals
]);
