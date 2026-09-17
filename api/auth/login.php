<?php

require_once __DIR__ . "/../config/helpers.php";

// This endpoint only accepts POST requests.
if ($_SERVER["REQUEST_METHOD"] !== "POST")
{
    sendJson(["error" => "Method not allowed"], 405);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data)
{
    sendJson(["error" => "Request body must be valid JSON"], 400);
}

if (empty($data["login"]) || empty($data["password"]))
{
    sendJson(["error" => "login and password are required"], 400);
}

require_once __DIR__ . "/../config/db.php";

// Find the user by their login name.
$statement = $pdo->prepare(
    "SELECT ID, FirstName, LastName, Login, Password, TeamName
     FROM Users WHERE Login = :login"
);
$statement->execute([":login" => trim($data["login"])]);
$user = $statement->fetch();

// Check the password against the saved hash.
if (!$user || !password_verify($data["password"], $user["Password"]))
{
    sendJson(["error" => "Invalid login or password"], 401);
}

sendJson([
    "message" => "Login successful",
    "user" => [
        "id" => (int) $user["ID"],
        "firstName" => $user["FirstName"],
        "lastName" => $user["LastName"],
        "login" => $user["Login"],
        "teamName" => $user["TeamName"]
    ]
], 200);
