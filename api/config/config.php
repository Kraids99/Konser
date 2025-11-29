<?php

// nyambungin ke env
$env = parse_ini_file(__DIR__ . '/../.env');

if ($env === false) {
    die("Error: File konfigurasi .env tidak ditemukan atau tidak dapat dibaca di " . __DIR__ . "/../.env");
}

return $env;