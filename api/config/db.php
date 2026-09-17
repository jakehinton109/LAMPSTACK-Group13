<?php

$host = getenv("DB_HOST");
$dbname = getenv("DB_NAME");
$username = getenv("DB_USER");
$password = getenv("DB_PASSWORD");
$port = getenv("DB_PORT");
$charset = getenv("DB_CHARSET");

try
{
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset",
        $username,
        $password
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    $pdo->setAttribute(
        PDO::ATTR_DEFAULT_FETCH_MODE,
        PDO::FETCH_ASSOC
    );
}
catch(PDOException $e)
{
    http_response_code(500);

    echo json_encode([
        "error" => "Database connection failed"
    ]);

    exit();
}
?>
