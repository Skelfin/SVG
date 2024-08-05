<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Firebase\JWT\JWT;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validation;

class UserController
{
    private $userRepository;
    private $jwtKey;

    public function __construct(UserRepository $userRepository, string $jwtKey)
    {
        $this->userRepository = $userRepository;
        $this->jwtKey = $jwtKey;
    }

    private function setCorsHeaders(): void
    {
        header('Content-Type: application/json');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }

    public function login(Request $request): Response
    {
        $this->setCorsHeaders();

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return new Response('', 204);
        }

        $data = json_decode($request->getContent(), true);
        $email = $this->sanitizeString($data['Email'] ?? '');
        $password = $data['Password'] ?? '';

        $validator = Validation::createValidator();
        $violations = $validator->validate($data, new Assert\Collection([
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

            return new Response(json_encode(['status' => 'error', 'message' => $errors]));
        }

        $user = $this->userRepository->findUserByEmail($email);

        if ($user === null || ! password_verify($password, $user['Password'])) {
            return new Response(json_encode(['status' => 'error', 'message' => 'Неверный email или пароль']));
        }

        $payload = [
            'ID'   => $user['ID'],
            'name' => $user['Name'],
            'exp'  => time() + 3600
        ];

        $jwt = JWT::encode($payload, $this->jwtKey, 'HS256');

        return new Response(json_encode(['status' => 'success', 'message' => 'Авторизация успешна', 'token' => $jwt]));
    }

    public function register(Request $request): Response
    {
        $this->setCorsHeaders();

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return new Response('', 204);
        }

        $data = json_decode($request->getContent(), true);
        $name = $this->sanitizeString($data['Name'] ?? '');
        $email = $this->sanitizeString($data['Email'] ?? '');
        $phone = $this->sanitizeString($data['Phone'] ?? '');
        $password = $data['Password'] ?? '';
        $confirmPassword = $data['ConfirmPassword'] ?? '';

        $validator = Validation::createValidator();
        $violations = $validator->validate($data, new Assert\Collection([
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

            return new Response(json_encode(['status' => 'error', 'message' => $errors]));
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $userId = $this->userRepository->insertUser($name, $email, $phone, $hashedPassword);

        $payload = [
            'ID'   => $userId,
            'name' => $name,
            'exp'  => time() + 3600
        ];

        $jwt = JWT::encode($payload, $this->jwtKey, 'HS256');

        return new Response(json_encode(['status' => 'success', 'message' => 'Регистрация успешна', 'token' => $jwt]));
    }

    private function sanitizeString(string $str): string
    {
        return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
    }
}
