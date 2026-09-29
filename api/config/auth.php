<?php

require_once __DIR__ . "/db.php";

function getRequestUserId()
{
    if (!empty($_SERVER["HTTP_X_USER_ID"]))
    {
        return (int) $_SERVER["HTTP_X_USER_ID"];
    }

    return 0;
}

function requireAuth()
{
    global $pdo;

    $userId = getRequestUserId();

    if ($userId <= 0)
    {
        sendJson(["error" => "Please log in first."], 401);
    }

    // Look up the user every time so disabled users get blocked right away.
    $statement = $pdo->prepare(
        "SELECT ID, FirstName, LastName, Login, TeamName, Role, Disabled
         FROM Users
         WHERE ID = :id"
    );

    $statement->execute([
        ":id" => $userId
    ]);

    $user = $statement->fetch();

    if (!$user)
    {
        sendJson(["error" => "We could not find that user."], 401);
    }

    if ((int) $user["Disabled"] === 1)
    {
        sendJson(["error" => "This account is suspended."], 403);
    }

    return [
        "id" => (int) $user["ID"],
        "firstName" => $user["FirstName"],
        "lastName" => $user["LastName"],
        "login" => $user["Login"],
        "teamName" => $user["TeamName"],
        "role" => $user["Role"],
        "disabled" => (bool) $user["Disabled"]
    ];
}

function requireAdmin()
{
    $user = requireAuth();

    if ($user["role"] !== "Admin")
    {
        sendJson(["error" => "You need an admin account to do that."], 403);
    }

    return $user;
}
?>
