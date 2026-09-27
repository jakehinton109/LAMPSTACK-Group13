<?php

require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET")
{
    sendJson(["error" => "Method not allowed"], 405);
}

requireAdmin();

require_once __DIR__ . "/../config/db.php";

$statement = $pdo->prepare(
    "SELECT
        ID,
        FirstName,
        LastName,
        Login,
        TeamName,
        Role
    FROM Users
    ORDER BY ID ASC"
);

$statement->execute();

$users = $statement->fetchAll();

$results = [];

foreach ($users as $user)
{
    $results[] = [
        "id" => (int) $user["ID"],
        "firstName" => $user["FirstName"],
        "lastName" => $user["LastName"],
        "login" => $user["Login"],
        "teamName" => $user["TeamName"],
        "role" => $user["Role"]
    ];
}

sendJson([
    "count" => count($results),
    "results" => $results
]);
