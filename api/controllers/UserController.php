<?php

require_once __DIR__ . '/../models/User.php';

class UserController
{
    private $user;
    private $uploadDir;

    public function __construct($conn)
    {
        $this->user = new User($conn);
        // Folder tujuan upload foto profil
        $this->uploadDir = __DIR__ . '/../storage/profile/';
        if(!is_dir($this->uploadDir)) 
        {
            // 0755 untuk akses folder linux (windows g kepakai)
            mkdir($this->uploadDir, 0755, true);
        }
    }

    // Ambil user_id dari sesi login; jika belum ada, boleh fallback dari request (misal admin)
    private function requireSessionUser()
    {
        if (session_status() === PHP_SESSION_NONE) 
        {
            // $_SESSION dipakai untuk simpan data login di server
            session_start();
        }
        // fallback: boleh kirim user_id manual (misal dari admin panel)
        return $_SESSION['user_id'] ?? ($_POST['user_id'] ?? $_GET['user_id'] ?? null);
    }

    // GET profil user login (tanpa kirim hash password)
    public function show()
    {
        header('Content-Type: application/json');

        $userId = $this->requireSessionUser();
        if(!$userId) 
        {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Tidak ada sesi login!"]);
            return;
        }

        $user = $this->user->getById($userId);
        if (!$user) 
        {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "User tidak ditemukan!"]);
            return;
        }

        unset($user['password']); // jangan expose hash password

        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $user]);
    }

    // POST update username + email (cek email bentrok)
    public function updateProfile()
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method harus POST!"]);
            return;
        }

        $userId = $this->requireSessionUser();
        if(!$userId) 
        {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Tidak ada sesi login!"]);
            return;
        }

        $username = trim($_POST['username'] ?? '');
        $email = trim($_POST['email'] ?? '');

        if (!$username || !$email) 
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Username dan email harus diisi!"]);
            return;
        }

        $existing = $this->user->findByEmail($email);
        if ($existing && (int)$existing['user_id'] !== (int)$userId) 
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email sudah dipakai user lain!"]);
            return;
        }

        $updated = $this->user->updateUser($userId, $username, $email);

        if ($updated) 
        {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Profil diperbarui!"]);
        } 
        else
        {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal update profil!"]);
        }
    }

    // POST update password (hash sha256)
    public function updatePassword()
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') 
        {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method harus POST!"]);
            return;
        }

        $userId = $this->requireSessionUser();
        if (!$userId) 
        {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Tidak ada sesi login!"]);
            return;
        }

        $newPassword = $_POST['new_password'] ?? '';
        if (strlen($newPassword) < 6) 
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Password minimal 6 karakter!"]);
            return;
        }

        $hash = hash('sha256', $newPassword);
        $updated = $this->user->updatePassword($userId, $hash);

        if ($updated) 
        {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Password diperbarui!"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal update password!"]);
        }
    }

    // POST upload foto profil (FormData key: profile)
    public function updateProfilePicture()
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') 
        {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method harus POST!"]);
            return;
        }

        $userId = $this->requireSessionUser();
        if (!$userId) 
        {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Tidak ada sesi login!"]);
            return;
        }

        if (!isset($_FILES['profile'])) 
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "File foto (profile) wajib di-upload!"]);
            return;
        }

        $file = $_FILES['profile'];

        if ($file['error'] !== UPLOAD_ERR_OK) 
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Upload gagal (error code: {$file['error']})!"]);
            return;
        }

        $allowedMime = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
        ];

        $mime = mime_content_type($file['tmp_name']);
        if (!isset($allowedMime[$mime])) 
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Format file harus jpg/png!"]);
            return;
        }

        // cek size img
        // if ($file['size'] > 2 * 1024 * 1024) 
        // {
        //     http_response_code(413);
        //     echo json_encode(["status" => "error", "message" => "Ukuran file maksimal 2MB!"]);
        //     return;
        // }

        $ext = $allowedMime[$mime];
        $fileName = 'user_' . $userId . '_' . time() . '.' . $ext;
        $target = $this->uploadDir . $fileName;

        // ambil foto lama dulu supaya bisa dihapus setelah update
        $current = $this->user->getById($userId);
        $oldPhoto = $current['user_profile'] ?? null;

        if(!move_uploaded_file($file['tmp_name'], $target)) 
        {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal menyimpan file!"]);
            return;
        }

        $updated = $this->user->updateProfilePicture($userId, $fileName);
        if($updated)
        {
            if($oldPhoto && file_exists($this->uploadDir . $oldPhoto))
            {
                @unlink($this->uploadDir . $oldPhoto);
            }
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Foto profil diperbarui!", "file" => $fileName]);
        } 
        else 
        {
            // rollback file baru kalau DB gagal
            @unlink($target);
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal update foto di database!"]);
        }
    }
}
