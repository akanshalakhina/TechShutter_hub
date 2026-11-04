<?php
/* ========================================================
   TECH SHUTTER HUB - Inquiries & Booking API (PHP)
   POST: Receives booking requests & appends to inquiries.json
   ======================================================== */

require_once __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$body = getJsonBody();

$name = trim($body['name'] ?? '');
$email = trim($body['email'] ?? '');
$service = trim($body['service'] ?? 'General Consultation');

if (empty($name) || empty($email)) {
    jsonResponse(['success' => false, 'message' => 'Please provide both your name and email address.'], 400);
}

$inquiries = readDataFile(INQUIRIES_FILE);

$newInquiry = [
    'id' => 'inq-' . time() . '-' . rand(100, 999),
    'name' => $name,
    'email' => $email,
    'phone' => trim($body['phone'] ?? ''),
    'service' => $service,
    'date' => $body['date'] ?? null,
    'budget' => $body['budget'] ?? null,
    'message' => trim($body['message'] ?? ''),
    'status' => 'New',
    'createdAt' => date('c')
];

array_unshift($inquiries, $newInquiry);
writeDataFile(INQUIRIES_FILE, $inquiries);

// Optional: send email notification via PHP mail() if configured
$to = 'contact@techshutterhub.com';
$subject = "New Shoot Inquiry: {$service} from {$name}";
$headers = "From: webmaster@techshutterhub.com\r\n" .
           "Reply-To: {$email}\r\n" .
           "Content-Type: text/plain; charset=UTF-8\r\n";
$msg = "New project inquiry received via website:\n\n" .
       "Name: {$name}\n" .
       "Email: {$email}\n" .
       "Phone: " . ($body['phone'] ?? 'N/A') . "\n" .
       "Service: {$service}\n" .
       "Event Date: " . ($body['date'] ?? 'N/A') . "\n" .
       "Budget: " . ($body['budget'] ?? 'N/A') . "\n\n" .
       "Message:\n" . ($body['message'] ?? 'N/A') . "\n";
@mail($to, $subject, $msg, $headers);

jsonResponse([
    'success' => true,
    'message' => 'Thank you for your project inquiry! The Tech Shutter Hub team will connect with you within 24 hours.',
    'data' => $newInquiry
], 201);

