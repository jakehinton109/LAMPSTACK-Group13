<?php

require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "DELETE")
{
    sendJson(["error" => "Method not allowed"], 405);
}

$user = requireAuth();

$id = isset($_GET["id"])
    ? (int) $_GET["id"]
    : 0;

if ($id <= 0)
{
    sendJson(["error" => "a valid contact id is requried."], 400);
}

require_once __DIR__ . "/../config/db.php";

if ($user["role"] === "Admin")
{
    $statement = $pdo->prepare(
        "DELETE FROM Contacts
        WHERE ID = :id"
    );

    $statement->execute([
        ":id" => $id
    ]);
}
else
{
    $statement = $pdo->prepare(
        "DELETE FROM Contacts
        WHERE ID = :id
        AND UserID = :userId"
    );

    $statement->execute([
        ":id" => $id,
        ":userId" => $user["id"]
    ]);
}

if ($statement->rowCount() === 0)
{
    sendJson([
        "error" => "Contact not found or you do not have permission"
    ], 404);
}

sendJson([
    "message" => "Contact deleted!"
]);
