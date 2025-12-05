<?php

require_once __DIR__ . '/../models/Location.php';

class LocationController
{
    private $location;

    public function __construct($conn)
    {
        $this->location = new Location($conn);
    }

    // GET all locations
    public function index()
    {
        header('Content-Type: application/json');
        $locations = $this->location->getAll();
        echo json_encode(["status" => "success", "data" => $locations]);
    }

    // GET by id
    public function show()
    {
        header('Content-Type: application/json');
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(["status" => "error", "message" => "ID lokasi tidak ada!"]);
            return;
        }

        $loc = $this->location->getById($id);
        if (!$loc) {
            echo json_encode(["status" => "error", "message" => "Lokasi tidak ditemukan!"]);
            return;
        }

        echo json_encode(["status" => "success", "data" => $loc]);
    }
}
