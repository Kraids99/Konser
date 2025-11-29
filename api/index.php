<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/auth/RegisterController.php';
require_once __DIR__ . '/controllers/auth/LoginController.php';
require_once __DIR__ . '/controllers/auth/LogoutController.php';
require_once __DIR__ . '/controllers/TicketController.php';
require_once __DIR__ . '/controllers/TransactionController.php';
require_once __DIR__ . '/controllers/EventController.php';

switch ($action) {
    case 'register':
        $controller = new RegisterController($conn);
        $controller->register();
    break;

    case 'login':
        $login->login();
    break;

    case 'logout':
        $logout->logout();
    break;

    case 'events':
        $event->index();
    break;

    case 'event_show':
        $event->show();
    break;

    case 'event_create':
        $event->store();
    break;

    case 'event_update':
        $event->update();
    break;

    case 'event_delete':
        $event->delete();
    break;

    case 'ticket':
        $ticket->index();
    break;

    case 'ticket_show':
        $ticket->show();
    break;

    case 'ticket_create':
        $ticket->store();
    break;

    case 'ticket_update':
        $ticket->update();
    break;

    case 'ticket_delete':
        $ticket->delete();
    break;

    case 'transaction':
        $transaction->index();
    break;

    case 'transaction_show':
        $transaction->show();
    break;
    
    case 'transaction_create':
        $transaction->store();
    break;

    case 'transaction_delete':
        $transaction->delete();
    break;

    default:
        header('Content-Type: application/json');
        echo json_encode(["message" => "API Online"]);
}



