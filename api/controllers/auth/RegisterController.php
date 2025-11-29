<?php

require_once __DIR__ . '/../../models/User.php';

class RegisterController
{
    private $user;

    // buat object
    public function __construct($conn)
    {
        $this->user = new User($conn);
    }

    public function register()
    {
        // Kita mau balikin JSON
        header('Content-Type: application/json');

        // Pastikan method POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode([ "status"  => "error", "message" => "Method not allowed, gunakan POST."]);
            return;
        }

        $username = $_POST['username'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        if(!$username || !$email || !$password)
        {
            echo json_encode(["status => "error])
        }
    }
}