<?php

declare(strict_types=1);

require 'config.php';
require __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\Validator\Validation;

header('Access-Control-Allow-Headers: Content-Type, Authorization');

function validateToken(string $token): ?int
{
    try {
        $decoded = JWT::decode($token, new Key(JWT_KEY, 'HS256'));
        return $decoded->ID ?? null;
    } catch (Exception $e) {
        return null;
    }
}

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

$hash = $_GET['id'] ?? '';
if (!$hash) {
    http_response_code(400);
    echo json_encode(['error' => 'ID потерян']);
    exit;
}

$id = decryptId($hash, ENCRYPTION_KEY);

$query = 'SELECT * FROM Photos WHERE ID = :id';
$stmt = $pdo->prepare($query);
$stmt->bindParam(':id', $id, PDO::PARAM_INT);
$stmt->execute();
$photo = $stmt->fetch(PDO::FETCH_ASSOC);

if ($photo === false) {
    http_response_code(404);
    echo json_encode(['error' => 'Картинка не найдена']);
    exit;
}

$authorId = (int)$photo['Author'];
$authorQuery = 'SELECT Name FROM Users WHERE ID = :id';
$authorStmt = $pdo->prepare($authorQuery);
$authorStmt->bindParam(':id', $authorId, PDO::PARAM_INT);
$authorStmt->execute();
$author = $authorStmt->fetch(PDO::FETCH_ASSOC);

if ($author === false) {
    http_response_code(404);
    echo json_encode(['error' => 'Автор не найден']);
    exit;
}

$userId = null;
$headers = apache_request_headers();
if (isset($headers['Authorization']) && !empty($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $userId = validateToken($token);
}

$userRating = null;
if ($userId !== null) {
    $stmt = $pdo->prepare('SELECT Rating FROM PhotoRatings WHERE PhotoID = :photo_id AND UserID = :user_id');
    $stmt->execute([':photo_id' => $id, ':user_id' => $userId]);
    $userRatingData = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($userRatingData !== false) {
        $userRating = (int)$userRatingData['Rating'];
    }
}

$response = [
    'ID'                  => encryptId((int)$photo['ID'], ENCRYPTION_KEY),
    'Name'                => htmlspecialchars($photo['Name'], ENT_QUOTES, 'UTF-8'),
    'Path_to_photography' => htmlspecialchars($photo['Path_to_photography'], ENT_QUOTES, 'UTF-8'),
    'Date_created'        => htmlspecialchars($photo['Date_created'], ENT_QUOTES, 'UTF-8'),
    'Rating'              => $photo['Rating'],
    'Number_of_ratings'   => $photo['Number_of_ratings'],
    'Author'              => htmlspecialchars($author['Name'], ENT_QUOTES, 'UTF-8'),
    'AuthorID'            => $authorId,
    'UserRating'          => $userRating
];

echo json_encode($response);
