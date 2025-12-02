<?php

class Ticket {

    private $db;
    private $table = "tickets";
    private $eventTable = "events";
    private $locationTable = "locations";

    public function __construct($conn)
    {
        $this->db = $conn;
    }

    public function createTicket($event_id, $ticket_type, $price)
    {
        $query = "INSERT INTO {$this->table} (event_id, ticket_type, price) VALUES (?, ?, ?)";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "isd", $event_id, $ticket_type, $price);
        
        // jalankan query
        return mysqli_stmt_execute($stmt);
    }
    public function updateTicket($id, $event_id, $ticket_type, $price)
    {
        $query = "UPDATE {$this->table} SET event_id = ?, ticket_type = ?, price = ? WHERE ticket_id = ?";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "isdi", $event_id, $ticket_type, $price, $id);

        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function getAll(){
        $query = "SELECT t.*, e.event_name, e.location_id, l.city, l.address, l.latitude, l.longitude
                  FROM {$this->table} t
                  JOIN {$this->eventTable} e ON t.event_id = e.event_id
                  LEFT JOIN {$this->locationTable} l ON e.location_id = l.location_id";

        $stmt = mysqli_prepare($this->db, $query);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        return mysqli_fetch_all($result, MYSQLI_ASSOC);
    }

    //sama saja kek findById
    public function getById($id)
    {
        $query = "SELECT t.*, e.event_name, e.location_id, l.city, l.address, l.latitude, l.longitude
                  FROM {$this->table} t
                  JOIN {$this->eventTable} e ON t.event_id = e.event_id
                  LEFT JOIN {$this->locationTable} l ON e.location_id = l.location_id
                  WHERE t.ticket_id = ?";

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

    public function deleteTicket($id)
    {
        $query = "DELETE FROM {$this->table} WHERE ticket_id = ?";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);

        // ngisi data
        mysqli_stmt_bind_param($stmt, "i", $id);

        // jalankan query
        return mysqli_stmt_execute($stmt);
    }
}
