<?php

declare(strict_types = 1);

require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'];
$db_name = $_ENV['DB_NAME'];
$username = $_ENV['DB_USER'];
$password = $_ENV['DB_PASS'];
$jwt_key = $_ENV['JWT_KEY'];
$encryption_key = $_ENV['ENCRYPTION_KEY'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $exception) {
    die();
}

define('JWT_KEY', $jwt_key);
define('ENCRYPTION_KEY', $encryption_key);
