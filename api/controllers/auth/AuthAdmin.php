<?php
require_once __DIR__ . '/auth.php';

if ($_SESSION['role'] !== 'admin') {
    header("Location: ../../frontend/auth/unauthorized.html");
    exit;
}
