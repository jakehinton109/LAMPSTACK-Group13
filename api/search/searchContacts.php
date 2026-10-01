<?php

require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET")
{
    sendJson(["error" => "Method not allowed"], 405);
}

$user = requireAuth();

require_once __DIR__ . "/../config/db.php";

$search = isset($_GET["q"])
    ? trim($_GET["q"])
    : "";

if ($search === "")
{
    sendJson(["error" => "Search query is required"], 400);
}

$searchLower = strtolower($search);
// We do a simple search for the likely rows. Gets limit 100. This is bad should be improved with better db design if needed.

if ($user["role"] === "Admin")
{
    $sql = "
        SELECT
            Contacts.ID,
            Contacts.FirstName,
            Contacts.LastName,
            Contacts.Phone,
            Contacts.Email,
            Contacts.Position,
            Contacts.Side,
            COALESCE(Contacts.TeamName, Users.TeamName) AS TeamName
        FROM Contacts
        INNER JOIN Users
            ON Contacts.UserID = Users.ID
        WHERE
            (
                Contacts.FirstName LIKE :starts
                OR Contacts.LastName LIKE :starts
                OR Contacts.Position LIKE :starts
                OR Contacts.Side LIKE :starts
                OR Contacts.TeamName LIKE :starts
                OR Users.TeamName LIKE :starts
                OR Contacts.FirstName LIKE :contains
                OR Contacts.LastName LIKE :contains
                OR Contacts.Position LIKE :contains
                OR Contacts.Side LIKE :contains
                OR Contacts.TeamName LIKE :contains
                OR Users.TeamName LIKE :contains
            )
        LIMIT 100
    ";
}
else
{
    $sql = "
        SELECT
            Contacts.ID,
            Contacts.FirstName,
            Contacts.LastName,
            Contacts.Phone,
            Contacts.Email,
            Contacts.Position,
            Contacts.Side,
            COALESCE(Contacts.TeamName, Users.TeamName) AS TeamName
        FROM Contacts
        INNER JOIN Users
            ON Contacts.UserID = Users.ID
        WHERE
            (
                Contacts.FirstName LIKE :starts
                OR Contacts.LastName LIKE :starts
                OR Contacts.Position LIKE :starts
                OR Contacts.Side LIKE :starts
                OR Contacts.TeamName LIKE :starts
                OR Users.TeamName LIKE :starts
                OR Contacts.FirstName LIKE :contains
                OR Contacts.LastName LIKE :contains
                OR Contacts.Position LIKE :contains
                OR Contacts.Side LIKE :contains
                OR Contacts.TeamName LIKE :contains
                OR Users.TeamName LIKE :contains
            )
            AND Contacts.UserID = :userId
        LIMIT 100
    ";
}

$statement = $pdo->prepare($sql);

if ($user["role"] === "Admin")
{
    $statement->execute([
        ":starts" => $search . "%",
        ":contains" => "%" . $search . "%"
    ]);
}
else
{
    $statement->execute([
        ":starts" => $search . "%",
        ":contains" => "%" . $search . "%",
        ":userId" => $user["id"]
    ]);
}

$contacts = $statement->fetchAll();

$matches = [];

foreach ($contacts as $contact)
{
    $firstName = strtolower($contact["FirstName"] ?? "");
    $lastName = strtolower($contact["LastName"] ?? "");
    $fullName = trim($firstName . " " . $lastName);
    $teamName = strtolower($contact["TeamName"] ?? "");
    $position = strtolower($contact["Position"] ?? "");
    $side = strtolower($contact["Side"] ?? "");

    $score = max(
        calculateSimilarity($searchLower, $firstName),
        calculateSimilarity($searchLower, $lastName),
        calculateSimilarity($searchLower, $fullName),
        calculateSimilarity($searchLower, $teamName),
        calculateSimilarity($searchLower, $position),
        calculateSimilarity($searchLower, $side)
    );

    if ($score >= 40)
    {
        $matches[] = [
            "id" => (int) $contact["ID"],
            "firstName" => $contact["FirstName"],
            "lastName" => $contact["LastName"],
            "phone" => $contact["Phone"],
            "email" => $contact["Email"],
            "position" => $contact["Position"],
            "side" => $contact["Side"],
            "teamName" => $contact["TeamName"],
            "similarity" => round($score, 2)
        ];
    }
}

usort($matches, function ($a, $b)
{
    return $b["similarity"] <=> $a["similarity"];
});

$matches = array_slice($matches, 0, 20);

sendJson([
    "query" => $search,
    "count" => count($matches),
    "results" => $matches
]);

function calculateSimilarity($search, $value)
{
    if ($value === "")
    {
        return 0;
    }

    if ($search === $value)
    {
        return 100;
    }

    if (str_starts_with($value, $search))
    {
        return 95;
    }

    if (str_contains($value, $search))
    {
        return 90;
    }

    $distance = levenshtein($search, $value);

    $maxLength = max(
        strlen($search),
        strlen($value)
    );

    if ($maxLength === 0)
    {
        return 0;
    }

    return (1 - ($distance / $maxLength)) * 100;
}
