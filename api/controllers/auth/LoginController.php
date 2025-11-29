<?php

require_once __DIR__ . '/../../models/User.php';

class LoginController
{
    private $user;

    public function __construct($conn)
    {
        $this->user = new User($conn);
    }

    public function login()
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') 
        {
            http_response_code(405);
            echo json_encode(["status"  => "error", "message" => "Method harus POST."]);
            return;
        }

        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $remember = isset($_POST['remember']);

        if(!$email || !$password)
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email, dan password harus diisi!"]);
            return;
        }

        // cari user by email
        $user = $this->user->findByEmail($email);
        if(!$user)
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email tidak ada!"]);
            return;
        }

        $hashPass = hash('sha256', $password);
        if($hashPass !== $user['password'])
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Password salah!"]);
            return;
        }

        session_start();
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['username'] = $user['username'];

        // remember (opsional belum pasti pakai)
        if($remember) 
        {

            $token = bin2hex(random_bytes(32));

            // simpan token di database
            $this->user->saveLoginToken($user['user_id'], $token);

            // simpan cookie 30 hari
            setcookie("remember_token", $token, time() + (86400 * 30), "/");
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Login berhasil!",
            "data" => [
                "user_id"  => $user['user_id'],
                "username" => $user['username'],
                "role" => $user['role']
            ]
        ]);

    }


}




