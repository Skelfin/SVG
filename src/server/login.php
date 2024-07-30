<?php

declare(strict_types = 1);

require 'config.php';
require __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validation;

header('Access-Control-Allow-Headers: Content-Type');

function sanitizeString(string $str): string
{
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

$input = json_decode(file_get_contents('php://input'), true);

$email = sanitizeString($input['Email'] ?? '');
$password = $input['Password'] ?? '';

$validator = Validation::createValidator();
$violations = $validator->validate($input, new Assert\Collection([
    'Email' => [
        new Assert\NotBlank(['message' => 'Email не может быть пустым']),
    ],
    'Password' => [
        new Assert\NotBlank(['message' => 'Пароль не может быть пустым']),
    ],
]));

if (count($violations) > 0) {
    $errors = [];
    foreach ($violations as $violation) {
        $errors[] = $violation->getMessage();
    }
    echo json_encode(['status' => 'error', 'message' => $errors]);
    exit();
}

$stmt = $pdo->prepare('SELECT * FROM Users WHERE Email = :email');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (! $user || ! password_verify($password, $user['Password'])) {
    echo json_encode(['status' => 'error', 'message' => 'Неверный email или пароль']);
    exit();
}

$payload = [
    'ID'   => $user['ID'],
    'name' => $user['Name'],
    'exp'  => time() + 3600
];

$jwt = JWT::encode($payload, JWT_KEY, 'HS256');

echo json_encode(['status' => 'success', 'message' => 'Авторизация успешна', 'token' => $jwt]);
