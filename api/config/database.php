<?php

// nyambungin ke database
$env = require __DIR__ . '/config.php';

$username = $env['USERNAME'];
$password = $env['PASSWORD'];
$hostname = $env['HOSTNAME'];
$database = $env['DB_NAME'];

$conn = mysqli_connect($hostname, $username, $password, $database);

if (!$conn) {
    // die("Connection failed: " . mysqli_connect_error());
    error_log(mysqli_connect_error());
    echo "Database sedang bermasalah.";
    exit;
}
