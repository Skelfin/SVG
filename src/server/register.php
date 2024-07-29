<?php

declare(strict_types = 1);

require 'config.php';
require __DIR__ . '/vendor/autoload.php';
use Firebase\JWT\JWT;

header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

function validateEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function sanitizeString(string $str): string
{
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

$input = json_decode(file_get_contents('php://input'), true);

$name = sanitizeString($input['Name'] ?? '');
$email = sanitizeString($input['Email'] ?? '');
$phone = sanitizeString($input['Phone'] ?? '');
$password = $input['Password'] ?? '';
$confirmPassword = $input['ConfirmPassword'] ?? '';

if (empty($name) || empty($email) || empty($phone) || empty($password) || empty($confirmPassword)) {
    echo json_encode(['status' => 'error', 'message' => 'Все поля обязательны для заполнения']);
    exit();
}

if (! validateEmail($email)) {
    echo json_encode(['status' => 'error', 'message' => 'Некорректный email']);
    exit();
}

$stmt = $pdo->prepare('SELECT COUNT(*) FROM Users WHERE Email = :email');
$stmt->execute(['email' => $email]);
if ($stmt->fetchColumn() > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Пользователь с таким email уже зарегистрирован']);
    exit();
}

$phonePattern = '/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/';
if (strlen($phone) > 18 || ! preg_match($phonePattern, $phone)) {
    echo json_encode(['status' => 'error', 'message' => 'Телефон должен быть не длиннее 18 символов и соответствовать формату +7 (123) 456-78-90']);
    exit();
}

if (! preg_match('/^[а-яА-ЯёЁ\s-]+$/u', $name) || preg_match('/^\s/', $name)) {
    echo json_encode(['status' => 'error', 'message' => 'Имя должно содержать только русские буквы, пробелы и дефисы, и не начинаться с пробела']);
    exit();
}

if (strlen($password) < 6 || strlen($password) > 20 || preg_match('/^\d+$/', $password)) {
    echo json_encode(['status' => 'error', 'message' => 'Пароль должен быть от 6 до 20 символов и не состоять только из цифр']);
    exit();
}

if ($password !== $confirmPassword) {
    echo json_encode(['status' => 'error', 'message' => 'Пароли должны совпадать']);
    exit();
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('INSERT INTO Users (Name, Email, Phone, Password) VALUES (:name, :email, :phone, :password)');
$stmt->execute([
    'name'     => $name,
    'email'    => $email,
    'phone'    => $phone,
    'password' => $hashedPassword
]);

// $userId = $pdo->lastInsertId();

$payload = [
    // 'ID' => $userId,
    'name' => $name,
    'exp'  => time() + 30
];

$jwt = JWT::encode($payload, JWT_KEY, 'HS256');

echo json_encode(['status' => 'success', 'message' => 'Регистрация успешна', 'token' => $jwt]);
