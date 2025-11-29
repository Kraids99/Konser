<?php

require_once __DIR__ . '/../models/Event.php';

class EventController
{
    private $event;

    public function __construct($conn)
    {
        $this->event = new Event($conn);
    }

    public function 
}