<?php

require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "PUT")
{
    sendJson(["error" => "Method not allowed"], 405);
}

$admin = requireAdmin();

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
    sendJson(["error" => "Please choose a user to update."], 400);
}

if ($userId === $admin["id"])
{
    sendJson(["error" => "You cannot suspend your own account while logged in."], 400);
}

$disabled = empty($data["disabled"])
    ? 0
    : 1;

require_once __DIR__ . "/../config/db.php";

// Admins suspend accounts instead of deleting them.
$statement = $pdo->prepare(
    "UPDATE Users
     SET Disabled = :disabled
     WHERE ID = :id"
);

$statement->execute([
    ":disabled" => $disabled,
    ":id" => $userId
]);

if ($statement->rowCount() === 0)
{
    sendJson(["error" => "User not found."], 404);
}

sendJson([
    "message" => $disabled === 1
        ? "User account suspended."
        : "User account restored."
]);
?>
