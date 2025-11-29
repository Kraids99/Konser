<?php

require_once __DIR__ . '/../models/Ticket.php';

class TicketController
{
    private $ticket;

    public function __construct($conn)
    {
        $this->ticket = new Ticket($conn);
    }

    // get all 
    public function index()
    {
        header('Content-Type: application/json');

        $tickets = $this->ticket->getAll();

        echo json_encode(["status" => "success", "data" => $tickets]);
    }

    // get by id
    public function show()
    {
        header('Content-Type: application/json');

        $id = $_GET['id'] ?? null;

        // cek ada id atau engga
        if(!$id) 
        {
            echo json_encode(["status" => "error", "message" => "ID ticket tidak ada!"]);
            return;
        }

        $ticket = $this->ticket->getById($id);

        // cek ticket ada atau engga
        if(!$ticket)
        {
            echo json_encode(["status" => "error", "message" => "Ticket tidak ditemukan!"]);
            return;
        }

        // sukses
        echo json_encode(["status" => "success", "data" => $ticket]);
    }

    // create 
    public function store()
    {
        header('Content-Type: application/json');

        $event_id = $_POST['event_id'] ?? '';
        $ticket_type = $_POST['ticket_type'] ?? '';
        $price = $_POST['price'] ?? 0;

        // ngecek id, type, price
        if(!$event_id || !$ticket_type || !$price)
        {
            echo json_encode(["status" => "error", "message" => "event_id, ticket_type, price tidak ada!"]);
            return;
        }

        $result = $this->ticket->createTicket($event_id, $ticket_type, $price);

        // ngecek sukses atau engga
        if($result) 
        {
            echo json_encode(["status" => "success", "message" => "Ticket berhasil dibuat!"]);
        } 
        else 
        {
            echo json_encode(["status" => "error", "message" => "Gagal membuat ticket!"]);
        }
    }

    // update 
    public function update()
    {
        header('Content-Type: application/json');

        $ticket_id = $_POST['ticket_id'] ?? '';
        $event_id = $_POST['event_id'] ?? '';
        $ticket_type = $_POST['ticket_type'] ?? '';
        $price = $_POST['price'] ?? 0;

        // ngecek id , nama, lokasi, dan tanggal
        if(!$ticket_id || !$event_id || !$ticket_type || !$price) 
        {
            echo json_encode(["status" => "error", "message" => "Ticket id, Event id, Ticket Type, dan Price tidak ada!"]);
            return;
        }

        $result = $this->ticket->updateTicket($ticket_id, $event_id, $ticket_type, $price);

        // cek sukses atau engga
        if($result) 
        {
            echo json_encode(["status" => "success", "message" => "Ticket berhasil diUpdate!"]);
        } 
        else 
        {
            echo json_encode(["status" => "error", "message" => "Gagal update ticket!"]);
        }
    }

    // delete
    public function delete()
    {
        header('Content-Type: application/json');

        $id = $_POST['ticket_id'] ?? null;

        // cek id
        if(!$id) 
        {
            echo json_encode(["status" => "error", "message" => "Id ticket kosong!"]);
            return;
        }

        $result = $this->ticket->deleteTicket($id);

        // cek sukses atau engga
        if($result) 
        {
            echo json_encode(["status" => "success", "message" => "Ticket berhasil diDelete!"]);
        } 
        else 
        {
            echo json_encode(["status" => "error", "message" => "Gagal delete ticket!"]);
        }
    }
}
