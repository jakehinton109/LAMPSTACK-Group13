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
$positions = getListParameter("positions");
$sides = getListParameter("sides");

$where = [];
$parameters = [];

if ($user["role"] !== "Admin")
{
    $where[] = "Contacts.UserID = :userId";
    $parameters[":userId"] = $user["id"];
}

if (count($positions) > 0)
{
    $placeholders = [];

    foreach ($positions as $index => $position)
    {
        $name = ":position" . $index;
        $placeholders[] = $name;
        $parameters[$name] = $position;
    }

    $where[] = "Contacts.Position IN (" . implode(", ", $placeholders) . ")";
}

if (count($sides) > 0)
{
    $placeholders = [];

    foreach ($sides as $index => $side)
    {
        $name = ":side" . $index;
        $placeholders[] = $name;
        $parameters[$name] = $side;
    }

    $where[] = "Contacts.Side IN (" . implode(", ", $placeholders) . ")";
}

$whereSql = "";

if (count($where) > 0)
{
    $whereSql = "WHERE " . implode(
        "
            AND ",
        $where
    );
}

$countStatement = $pdo->prepare(
    "SELECT COUNT(*) AS Total
         FROM Contacts
         INNER JOIN Users
            ON Contacts.UserID = Users.ID
         $whereSql"
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
            COALESCE(Contacts.TeamName, Users.TeamName) AS TeamName
         FROM Contacts
         INNER JOIN Users
            ON Contacts.UserID = Users.ID
         $whereSql
         ORDER BY Contacts.ID ASC
         LIMIT :limit OFFSET :offset"
);

foreach ($parameters as $name => $value)
{
    $countStatement->bindValue($name, $value);
    $statement->bindValue($name, $value);
}

$countStatement->execute();
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
    "filters" => [
        "positions" => $positions,
        "sides" => $sides
    ],
    "results" => $results
]);

function getListParameter($name)
{
    if (!isset($_GET[$name]))
    {
        return [];
    }

    $value = $_GET[$name];

    if (!is_array($value))
    {
        $value = explode(",", $value);
    }

    $items = [];

    foreach ($value as $item)
    {
        $item = trim($item);

        if ($item !== "")
        {
            $items[] = $item;
        }
    }

    return array_values(array_unique($items));
}
?>
