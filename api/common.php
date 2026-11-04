<?php
/* ========================================================
   TECH SHUTTER HUB - Common API Utilities & Security
   ======================================================== */

// Set CORS and JSON Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Data Storage Paths
define('DATA_DIR', dirname(__DIR__) . '/data');
define('PROJECTS_FILE', DATA_DIR . '/projects.json');
define('INQUIRIES_FILE', DATA_DIR . '/inquiries.json');
define('CAREERS_FILE', DATA_DIR . '/career_applications.json');
define('SECRET_KEY', 'techshutter_secure_hmac_secret_2026');

// Ensure data directory exists
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

// Helpers
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function getJsonBody() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $_POST;
}

function readDataFile($file) {
    if (!file_exists($file)) {
        return [];
    }
    $content = file_get_contents($file);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function writeDataFile($file, $data) {
    $dir = dirname($file);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    return file_put_contents($file, $json, LOCK_EX) !== false;
}

// Token Generation & Verification
function generateAdminToken() {
    $time = time();
    $sig = hash_hmac('sha256', "admin:{$time}", SECRET_KEY);
    return base64_encode("admin:{$time}:{$sig}");
}

function verifyAdminToken() {
    $headers = getallheaders();
    $auth = '';
    
    if (isset($headers['Authorization'])) {
        $auth = $headers['Authorization'];
    } elseif (isset($headers['authorization'])) {
        $auth = $headers['authorization'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (empty($auth)) {
        return false;
    }

    $token = trim(str_replace('Bearer', '', $auth));
    $decoded = base64_decode($token);
    if (!$decoded) return false;

    $parts = explode(':', $decoded);
    if (count($parts) !== 3) return false;

    list($user, $time, $sig) = $parts;
    if ($user !== 'admin') return false;

    // Token valid for 7 days
    if (time() - intval($time) > 7 * 86400) return false;

    $expected = hash_hmac('sha256', "admin:{$time}", SECRET_KEY);
    return hash_equals($expected, $sig);
}

function requireAdmin() {
    if (!verifyAdminToken()) {
        jsonResponse([
            'success' => false,
            'message' => 'Unauthorized. Admin login and password required.'
        ], 401);
    }
}

