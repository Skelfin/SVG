<?php

declare(strict_types = 1);

require 'config.php';
require __DIR__ . '/vendor/autoload.php';
use Firebase\JWT\JWT;

header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

function sanitizeString(string $str): string
{
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

$input = json_decode(file_get_contents('php://input'), true);

$email = sanitizeString($input['Email'] ?? '');
$password = $input['Password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Все поля обязательны для заполнения']);
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
    // 'ID' => $user['id'],
    'name' => $user['Name'],
    'exp'  => time() + 30
];

$jwt = JWT::encode($payload, JWT_KEY, 'HS256');

echo json_encode(['status' => 'success', 'message' => 'Авторизация успешна', 'token' => $jwt]);
