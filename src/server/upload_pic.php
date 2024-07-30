<?php

declare(strict_types = 1);

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

$headers = apache_request_headers();
if (! isset($headers['Authorization']) || empty($headers['Authorization'])) {
    echo json_encode(['status' => 'error', 'message' => 'Токен авторизации отсутствует']);
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$userId = validateToken($token);
if ($userId === null) {
    echo json_encode(['status' => 'error', 'message' => 'Неверный токен']);
    exit();
}

$name = $_POST['name'] ?? '';

$validator = Validation::createValidator();
$violations = $validator->validate($name, [
    new Assert\NotBlank(['message' => 'Имя не может быть пустым']),
    new Assert\Regex([
        'pattern' => '/^\S.*$/',
        'message' => 'Имя не должно начинаться с пробела'
    ]),
]);

if (count($violations) > 0) {
    $errors = [];
    foreach ($violations as $violation) {
        $errors[] = $violation->getMessage();
    }
    echo json_encode(['status' => 'error', 'message' => $errors]);
    exit();
}

if (! isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка загрузки файла']);
    exit();
}

$file = $_FILES['image'];
$fileValidator = $validator->validate($file['tmp_name'], new Assert\File([
    'maxSize'          => '3M',
    'mimeTypes'        => ['image/jpeg'],
    'maxSizeMessage'   => 'Файл слишком большой ({{ size }} {{ suffix }}). Максимально допустимый размер {{ limit }} {{ suffix }}',
    'mimeTypesMessage' => 'Допустимый формат - JPG',
]));

if (count($fileValidator) > 0) {
    $errors = [];
    foreach ($fileValidator as $violation) {
        $errors[] = $violation->getMessage();
    }
    echo json_encode(['status' => 'error', 'message' => $errors]);
    exit();
}

$targetDir = 'photos/';
$relativePath = 'src/server/photos/';
if (! is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$uniqueFileName = uniqid() . '.jpg';
$targetFilePath = $targetDir . $uniqueFileName;
$dbFilePath = $relativePath . $uniqueFileName;

if (! move_uploaded_file($file['tmp_name'], $targetFilePath)) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка перемещения файла']);
    exit();
}

try {
    $stmt = $pdo->prepare('INSERT INTO photos (Name, Path_to_photography, Date_created, Rating, Number_of_ratings, Author) VALUES (:name, :path, NOW(), 0.0, 0, :author)');
    $stmt->execute([
        ':name'   => $name,
        ':path'   => $dbFilePath,
        ':author' => $userId,
    ]);
    echo json_encode(['status' => 'success', 'message' => 'Фотография загружена']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка сохранения']);
}
