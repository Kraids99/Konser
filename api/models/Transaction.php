<?php

class Transaction {

    private $db;
    private $table = "transactions";

    public function __construct($conn)
    {
        $this->db = $conn;
    }

    public function createTransaction($user_id, $ticket_id, $ticket_token, $quantity, $total, $metode_pembayaran)
    {
        $query = "INSERT INTO {$this->table} (user_id, ticket_id, ticket_token, quantity, total, metode_pembayaran) VALUES (?, ?, ?, ?, ?, ?)";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "iisids", $user_id, $ticket_id, $ticket_token, $quantity, $total, $metode_pembayaran);
        
        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function getAll(){
        $query = "SELECT * FROM transactions";

        $stmt = mysqli_prepare($this->db, $query);

        mysqli_stmt_execute($stmt);

        $result = mysqli_stmt_get_result($stmt);
        return mysqli_fetch_all($result, MYSQLI_ASSOC);
    }

    public function getById($id)
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

    public function updateTransaction($id, $user_id, $ticket_id, $ticket_token, $quantity, $total, $metode_pembayaran)
    {
        $query = "UPDATE {$this->table} SET user_id = ?, ticket_id = ?, ticket_token = ?, quantity = ?, total = ?, metode_pembayaran = ? WHERE transaction_id = ?";

        $stmt = mysqli_prepare($this->db, $query);

        mysqli_stmt_bind_param($stmt, "iisidsi", $user_id, $ticket_id, $ticket_token, $quantity, $total,$metode_pembayaran, $id);

        return mysqli_stmt_execute($stmt);
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
