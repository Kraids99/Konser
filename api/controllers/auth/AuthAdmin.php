<?php
require_once __DIR__ . '/Auth.php';

if ($_SESSION['role'] !== 'admin') {
    header("Location: ../../frontend/auth/unauthorized.html");
    exit;
}
