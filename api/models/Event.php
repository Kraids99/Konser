<?php

class Event {

    private $db;
    private $table = "events";

    public function __construct($conn)
    {
        $this->db = $conn;
    }

    public function createEvent($event_name, $event_location, $event_date, $quota)
    {
        $query = "INSERT INTO {$this->table} ($event_name, $event_location, $event_date, $quota) VALUES (?, ?, ?, ?)";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "sssi", $event_name, $event_location, $event_date, $quota);
        
        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function updateEvent($id, $event_name, $event_location, $event_date, $quota)
    {
        $query = "UPDATE {$this->table} SET event_name = ?, event_location = ?, event_date = ?, quota = ?, WHERE event_id = ?";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "sssii", $event_name, $event_location, $event_date, $quota, $id);

        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function findByName($event_name)
    {
        $query = "SELECT * FROM events WHERE event_name = ?";
        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data email
        mysqli_stmt_bind_param($stmt, "s", $event_name); 
        
        // jalankan query
        mysqli_stmt_execute($stmt);

        // ambil hasil dari database
        $result = mysqli_stmt_get_result($stmt);
        
        // ambil data 1 baris sebagai array
        return mysqli_fetch_assoc($result);
    }

    public function getById($id)
    {
        $query = "SELECT * FROM {$this->table} WHERE event_id = ?";

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

    public function deleteEvent($id)
    {
        $query = "DELETE FROM {$this->table} WHERE event_id = ?";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "i", $id);

        // jalankan query
        return mysqli_stmt_execute($stmt);
    }
}
