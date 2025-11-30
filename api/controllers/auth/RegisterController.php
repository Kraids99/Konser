<?php

require_once __DIR__ . '/../../models/User.php';

// 200 = OK
// 201 = create
// 400 = bad request
// 401 = unAuth
// 404 = not Found
// 405 = Method not allow
// 500 = Internal server error

class RegisterController
{
    private $user;

    // panggil yg model buat connect database
    public function __construct($conn)
    {
        $this->user = new User($conn);
    }

    public function register()
    {
        // soalnya kita mau balikin JSON
        header('Content-Type: application/json');

        // cek method POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode([ "status" => "error", "message" => "Method harus POST!"]);
            return;
        }

        $username = $_POST['username'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        // kalau pakai balikinya json di frontend formatnya harus ini 
        // $data = json_decode(file_get_contents("php://input"), true);
        // $username = $data['username'] ?? '';
        // $email    = $data['email'] ?? '';
        // $password = $data['password'] ?? '';

        // cek pengisian
        if(!$username || !$email || !$password)
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Username, email, dan password harus diisi!"]);
            return;
        }

        // cek pass
        if(strlen($password) < 6)
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Password minimal 6 karakter!"]);
            return;
        }

        // cek email
        $haveEmail = $this->user->findByEmail($email);
        if($haveEmail)
        {
            http_response_code(400); 
            echo json_encode(["status" => "error", "message" => "Email sudah ada!"]);
            return;
        }

        $hashPass = hash('sha256', $password);
        $create = $this->user->createUser($username, $email, $hashPass, "user");

        // cek create berhasil ga
        if($create)
        {
            http_response_code(201);
            echo json_encode(["status" => "sucess", "message" => "Registrasi berhasill!"]);
        } 
        else
        {
            http_response_code(500);
            echo json_encode(["status " => "error", "message" => "Registrasi gagal!"]);
        } 
            
    }
}