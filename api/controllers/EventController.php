<?php

require_once __DIR__ . '/../models/Event.php';

class EventController
{
    private $event;

    public function __construct($conn)
    {
        $this->event = new Event($conn);
    }

    // get all 
    public function index()
    {
        header('Content-Type: application/json');

        $events = $this->event->getAll();

        echo json_encode(["status" => "success", "data" => $events]);
    }

    // get by id
    public function show()
    {
        header('Content-Type: application/json');

        $id = $_GET['id'] ?? null;

        // cek ada id atau engga
        if(!$id) 
        {
            echo json_encode(["status" => "error", "message" => "ID event tidak ada!"]);
            return;
        }

        $event = $this->event->getById($id);

        // cek event ada atau engga
        if(!$event)
        {
            echo json_encode(["status" => "error", "message" => "Event tidak ditemukan!"]);
            return;
        }

        // sukses
        echo json_encode(["status" => "success", "data" => $event]);
    }

    // create 
    public function store()
    {
        header('Content-Type: application/json');

        $name = $_POST['event_name'] ?? '';
        $location = $_POST['event_location'] ?? '';
        $date = $_POST['event_date'] ?? '';
        $quota = $_POST['quota'] ?? 0;

        // ngecek nama lokasi dan tanggal
        if(!$name || !$location || !$date)
        {
            echo json_encode(["status" => "error", "message" => "Event name, location, date tidak ada!"]);
            return;
        }

        $result = $this->event->createEvent($name, $location, $date, $quota);

        // ngecek sukses atau engga
        if($result) 
        {
            echo json_encode(["status" => "success", "message" => "Event berhasil dibuat!"]);
        } 
        else 
        {
            echo json_encode(["status" => "error", "message" => "Gagal membuat event!"]);
        }
    }

    // update 
    public function update()
    {
        header('Content-Type: application/json');

        $id = $_POST['event_id'] ?? '';
        $name = $_POST['event_name'] ?? '';
        $location = $_POST['event_location'] ?? '';
        $date = $_POST['event_date'] ?? '';
        $quota = $_POST['quota'] ?? 0;

        // ngecek id , nama, lokasi, dan tanggal
        if(!$id || !$name || !$location || !$date) 
        {
            echo json_encode(["status" => "error", "message" => "Event name, location, date tidak ada!"]);
            return;
        }

        $result = $this->event->updateEvent($id, $name, $location, $date, $quota);

        // cek sukses atau engga
        if($result) 
        {
            echo json_encode(["status" => "success", "message" => "Event berhasil diUpdate!"]);
        } 
        else 
        {
            echo json_encode(["status" => "error", "message" => "Gagal update event!"]);
        }
    }

    // delete
    public function delete()
    {
        header('Content-Type: application/json');

        $id = $_POST['event_id'] ?? null;

        // cek id
        if(!$id) 
        {
            echo json_encode(["status" => "error", "message" => "Id event kosong!"]);
            return;
        }

        $result = $this->event->deleteEvent($id);

        // cek sukses atau engga
        if($result) 
        {
            echo json_encode(["status" => "success", "message" => "Event berhasil diDelete!"]);
        } 
        else 
        {
            echo json_encode(["status" => "error", "message" => "Gagal delete event!"]);
        }
    }
}
