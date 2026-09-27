<?php

require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST")
{
    sendJson(["error" => "Method not allowed"], 405);
}

$user = requireAuth();

$data = json_decode(file_get_contents("php://input"), true);

if (!$data)
{
    sendJson(["error" => "request content needs to be json"], 400);
}

if (empty($data["firstName"]) || empty($data["lastName"]))
{
    sendJson([
        "error" => "firstName and lastName are required"
    ], 400);
}

require_once __DIR__ . "/../config/db.php";

$statement = $pdo->prepare(
    "INSERT INTO Contacts
    (
        UserID,
        FirstName,
        LastName,
        Phone,
        Email,
        Position,
        Side
    )
    VALUES
    (
        :userId,
        :firstName,
        :lastName,
        :phone,
        :email,
        :position,
        :side
    )"
);

$statement->execute([
    ":userId" => $user["id"],
    ":firstName" => trim($data["firstName"]),
    ":lastName" => trim($data["lastName"]),
    ":phone" => empty($data["phone"])
        ? null
        : trim($data["phone"]),
    ":email" => empty($data["email"])
        ? null
        : trim($data["email"]),
    ":position" => empty($data["position"])
        ? null
        : trim($data["position"]),
    ":side" => empty($data["side"])
        ? null
        : trim($data["side"])
]);

sendJson([
    "message" => "Contact created!",
    "contactId" => (int) $pdo->lastInsertId()
], 201);
