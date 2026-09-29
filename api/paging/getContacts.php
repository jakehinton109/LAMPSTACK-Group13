<?php

require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET")
{
    sendJson(["error" => "Method not allowed"], 405);
}

$user = requireAuth();

require_once __DIR__ . "/../config/db.php";

$page = isset($_GET["page"])
    ? (int) $_GET["page"]
    : 1;

$limit = isset($_GET["limit"])
    ? (int) $_GET["limit"]
    : 20;

if ($page < 1)
{
    $page = 1;
}

if ($limit < 1 || $limit > 100)
{
    $limit = 20;
}

$offset = ($page - 1) * $limit;

if ($user["role"] === "Admin")
{
    $countStatement = $pdo->prepare(
        "SELECT COUNT(*) AS Total
         FROM Contacts"
    );

    $statement = $pdo->prepare(
        "SELECT
            Contacts.ID,
            Contacts.FirstName,
            Contacts.LastName,
            Contacts.Phone,
            Contacts.Email,
            Contacts.Position,
            Contacts.Side,
            Contacts.UserID,
            Users.TeamName
         FROM Contacts
         INNER JOIN Users
            ON Contacts.UserID = Users.ID
         ORDER BY Contacts.ID ASC
         LIMIT :limit OFFSET :offset"
    );

    $countStatement->execute();
}
else
{
    $countStatement = $pdo->prepare(
        "SELECT COUNT(*) AS Total
         FROM Contacts
         WHERE UserID = :userId"
    );

    $statement = $pdo->prepare(
        "SELECT
            Contacts.ID,
            Contacts.FirstName,
            Contacts.LastName,
            Contacts.Phone,
            Contacts.Email,
            Contacts.Position,
            Contacts.Side,
            Contacts.UserID,
            Users.TeamName
         FROM Contacts
         INNER JOIN Users
            ON Contacts.UserID = Users.ID
         WHERE Contacts.UserID = :userId
         ORDER BY Contacts.ID ASC
         LIMIT :limit OFFSET :offset"
    );

    $countStatement->execute([
        ":userId" => $user["id"]
    ]);

    $statement->bindValue(":userId", $user["id"], PDO::PARAM_INT);
}

$statement->bindValue(":limit", $limit, PDO::PARAM_INT);
$statement->bindValue(":offset", $offset, PDO::PARAM_INT);
$statement->execute();

$contacts = $statement->fetchAll();
$count = $countStatement->fetch();

$results = [];

foreach ($contacts as $contact)
{
    $results[] = [
        "id" => (int) $contact["ID"],
        "firstName" => $contact["FirstName"],
        "lastName" => $contact["LastName"],
        "phone" => $contact["Phone"],
        "email" => $contact["Email"],
        "position" => $contact["Position"],
        "side" => $contact["Side"],
        "userId" => (int) $contact["UserID"],
        "teamName" => $contact["TeamName"]
    ];
}

sendJson([
    "page" => $page,
    "limit" => $limit,
    "total" => (int) $count["Total"],
    "count" => count($results),
    "results" => $results
]);
?>
