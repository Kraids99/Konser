<?php

class Transaction {

    private $db;
    private $table = "transactions";

    public function __construct($conn)
    {
        $this->db = $conn;
    }

    public function insertTransaction($user_id, $ticket_id, $ticket_token, $quantity, $total)
    {
        $query = "INSERT INTO {$this->table} ($user_id, $ticket_id, $ticket_token, $quantity, $total) VALUES (?, ?, ?, ?, ?)";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "iisid", $user_id, $ticket_id, $ticket_token, $quantity, $total);
        
        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function findById($id)
    {
        $query = "SELECT * FROM transactions WHERE transaction_id = ?";
        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data email
        mysqli_stmt_bind_param($stmt, "i", $id); 
        
        // jalankan query
        mysqli_stmt_execute($stmt);

        // ambil hasil dari database
        $result = mysqli_stmt_get_result($stmt);
        
        // ambil data 1 baris sebagai array
        return mysqli_fetch_assoc($result);
    }

    public function deleteTransaction($id)
    {
        $query = "DELETE FROM {$this->table} WHERE transaction_id = ?";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "i", $id);

        // jalankan query
        return mysqli_stmt_execute($stmt);
    }
}
