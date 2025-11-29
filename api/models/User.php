<?php

// s = string
// i = integer
// d = double	
// b = blob	

class User 
{
    private $db;
    private $table = "users";

    public function __construct($conn)
    {
        $this->db = $conn;
    }

     // create user
    public function createUser($username, $email, $password, $role)
    {
        $query = "INSERT INTO {$this->table} (username, email, password, role) VALUES (?, ?, ?, ?)";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "ssss", $username, $email, $password, $role);
        
        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function updateUser($id, $username, $email)
    {
        $query = "UPDATE {$this->table} SET username = ?, email = ? WHERE user_id = ?";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "ssi", $username, $email, $id);

        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function updateProfilePicture($id, $fileName)
    {
        $query = "UPDATE {$this->table} SET user_profile = ? WHERE user_id = ?";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "si", $fileName, $id);

        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function updatePassword($id, $password)
    {
        $query = "UPDATE {$this->table} SET password = ? WHERE user_id = ?";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "si", $password, $id);

        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function findByEmail($email)
    {
        $query = "SELECT * FROM users WHERE email=?";
        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data email
        mysqli_stmt_bind_param($stmt, "s", $email); 
        
        // jalankan query
        mysqli_stmt_execute($stmt);

        // ambil hasil dari database
        $result = mysqli_stmt_get_result($stmt);
        
        // ambil data 1 baris sebagai array
        return mysqli_fetch_assoc($result);
    }


    public function getById($id)
    {
        $query = "SELECT * FROM {$this->table} WHERE user_id = ?";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "i", $id);

        // jalankan query
        mysqli_stmt_execute($stmt);

        // ambil hasil dari database
        $result = mysqli_stmt_get_result($stmt);

        // ambil data 1 baris sebagai array
        return mysqli_fetch_assoc($result);
    }

    // delete user
    public function deleteUser($id)
    {
        $query = "DELETE FROM {$this->table} WHERE user_id = ?";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "i", $id);

        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function getAll(){
        $query = "SELECT * FROM users";

        $stmt = mysqli_prepare($this->db, $query);

        mysqli_stmt_execute($stmt);

        $result = mysqli_stmt_get_result($stmt);
        return mysqli_fetch_all($result, MYSQLI_ASSOC);
    }

    // remember Token
    public function saveLoginToken($id, $token)
    {
        $query = "INSERT INTO token (user_id, token) VALUES (?, ?)";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);
        
        // ngisi data
        mysqli_stmt_bind_param($stmt, "is", $id, $token);

        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    // find token
    public function findByToken($token)
    {
        $query = "SELECT users.* FROM users JOIN token ON token.user_id = users.user_id WHERE token.token = ?";

        $stmt = mysqli_prepare($this->db, $query);
        mysqli_stmt_bind_param($stmt, "s", $token);
        mysqli_stmt_execute($stmt);

        $result = mysqli_stmt_get_result($stmt);
        return mysqli_fetch_assoc($result);
    }

    // logout
    public function deleteToken($id)
    {
        $query = "DELETE FROM token WHERE user_id = ?";

        $stmt = mysqli_prepare($this->db, $query);
        mysqli_stmt_bind_param($stmt, "i", $id);

        return mysqli_stmt_execute($stmt);
    }
}
