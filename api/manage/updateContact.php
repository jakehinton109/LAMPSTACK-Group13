<?php

require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "PUT")
{
    sendJson(["error" => "Method not allowed"], 405);
}

$user = requireAuth();

$id = isset($_GET["id"])
    ? (int) $_GET["id"]
    : 0;

if ($id <= 0)
{
    sendJson(["error" => "GOod contact id is required"], 400);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data)
{
    sendJson(["error" => "Request needs to be json"], 400);
}

if (empty($data["firstName"]) || empty($data["lastName"]))
{
    sendJson([
        "error" => "firstName and lastName are required params"
    ], 400);
}

require_once __DIR__ . "/../config/db.php";

if ($user["role"] === "Admin")
{
    $statement = $pdo->prepare(
        "UPDATE Contacts
        SET
            FirstName = :firstName,
            LastName = :lastName,
            Phone = :phone,
            Email = :email,
            TeamName = :teamName,
            Position = :position,
            Side = :side
        WHERE ID = :id"
    );

    $statement->execute([
        ":firstName" => trim($data["firstName"]),
        ":lastName" => trim($data["lastName"]),
        ":phone" => empty($data["phone"])
            ? null
            : trim($data["phone"]),
        ":email" => empty($data["email"])
            ? null
            : trim($data["email"]),
        ":teamName" => empty($data["teamName"])
            ? null
            : trim($data["teamName"]),
        ":position" => empty($data["position"])
            ? null
            : trim($data["position"]),
        ":side" => empty($data["side"])
            ? null
            : trim($data["side"]),
        ":id" => $id
    ]);
}
else
{
    $statement = $pdo->prepare(
        "UPDATE Contacts
        SET
            FirstName = :firstName,
            LastName = :lastName,
            Phone = :phone,
            Email = :email,
            TeamName = :teamName,
            Position = :position,
            Side = :side
        WHERE ID = :id
        AND UserID = :userId"
    );

    $statement->execute([
        ":firstName" => trim($data["firstName"]),
        ":lastName" => trim($data["lastName"]),
        ":phone" => empty($data["phone"])
            ? null
            : trim($data["phone"]),
        ":email" => empty($data["email"])
            ? null
            : trim($data["email"]),
        ":teamName" => empty($data["teamName"])
            ? null
            : trim($data["teamName"]),
        ":position" => empty($data["position"])
            ? null
            : trim($data["position"]),
        ":side" => empty($data["side"])
            ? null
            : trim($data["side"]),
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
    "message" => "Contact updated!"
]);
