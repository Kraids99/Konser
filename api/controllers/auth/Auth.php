<?php
session_start();

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';

$userModel = new User($conn);

// jika sudah login, tidak perlu cek remember token
if (isset($_SESSION['user_id'])) {
    return;
}

// kalau ada cookie remember token
if (isset($_COOKIE['remember_token'])) {
    $token = $_COOKIE['remember_token'];

    // cari user berdasarkan token
    $user = $userModel->findByToken($token);

    if ($user) {
        // auto-login
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        return;
    }
}

// kalau tidak login, lempar ke login.html
header("Location: ../../frontend/auth/login.html");
exit;
