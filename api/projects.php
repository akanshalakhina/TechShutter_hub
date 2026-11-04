<?php
/* ========================================================
   TECH SHUTTER HUB - Projects API (PHP)
   GET: Fetch all projects with optional filtering
   POST: Add project (Admin only)
   DELETE: Remove project (Admin only)
   ======================================================== */

require_once __DIR__ . '/common.php';

$method = $_SERVER['REQUEST_METHOD'];
$projects = readDataFile(PROJECTS_FILE);

// If projects file was empty, check public/projects.json
if (empty($projects) && file_exists(dirname(__DIR__) . '/projects.json')) {
    $projects = readDataFile(dirname(__DIR__) . '/projects.json');
    if (!empty($projects)) {
        writeDataFile(PROJECTS_FILE, $projects);
    }
}

if ($method === 'GET') {
    // Check for single project by id
    if (isset($_GET['id'])) {
        $id = trim($_GET['id']);
        foreach ($projects as $p) {
            if ($p['id'] === $id) {
                jsonResponse(['success' => true, 'data' => $p]);
            }
        }
        jsonResponse(['success' => false, 'message' => 'Project not found'], 404);
    }

    $filtered = $projects;

    // Filter by category
    if (isset($_GET['category']) && $_GET['category'] !== 'All') {
        $cat = strtolower(trim($_GET['category']));
        $filtered = array_values(array_filter($filtered, function($p) use ($cat) {
            return strtolower($p['category'] ?? '') === $cat;
        }));
    }

    // Filter by ritual
    if (isset($_GET['ritual']) && $_GET['ritual'] !== 'All') {
        $rit = strtolower(trim($_GET['ritual']));
        $filtered = array_values(array_filter($filtered, function($p) use ($rit) {
            return strtolower($p['weddingRitual'] ?? '') === $rit;
        }));
    }

    jsonResponse([
        'success' => true,
        'count' => count($filtered),
        'data' => $filtered
    ]);
}

if ($method === 'POST') {
    requireAdmin();
    $body = getJsonBody();

    if (empty($body['title'])) {
        jsonResponse(['success' => false, 'message' => 'Project title is required.'], 400);
    }

    $id = !empty($body['id']) ? $body['id'] : 'proj-' . time() . '-' . rand(100, 999);
    
    $newProject = [
        'id' => $id,
        'title' => trim($body['title']),
        'category' => $body['category'] ?? 'Full-Spectrum Wedding',
        'weddingRitual' => $body['weddingRitual'] ?? null,
        'client' => $body['client'] ?? 'Tech Shutter Hub Client',
        'year' => $body['year'] ?? date('Y'),
        'description' => $body['description'] ?? '',
        'image' => $body['image'] ?? '/assets/logos/logo-dark-bg.jpg',
        'thumbImage' => $body['thumbImage'] ?? ($body['image'] ?? '/assets/logos/logo-dark-bg.jpg'),
        'video' => $body['video'] ?? null,
        'photos' => !empty($body['photos']) && is_array($body['photos']) ? $body['photos'] : [$body['image'] ?? '/assets/logos/logo-dark-bg.jpg'],
        'orientation' => $body['orientation'] ?? 'landscape',
        'tags' => !empty($body['tags']) && is_array($body['tags']) ? $body['tags'] : ['New Addition'],
        'featured' => !empty($body['featured']),
        'createdAt' => date('c')
    ];

    // Prepend new project so it appears first
    array_unshift($projects, $newProject);
    writeDataFile(PROJECTS_FILE, $projects);

    // Sync to public/projects.json if it exists
    if (file_exists(dirname(__DIR__) . '/projects.json')) {
        writeDataFile(dirname(__DIR__) . '/projects.json', $projects);
    }

    jsonResponse([
        'success' => true,
        'message' => 'Project added successfully.',
        'data' => $newProject
    ], 201);
}

if ($method === 'DELETE') {
    requireAdmin();
    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        if (preg_match('#/projects/([^/?#]+)#', $path, $m)) {
            $id = $m[1];
        }
    }
    if (empty($id)) {
        $body = getJsonBody();
        $id = $body['id'] ?? '';
    }

    if (empty($id)) {
        jsonResponse(['success' => false, 'message' => 'Project ID required.'], 400);
    }

    $initialCount = count($projects);
    $projects = array_values(array_filter($projects, function($p) use ($id) {
        return $p['id'] !== $id;
    }));

    if (count($projects) === $initialCount) {
        jsonResponse(['success' => false, 'message' => 'Project not found.'], 404);
    }

    writeDataFile(PROJECTS_FILE, $projects);
    if (file_exists(dirname(__DIR__) . '/projects.json')) {
        writeDataFile(dirname(__DIR__) . '/projects.json', $projects);
    }

    jsonResponse(['success' => true, 'message' => 'Project deleted successfully.']);
}

jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);

