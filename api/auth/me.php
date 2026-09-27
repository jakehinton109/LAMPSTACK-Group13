<?php

require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET")
{
    sendJson(["error" => "Method not allowed"], 405);
}

$user = requireAuth();

sendJson([
    "user" => $user
]);
