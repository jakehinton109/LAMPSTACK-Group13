<?php

function loadEnv($path)
{
    if (!file_exists($path))
    {
        return;
    }

    $lines = file(
        $path,
        FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES
    );

    foreach ($lines as $line)
    {
        $line = trim($line);

        if ($line === "" || str_starts_with($line, "#"))
        {
            continue;
        }

        $parts = explode("=", $line, 2);

        if (count($parts) !== 2)
        {
            continue;
        }

        $name = trim($parts[0]);
        $value = trim($parts[1]);

        putenv("$name=$value");
        $_ENV[$name] = $value;
    }
}

function sendJson($data, $statusCode = 200)
{
    http_response_code($statusCode);

    header("Content-Type: application/json");

    echo json_encode($data);

    exit();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS")
{
    http_response_code(200);
    exit();
}

loadEnv("/var/www/html/lamp/.env");
?>
