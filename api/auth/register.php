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

if (empty($data["firstName"]) || empty($data["lastName"]) ||
    empty($data["login"]) || empty($data["password"]))
{
    sendJson(["error" => "firstName, lastName, login, and password are required"], 400);
}

require_once __DIR__ . "/../config/db.php";

try
{
    // Store the hash, never the actual password.
    $hashedPassword = password_hash($data["password"], PASSWORD_DEFAULT);

    $statement = $pdo->prepare(
        "INSERT INTO Users (FirstName, LastName, Login, Password, TeamName)
         VALUES (:firstName, :lastName, :login, :password, :teamName)"
    );

    $statement->execute([
        ":firstName" => trim($data["firstName"]),
        ":lastName" => trim($data["lastName"]),
        ":login" => trim($data["login"]),
        ":password" => $hashedPassword,
        ":teamName" => empty($data["teamName"]) ? null : trim($data["teamName"])
    ]);

    sendJson([
        "message" => "User registered successfully",
        "userId" => (int) $pdo->lastInsertId()
    ], 201);
}
catch (PDOException $e)
{
    if ($e->getCode() === "23000")
    {
        sendJson(["error" => "Login already exists"], 409);
    }

    sendJson(["error" => "Registration failed"], 500);
}
