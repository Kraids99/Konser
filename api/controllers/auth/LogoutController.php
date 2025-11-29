<?php

require_once __DIR__ . '/../../models/User.php';

class LogoutController
{
    private $user;

    public function __construct($conn)
    {
        $this->user = new User($conn);
    }

    public function logout()
    {
        header("Content-Type: application/json");

        session_start();

        // cek user udah login atau belum
        if (!isset($_SESSION['user_id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Belum login!"]);
            return;
        }

        $user_id = $_SESSION['user_id'];

        // hapus token remember me dari DB
        $this->user->deleteToken($user_id);

        // hapus cookie remember me
        if (isset($_COOKIE['remember_token'])) {
            setcookie("remember_token", "", time() - 3600, "/");
        }

        // hapus sesi
        session_unset();
        session_destroy();

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Logout berhasil!"]);
    }
}
