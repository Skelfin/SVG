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

$name = sanitizeString($input['Name'] ?? '');
$email = sanitizeString($input['Email'] ?? '');
$phone = sanitizeString($input['Phone'] ?? '');
$password = $input['Password'] ?? '';
$confirmPassword = $input['ConfirmPassword'] ?? '';

$validator = Validation::createValidator();
$violations = $validator->validate($input, new Assert\Collection([
    'Name' => [
        new Assert\NotBlank(['message' => 'Имя не может быть пустым']),
        new Assert\Regex([
            'pattern' => '/^[а-яА-ЯёЁ\s-]+$/u',
            'message' => 'Имя должно содержать только русские буквы, пробелы и дефисы'
        ]),
        new Assert\Regex([
            'pattern' => '/^\S.*$/',
            'message' => 'Имя не должно начинаться с пробела'
        ])
    ],
    'Email' => [
        new Assert\NotBlank(['message' => 'Email не может быть пустым']),
        new Assert\Email(['message' => 'Некорректный email']),
    ],
    'Phone' => [
        new Assert\NotBlank(['message' => 'Телефон не может быть пустым']),
        new Assert\Regex([
            'pattern' => '/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/',
            'message' => 'Телефон должен быть в формате +7 (123) 456-78-90'
        ]),
    ],
    'Password' => [
        new Assert\NotBlank(['message' => 'Пароль не может быть пустым']),
        new Assert\Length(['min' => 6, 'max' => 20, 'minMessage' => 'Пароль должен быть не менее 6 символов', 'maxMessage' => 'Пароль должен быть не более 20 символов']),
        new Assert\Regex([
            'pattern' => '/^\d+$/',
            'match'   => false,
            'message' => 'Пароль не должен состоять только из цифр'
        ]),
    ],
    'ConfirmPassword' => [
        new Assert\NotBlank(['message' => 'Подтверждение пароля не может быть пустым']),
        new Assert\EqualTo(['value' => $password, 'message' => 'Пароли должны совпадать']),
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

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('INSERT INTO Users (Name, Email, Phone, Password) VALUES (:name, :email, :phone, :password)');
$stmt->execute([
    'name'     => $name,
    'email'    => $email,
    'phone'    => $phone,
    'password' => $hashedPassword
]);

$userId = $pdo->lastInsertId();

$payload = [
    'ID'   => $userId,
    'name' => $name,
    'exp'  => time() + 3600
];

$jwt = JWT::encode($payload, JWT_KEY, 'HS256');

echo json_encode(['status' => 'success', 'message' => 'Регистрация успешна', 'token' => $jwt]);
