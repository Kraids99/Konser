<?php

class Event {

    private $db;
    private $table = "events";
    private $location = "locations";

    public function __construct($conn)
    {
        $this->db = $conn;
    }

    public function createEvent($event_name, $location_id, $event_date, $quota)
    {
        $query = "INSERT INTO {$this->table} (event_name, location_id, event_date, quota) VALUES (?, ?, ?, ?)";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);
        // ngisi data
        mysqli_stmt_bind_param($stmt, "sisi", $event_name, $location_id, $event_date, $quota);
        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function updateEvent($id, $event_name, $location_id, $event_date, $quota)
    {
        $query = "UPDATE {$this->table} SET event_name = ?, location_id = ?, event_date = ?, quota = ? WHERE event_id = ?";

        // siapin query
        $stmt = mysqli_prepare($this->db, $query);
        // ngisi data
        mysqli_stmt_bind_param($stmt, "sisii", $event_name, $location_id, $event_date, $quota, $id);
        // jalankan query
        return mysqli_stmt_execute($stmt);
    }

    public function getAll()
    {
        // ambil event + total tiket terjual (jumlah quantity dari transaksi)
        $query = "SELECT *, SUM(tn.quantity) AS tickets_sold
                FROM events e
                LEFT JOIN tickets tk ON tk.event_id = e.event_id
                LEFT JOIN transactions tn ON tn.ticket_id = tk.ticket_id
                GROUP BY e.event_id";

        $stmt = mysqli_prepare($this->db, $query);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        return mysqli_fetch_all($result, MYSQLI_ASSOC);
    }

    public function findByName($event_name)
    {
        $query = "SELECT * FROM {$this->table} WHERE event_name = ?";
        // siapin query
        $stmt = mysqli_prepare($this->db, $query);
        // ngisi data email
        mysqli_stmt_bind_param($stmt, "s", $event_name);
        // jalankan query
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        // ambil data 1 baris sebagai array
        return mysqli_fetch_assoc($result);
    }

    public function getById($id)
    {
        // ambil event + total tiket terjual (jumlah quantity dari transaksi)
        $query = "SELECT e.*, COALESCE(s.sold, 0) AS tickets_sold
                  FROM {$this->table} e
                  LEFT JOIN (
                      SELECT tk.event_id, SUM(tn.quantity) AS sold
                      FROM tickets tk
                      LEFT JOIN transactions tn ON tn.ticket_id = tk.ticket_id
                      GROUP BY tk.event_id
                  ) s ON s.event_id = e.event_id
                  WHERE e.event_id = ?";

        $stmt = mysqli_prepare($this->db, $query);
        mysqli_stmt_bind_param($stmt, "i", $id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        return mysqli_fetch_assoc($result);
    }

    public function locationValid($location_id)
    {
        $query = "SELECT location_id FROM {$this->location} WHERE location_id = ?";
        // siapin query
        $stmt = mysqli_prepare($this->db, $query);
        // ngisi data
        mysqli_stmt_bind_param($stmt, "i", $location_id);
        // jalankan query
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        return mysqli_fetch_assoc($result) !== null;
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
