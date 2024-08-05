<?php

namespace App\Repository;

use PDO;

class UserRepository
{
    private $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findUserByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM Users WHERE Email = :email');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    public function insertUser(string $name, string $email, string $phone, string $password): int
    {
        $stmt = $this->pdo->prepare('INSERT INTO Users (Name, Email, Phone, Password) VALUES (:name, :email, :phone, :password)');
        $stmt->execute([
            'name'     => $name,
            'email'    => $email,
            'phone'    => $phone,
            'password' => $password
        ]);

        return $this->pdo->lastInsertId();
    }
}
