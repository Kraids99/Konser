<?php

require_once __DIR__ . '/../models/Transaction.php';

class TransactionController
{
    private $transaction;

    public function __construct($conn)
    {
        $this->transaction = new Transaction($conn);
    }

    // get all 
    public function index()
    {
        header('Content-Type: aplication/json');

        $transactions = $this->transaction->getAll();

        echo json_encode(["status" => "success", "data" => $transactions]);
    }

    // get by id
    public function show()
    {
        header('Content-Type: application/json');

        $id = $_GET['id'] ?? null;

        // cek ada id atau engga
        if(!$id) 
        {
            echo json_encode(["status" => "error", "message" => "ID transaction tidak ada!"]);
            return;
        }

        $transaction = $this->transaction->getById($id);

        // cek transaction ada atau engga
        if(!$transaction)
        {
            echo json_encode(["status" => "error", "message" => "Transaction tidak ditemukan!"]);
            return;
        }

        // sukses
        echo json_encode(["status" => "success", "data" => $transaction]);
    }

    // create 
    public function store()
    {
        header('Content-Type: application/json');

        $user_id = $_POST['user_id'] ?? '';
        $ticket_id = $_POST['ticket_id'] ?? '';
        $ticket_token = $_POST['ticket_token'] ?? '';
        $quantity = $_POST['quantity'] ?? 0;
        $total = $_POST['total'] ?? 0;

        // ngecek id, type, price
        if(!$user_id || !$ticket_id || !$ticket_token || !$quantity || !$total)
        {
            echo json_encode(["status" => "error", "message" => "user_id, ticket_id, ticket_token, quantity, dan total tidak ada!"]);
            return;
        }

        $result = $this->transaction->createTransaction($user_id, $ticket_id, $ticket_token, $quantity, $total);

        // ngecek sukses atau engga
        if($result) 
        {
            echo json_encode(["status" => "success", "message" => "Transaction berhasil dibuat!"]);
        } 
        else 
        {
            echo json_encode(["status" => "error", "message" => "Gagal membuat transaction!"]);
        }
    }

    // update 
    // public function update()
    // {
    //     header('Content-Type: application/json');

    //     $transaction_id = $_POST['transaction_id'] ?? '';
    //     $user_id = $_POST['user_id'] ?? '';
    //     $ticket_id = $_POST['ticket_id'] ?? '';
    //     $ticket_token = $_POST['ticket_token'] ?? '';
    //     $quantity = $_POST['quantity'] ?? 0;
    //     $total = $_POST['total'] ?? 0;

    //     // ngecek id , nama, lokasi, dan tanggal
    //     if(!$transaction_id || !$user_id || !$ticket_id || !$ticket_token || !$quantity || !$total) 
    //     {
    //         echo json_encode(["status" => "error", "message" => "transaction_id, user_id, ticket_id, ticket_token, quantity, dan total tidak ada!"]);
    //         return;
    //     }

    //     $result = $this->transaction->updateTransaction($transaction_id , $event_id, $transaction_type, $price);

    //     // cek sukses atau engga
    //     if($result) 
    //     {
    //         echo json_encode(["status" => "success", "message" => "Transaction berhasil diUpdate!"]);
    //     } 
    //     else 
    //     {
    //         echo json_encode(["status" => "error", "message" => "Gagal update transaction!"]);
    //     }
    // }

    // delete
    public function delete()
    {
        header('Content-Type: application/json');

        $id = $_POST['transaction_id'] ?? null;

        // cek id
        if(!$id)
        {
            echo json_encode(["status" => "error", "message" => "Id transaction kosong!"]);
            return;
        }

        $result = $this->transaction->deleteTransaction($id);

        // cek sukses atau engga
        if($result) 
        {
            echo json_encode(["status" => "success", "message" => "Transaction berhasil diDelete!"]);
        } 
        else 
        {
            echo json_encode(["status" => "error", "message" => "Gagal delete transaction!"]);
        }
    }
}