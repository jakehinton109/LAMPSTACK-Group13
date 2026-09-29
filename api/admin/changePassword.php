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

if ($userId <= 0 || empty($data["password"]))
{
    sendJson(["error" => "User and new password are required."], 400);
}

require_once __DIR__ . "/../config/db.php";

$hashedPassword = password_hash($data["password"], PASSWORD_DEFAULT);

// Only the password changes here. Suspension is handled by suspendUser.php.
$statement = $pdo->prepare(
    "UPDATE Users
     SET Password = :password
     WHERE ID = :id"
);

$statement->execute([
    ":password" => $hashedPassword,
    ":id" => $userId
]);

if ($statement->rowCount() === 0)
{
    sendJson(["error" => "User not found."], 404);
}

sendJson([
    "message" => "User password changed."
]);
?>
