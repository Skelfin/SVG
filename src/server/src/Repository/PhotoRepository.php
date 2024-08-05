<?php

namespace App\Repository;

use PDO;

class PhotoRepository
{
    private $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findPhotoById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM Photos WHERE ID = :id');
        $stmt->execute(['id' => $id]);
        $photo = $stmt->fetch(PDO::FETCH_ASSOC);

        return $photo ?: null;
    }

    public function findPhotos(int $lastId, int $limit): array
    {
        $query = 'SELECT * FROM Photos WHERE ID < :lastId ORDER BY ID DESC LIMIT :limit';
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':lastId', $lastId, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findAuthorById(int $authorId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT Name FROM Users WHERE ID = :id');
        $stmt->execute(['id' => $authorId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function findUserRating(int $photoId, int $userId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT Rating FROM PhotoRatings WHERE PhotoID = :photo_id AND UserID = :user_id');
        $stmt->execute([':photo_id' => $photoId, ':user_id' => $userId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function insertPhoto(string $name, string $path, int $authorId): void
    {
        $stmt = $this->pdo->prepare('INSERT INTO Photos (Name, Path_to_photography, Date_created, Rating, Number_of_ratings, Author) VALUES (:name, :path, NOW(), 0.0, 0, :author)');
        $stmt->execute([
            'name'   => $name,
            'path'   => $path,
            'author' => $authorId,
        ]);
    }

    public function updatePhotoRating(int $photoId, int $rating): void
    {
        $stmt = $this->pdo->prepare('UPDATE Photos SET Rating = FLOOR((Rating * Number_of_ratings + :rating) / (Number_of_ratings + 1) * 10) / 10, Number_of_ratings = Number_of_ratings + 1 WHERE ID = :photo_id');
        $stmt->execute([':rating' => $rating, ':photo_id' => $photoId]);
    }

    public function beginTransaction(): void
    {
        $this->pdo->beginTransaction();
    }

    public function commit(): void
    {
        $this->pdo->commit();
    }

    public function rollBack(): void
    {
        $this->pdo->rollBack();
    }

    public function findPhotoAuthor(int $photoId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT Author FROM Photos WHERE ID = :photo_id');
        $stmt->execute([':photo_id' => $photoId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function findExistingRating(int $photoId, int $userId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT Rating FROM PhotoRatings WHERE PhotoID = :photo_id AND UserID = :user_id');
        $stmt->execute([':photo_id' => $photoId, ':user_id' => $userId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function insertRating(int $photoId, int $userId, int $rating): void
    {
        $stmt = $this->pdo->prepare('INSERT INTO PhotoRatings (PhotoID, UserID, Rating) VALUES (:photo_id, :user_id, :rating)');
        $stmt->execute([':photo_id' => $photoId, ':user_id' => $userId, ':rating' => $rating]);
    }
}
