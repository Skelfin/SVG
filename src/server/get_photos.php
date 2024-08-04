<?php

declare(strict_types=1);

require 'config.php';

header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

function encryptId(int $id, string $encryption_key): string
{
    $method = 'AES-256-CBC';
    $key = hash('sha256', $encryption_key, true);
    $iv = openssl_random_pseudo_bytes(16);
    $encrypted = openssl_encrypt((string)$id, $method, $key, 0, $iv);
    return bin2hex($iv . $encrypted);
}

function decryptId(string $hash, string $encryption_key): int
{
    $method = 'AES-256-CBC';
    $key = hash('sha256', $encryption_key, true);
    $ivCiphertext = hex2bin($hash);
    $iv = substr($ivCiphertext, 0, 16);
    $ciphertext = substr($ivCiphertext, 16);
    $decrypted = openssl_decrypt($ciphertext, $method, $key, 0, $iv);
    return (int)$decrypted;
}

$limit = 12;
$lastId = $_GET['lastId'] ?? PHP_INT_MAX;

if ($lastId !== PHP_INT_MAX) {
    if (!is_numeric($lastId)) {
        $lastId = decryptId($lastId, ENCRYPTION_KEY);
    } else {
        $lastId = (int)$lastId;
    }
}

$query = 'SELECT * FROM Photos WHERE ID < :lastId ORDER BY ID DESC LIMIT :limit';
$stmt = $pdo->prepare($query);
$stmt->bindParam(':lastId', $lastId, PDO::PARAM_INT);
$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->execute();
$photos = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($photos as &$photo) {
    $photo['Name'] = htmlspecialchars($photo['Name'], ENT_QUOTES, 'UTF-8');
    $photo['Path_to_photography'] = htmlspecialchars($photo['Path_to_photography'], ENT_QUOTES, 'UTF-8');
    $photo['Date_created'] = htmlspecialchars($photo['Date_created'], ENT_QUOTES, 'UTF-8');
}

$response = array_map(function ($photo) {
    return [
        'ID'                  => encryptId((int)$photo['ID'], ENCRYPTION_KEY),
        'Name'                => $photo['Name'],
        'Path_to_photography' => $photo['Path_to_photography'],
        'Date_created'        => $photo['Date_created']
    ];
}, $photos);

echo json_encode($response);
