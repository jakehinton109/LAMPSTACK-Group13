<?php

require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "PUT")
{
    sendJson(["error" => "Method not allowed"], 405);
}

requireAdmin();

$data = json_decode(file_get_contents("php://input"), true);

if (!$data)
{
    sendJson(["error" => "Request body must be valid JSON"], 400);
}

$userId = empty($data["userId"])
    ? 0
    : (int) $data["userId"];

if ($userId <= 0)
{
    sendJson(["error" => "Please choose a user to promote."], 400);
}

require_once __DIR__ . "/../config/db.php";

$statement = $pdo->prepare(
    "UPDATE Users
     SET Role = 'Admin'
     WHERE ID = :id"
);

$statement->execute([
    ":id" => $userId
]);

if ($statement->rowCount() === 0)
{
    $checkStatement = $pdo->prepare(
        "SELECT ID
         FROM Users
         WHERE ID = :id"
    );

    $checkStatement->execute([
        ":id" => $userId
    ]);

    if (!$checkStatement->fetch())
    {
        sendJson(["error" => "User not found."], 404);
    }
}

sendJson([
    "message" => "User promoted to admin."
]);
?>
