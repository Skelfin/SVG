<?php

namespace App\Controller;

use App\Repository\PhotoRepository;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validation;

class PhotoController
{
    private $photoRepository;
    private $jwtKey;
    private $encryptionKey;

    public function __construct(PhotoRepository $photoRepository, string $jwtKey, string $encryptionKey)
    {
        $this->photoRepository = $photoRepository;
        $this->jwtKey = $jwtKey;
        $this->encryptionKey = $encryptionKey;
    }

    private function setCorsHeaders(): void
    {
        header('Content-Type: application/json');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }

    public function getPhoto(Request $request): Response
    {
        error_reporting(E_ALL & ~E_WARNING);

        $this->setCorsHeaders();

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return new Response('', 204);
        }

        $validator = Validation::createValidator();
        $hash = $request->query->get('id', '');
        $constraints = new Assert\Collection([
            'id' => new Assert\NotBlank()
        ]);

        $input = ['id' => $hash];
        $violations = $validator->validate($input, $constraints);

        if (count($violations) > 0) {
            return new Response(json_encode(['error' => 'ID потерян']));
        }

        $id = $this->decryptId($hash);
        $photo = $this->photoRepository->findPhotoById($id);

        if ($photo === false) {
            return new Response(json_encode(['error' => 'Картинка не найдена']));
        }

        $authorId = (int)$photo['Author'];
        $author = $this->photoRepository->findAuthorById($authorId);

        if ($author === false) {
            return new Response(json_encode(['error' => 'Автор не найден']));
        }

        $userId = null;
        $headers = apache_request_headers();
        if (isset($headers['Authorization']) && ! empty($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            $userId = $this->validateToken($token);
        }

        $userRating = null;
        if ($userId !== null) {
            $userRatingData = $this->photoRepository->findUserRating($id, $userId);
            if ($userRatingData !== false) {
                $userRating = (int)$userRatingData['Rating'];
            }
        }

        $response = [
            'ID'                  => $this->encryptId((int)$photo['ID']),
            'Name'                => htmlspecialchars($photo['Name'], ENT_QUOTES, 'UTF-8'),
            'Path_to_photography' => htmlspecialchars($photo['Path_to_photography'], ENT_QUOTES, 'UTF-8'),
            'Date_created'        => htmlspecialchars($photo['Date_created'], ENT_QUOTES, 'UTF-8'),
            'Rating'              => $photo['Rating'],
            'Number_of_ratings'   => $photo['Number_of_ratings'],
            'Author'              => htmlspecialchars($author['Name'], ENT_QUOTES, 'UTF-8'),
            'AuthorID'            => $authorId,
            'UserRating'          => $userRating
        ];

        return new Response(json_encode($response));
    }

    public function getPhotos(Request $request): Response
    {
        $this->setCorsHeaders();

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return new Response('', 204);
        }

        $limit = 12;
        $lastId = $request->query->get('lastId', PHP_INT_MAX);

        if ($lastId !== PHP_INT_MAX) {
            if (! is_numeric($lastId)) {
                $lastId = $this->decryptId($lastId);
            } else {
                $lastId = (int)$lastId;
            }
        }

        $photos = $this->photoRepository->findPhotos($lastId, $limit);

        foreach ($photos as &$photo) {
            $photo['Name'] = htmlspecialchars($photo['Name'], ENT_QUOTES, 'UTF-8');
            $photo['Path_to_photography'] = htmlspecialchars($photo['Path_to_photography'], ENT_QUOTES, 'UTF-8');
            $photo['Date_created'] = htmlspecialchars($photo['Date_created'], ENT_QUOTES, 'UTF-8');
        }

        $response = array_map(function ($photo) {
            return [
                'ID'                  => $this->encryptId((int)$photo['ID']),
                'Name'                => $photo['Name'],
                'Path_to_photography' => $photo['Path_to_photography'],
                'Date_created'        => $photo['Date_created']
            ];
        }, $photos);

