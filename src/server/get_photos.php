<?php

declare(strict_types = 1);

require_once 'config.php';

$limit = 12;
$lastId = isset($_GET['lastId']) ? (int)$_GET['lastId'] : PHP_INT_MAX;

$query = 'SELECT * FROM Photos WHERE ID < :lastId ORDER BY ID DESC LIMIT :limit';
$stmt = $pdo->prepare($query);
$stmt->bindParam(':lastId', $lastId, PDO::PARAM_INT);
$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->execute();
$photos = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($photos as &$photo) {
    $photo['Name'] = htmlspecialchars($photo['Name'], ENT_QUOTES, 'UTF-8');
    $photo['Path_to_photography'] = htmlspecialchars($photo['Path_to_photography'], ENT_QUOTES, 'UTF-8');
    $photo['Date_created'] = htmlspecialchars($photo['Date_created'], ENT_QUOTES, 'UTF-8');
}

header('Content-Type: application/json');
echo json_encode($photos);
