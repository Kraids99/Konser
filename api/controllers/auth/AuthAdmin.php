<?php
require_once __DIR__ . '/auth.php';

if ($_SESSION['role'] !== 'admin') {
    header("Location: ../../frontend/customerDashboard.html");
    exit;
}
