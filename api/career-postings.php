<?php
/* ========================================================
   TECH SHUTTER HUB - Career Postings API (PHP)
   GET: Returns active career openings for candidates
   POST: Publishes new job opening (Admin Protected)
   DELETE: Removes job opening (Admin Protected)
   ======================================================== */

require_once __DIR__ . '/common.php';

if (!defined('CAREER_POSTINGS_FILE')) {
    define('CAREER_POSTINGS_FILE', DATA_DIR . '/career_postings.json');
}

$rootPostingsFile = dirname(__DIR__) . '/career_postings.json';

// Initialize default sample postings if none exist
function getInitialPostings() {
    return [
        [
            'id' => 'job_1',
            'title' => 'Lead Wedding Cinematographer',
            'department' => 'Cinematography & Film',
            'type' => 'Full-Time / Project Commission',
            'location' => 'Kolkata, WB · On-Location',
            'experience' => '2-4 Years Field Experience',
            'description' => 'Seeking a skilled wedding filmmaker proficient with Sony FX3/A7SIII cameras, gimbal operations, natural light mastery, and high dynamic range ceremonial documentation.',
            'createdAt' => date('c')
        ],
        [
            'id' => 'job_2',
            'title' => 'Candid Wedding & Ritual Photographer',
            'department' => 'Wedding Photography',
            'type' => 'Commission / Seasonal',
            'location' => 'Kolkata & Destination Weddings',
            'experience' => '2+ Years Experience',
            'description' => 'Documenting Bengali wedding rituals (Gaye Holud, Vivaha, Boubhat) with emotional intuition, sharp candid portraits, and fast prime lens framing.',
            'createdAt' => date('c')
        ],
        [
            'id' => 'job_3',
            'title' => 'Senior Colorist & Video Editor',
            'department' => 'Post-Production',
            'type' => 'Studio Base / Hybrid',
            'location' => 'Kolkata Studio Base',
            'experience' => '3+ Years Experience',
            'description' => 'Expert in DaVinci Resolve color grading, narrative film pacing, dialogue audio synchronization, and high-impact vertical 9:16 reels.',
            'createdAt' => date('c')
        ]
    ];
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $postings = readDataFile(CAREER_POSTINGS_FILE);
    if (empty($postings)) {
        $postings = getInitialPostings();
        writeDataFile(CAREER_POSTINGS_FILE, $postings);
        @file_put_contents($rootPostingsFile, json_encode($postings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
    jsonResponse([
        'success' => true,
        'count' => count($postings),
        'data' => $postings
    ]);
}

if ($method === 'POST') {
    requireAdmin();
    $body = getJsonBody();
    $title = trim($body['title'] ?? '');
    if (empty($title)) {
        jsonResponse(['success' => false, 'message' => 'Job title is required.'], 400);
    }

    $postings = readDataFile(CAREER_POSTINGS_FILE);
    if (empty($postings)) {
        $postings = getInitialPostings();
    }

    $newJob = [
        'id' => 'job_' . time() . '_' . rand(100, 999),
        'title' => $title,
        'department' => trim($body['department'] ?? 'Visual Arts'),
        'type' => trim($body['type'] ?? 'Full-Time'),
        'location' => trim($body['location'] ?? 'Kolkata, WB'),
        'experience' => trim($body['experience'] ?? 'Field Experience Required'),
        'description' => trim($body['description'] ?? ''),
        'createdAt' => date('c')
    ];

    array_unshift($postings, $newJob);
    writeDataFile(CAREER_POSTINGS_FILE, $postings);
    @file_put_contents($rootPostingsFile, json_encode($postings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    jsonResponse([
        'success' => true,
        'message' => 'Career opening published successfully.',
        'data' => $newJob
    ], 201);
}

if ($method === 'DELETE') {
    requireAdmin();
    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        $body = getJsonBody();
        $id = $body['id'] ?? '';
    }

    if (empty($id)) {
        jsonResponse(['success' => false, 'message' => 'Job ID required for deletion.'], 400);
    }

    $postings = readDataFile(CAREER_POSTINGS_FILE);
    $filtered = array_values(array_filter($postings, function($p) use ($id) {
        return ($p['id'] ?? '') !== $id;
    }));

    writeDataFile(CAREER_POSTINGS_FILE, $filtered);
    @file_put_contents($rootPostingsFile, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    jsonResponse([
        'success' => true,
        'message' => 'Job opening deleted successfully.'
    ]);
}

jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);

