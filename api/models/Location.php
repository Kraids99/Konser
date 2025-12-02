<?php

class Location
{
    private $db;
    private $table = "locations";

    public function __construct($conn)
    {
        $this->db = $conn;
    }

    public function getAll()
    {
        $query = "SELECT * FROM {$this->table}";
        $stmt = mysqli_prepare($this->db, $query);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        return mysqli_fetch_all($result, MYSQLI_ASSOC);
    }

    public function getById($id)
    {
        $query = "SELECT * FROM {$this->table} WHERE location_id = ?";
        $stmt = mysqli_prepare($this->db, $query);
        mysqli_stmt_bind_param($stmt, "i", $id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        return mysqli_fetch_assoc($result);
    }
}