        return new Response(json_encode($response));
    }

    public function uploadPic(Request $request): Response
    {
        $this->setCorsHeaders();

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return new Response('', 204);
        }

        $headers = apache_request_headers();
        if (! isset($headers['Authorization']) || empty($headers['Authorization'])) {
            return new Response(json_encode(['status' => 'error', 'message' => 'Токен авторизации отсутствует']));
        }

        $token = str_replace('Bearer ', '', $headers['Authorization']);
        $userId = $this->validateToken($token);
        if ($userId === null) {
            return new Response(json_encode(['status' => 'error', 'message' => 'Неверный токен']));
        }

        $name = $request->request->get('name', '');

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

            return new Response(json_encode(['status' => 'error', 'message' => $errors]));
        }

        if (! isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return new Response(json_encode(['status' => 'error', 'message' => 'Ошибка загрузки файла']));
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

            return new Response(json_encode(['status' => 'error', 'message' => $errors]));
        }

        $targetDir = '../public/photos/';
        $relativePath = '/photos/';
        if (! is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $uniqueFileName = uniqid() . '.jpg';
        $targetFilePath = $targetDir . $uniqueFileName;
        $dbFilePath = $relativePath . $uniqueFileName;

        if (! move_uploaded_file($file['tmp_name'], $targetFilePath)) {
            return new Response(json_encode(['status' => 'error', 'message' => 'Ошибка перемещения файла']));
        }

        try {
            $this->photoRepository->insertPhoto($name, $dbFilePath, $userId);

            return new Response(json_encode(['status' => 'success', 'message' => 'Фотография загружена']));
        } catch (PDOException $e) {
            return new Response(json_encode(['status' => 'error', 'message' => 'Ошибка сохранения']));
        }
    }

    public function ratePhoto(Request $request): Response
    {
        $this->setCorsHeaders();

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return new Response('', 204);
        }

        $headers = apache_request_headers();
        if (! isset($headers['Authorization']) || empty($headers['Authorization'])) {
            return new Response(json_encode(['status' => 'error', 'message' => 'Токен авторизации отсутствует']));
        }

        $token = str_replace('Bearer ', '', $headers['Authorization']);
        $userId = $this->validateToken($token);
        if ($userId === null) {
            return new Response(json_encode(['status' => 'error', 'message' => 'Неверный токен']));
        }

        $data = json_decode($request->getContent(), true);
        $encryptedPhotoId = $data['photo_id'] ?? null;
        $rating = $data['rating'] ?? null;

        if ($encryptedPhotoId === null) {
            return new Response(json_encode(['status' => 'error', 'message' => 'ID фотографии отсутствует']));
        }

        $photoId = $this->decryptId($encryptedPhotoId);

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

            return new Response(json_encode(['status' => 'error', 'message' => $errors]));
        }

        try {
            $this->photoRepository->beginTransaction();

            $photo = $this->photoRepository->findPhotoAuthor($photoId);
            if ($photo['Author'] == $userId) {
                return new Response(json_encode(['status' => 'error', 'message' => 'Автор не может оценивать свои фотографии']));
            }

            $existingRating = $this->photoRepository->findExistingRating($photoId, $userId);
            if ($existingRating) {
                return new Response(json_encode(['status' => 'error', 'message' => 'Повторный голос невозможен']));
            }

            $this->photoRepository->insertRating($photoId, $userId, $rating);
            $this->photoRepository->updatePhotoRating($photoId, $rating);

            $updatedPhoto = $this->photoRepository->findPhotoById($photoId);

            $this->photoRepository->commit();

            return new Response(json_encode(['status' => 'success', 'message' => 'Оценка сохранена', 'newRating' => $updatedPhoto['Rating'], 'newNumberOfRatings' => $updatedPhoto['Number_of_ratings']]));
        } catch (PDOException $e) {
            $this->photoRepository->rollBack();

            return new Response(json_encode(['status' => 'error', 'message' => 'Ошибка сохранения оценки']));
        }
    }

    private function validateToken(string $token): ?int
    {
        try {
            $decoded = JWT::decode($token, new Key($this->jwtKey, 'HS256'));

            return $decoded->ID ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function encryptId(int $id): string
    {
        $method = 'AES-256-CBC';
        $key = hash('sha256', $this->encryptionKey, true);
        $iv = openssl_random_pseudo_bytes(16);
        $encrypted = openssl_encrypt((string)$id, $method, $key, 0, $iv);

        return bin2hex($iv . $encrypted);
    }

    private function decryptId(string $hash): int
    {
        $method = 'AES-256-CBC';
        $key = hash('sha256', $this->encryptionKey, true);
        $ivCiphertext = hex2bin($hash);
        $iv = substr($ivCiphertext, 0, 16);
        $ciphertext = substr($ivCiphertext, 16);
        $decrypted = openssl_decrypt($ciphertext, $method, $key, 0, $iv);

        return (int)$decrypted;
    }
}
