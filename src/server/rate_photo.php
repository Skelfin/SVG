<?php

declare(strict_types=1);

require 'config.php';
require __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\Validator\Constraints as Assert;
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

$headers = apache_request_headers();
if (!isset($headers['Authorization']) || empty($headers['Authorization'])) {
    echo json_encode(['status' => 'error', 'message' => 'Токен авторизации отсутствует']);
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$userId = validateToken($token);
if ($userId === null) {
    echo json_encode(['status' => 'error', 'message' => 'Неверный токен']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$encryptedPhotoId = $data['photo_id'] ?? null;
$rating = $data['rating'] ?? null;

if ($encryptedPhotoId === null) {
    echo json_encode(['status' => 'error', 'message' => 'ID фотографии отсутствует']);
    exit();
}

$photoId = decryptId($encryptedPhotoId, ENCRYPTION_KEY);

$validator = Validation::createValidator();
$violations = $validator->validate($rating, [
    new Assert\NotBlank(['message' => 'Оценка не может быть пустой']),
    new Assert\Type(['type' => 'integer', 'message' => 'Оценка должна быть целым числом']),
    new Assert\Range(['min' => 1, 'max' => 5, 'notInRangeMessage' => 'Оценка должна быть между {{ min }} и {{ max }}']),
]);

if (count($violations) > 0) {
    $errors = [];
    foreach ($violations as $violation) {
        $errors[] = $violation->getMessage();
    }
    echo json_encode(['status' => 'error', 'message' => $errors]);
    exit();
}

try {
    $pdo->beginTransaction();

    // Проверка на автора
    $stmt = $pdo->prepare('SELECT Author FROM Photos WHERE ID = :photo_id');
    $stmt->execute([':photo_id' => $photoId]);
    $photo = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($photo['Author'] == $userId) {
        echo json_encode(['status' => 'error', 'message' => 'Автор не может оценивать свои фотографии']);
        exit();
    }

    $stmt = $pdo->prepare('SELECT Rating FROM PhotoRatings WHERE PhotoID = :photo_id AND UserID = :user_id');
    $stmt->execute([':photo_id' => $photoId, ':user_id' => $userId]);
    $existingRating = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingRating) {
        echo json_encode(['status' => 'error', 'message' => 'Повторный голос невозможен']);
        exit();
    }

    $stmt = $pdo->prepare('INSERT INTO PhotoRatings (PhotoID, UserID, Rating) VALUES (:photo_id, :user_id, :rating)');
    $stmt->execute([':photo_id' => $photoId, ':user_id' => $userId, ':rating' => $rating]);

    $stmt = $pdo->prepare('UPDATE Photos SET Rating = FLOOR((Rating * Number_of_ratings + :rating) / (Number_of_ratings + 1) * 10) / 10, Number_of_ratings = Number_of_ratings + 1 WHERE ID = :photo_id');
    $stmt->execute([':rating' => $rating, ':photo_id' => $photoId]);

    $stmt = $pdo->prepare('SELECT Rating, Number_of_ratings FROM Photos WHERE ID = :photo_id');
    $stmt->execute([':photo_id' => $photoId]);
    $updatedPhoto = $stmt->fetch(PDO::FETCH_ASSOC);

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Оценка сохранена', 'newRating' => $updatedPhoto['Rating'], 'newNumberOfRatings' => $updatedPhoto['Number_of_ratings']]);
} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Ошибка сохранения оценки']);
}