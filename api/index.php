<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/auth/RegisterController.php';
require_once __DIR__ . '/controllers/auth/LoginController.php';
require_once __DIR__ . '/controllers/auth/LogoutController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/EventController.php';
require_once __DIR__ . '/controllers/TicketController.php';
require_once __DIR__ . '/controllers/TransactionController.php';
require_once __DIR__ . '/controllers/LocationController.php';

$action = $_GET['action'] ?? $_POST['action'] ?? null;

$register = new RegisterController($conn);
$login = new LoginController($conn);
$logout = new LogoutController($conn);
$user = new UserController($conn);
$event = new EventController($conn);
$ticket = new TicketController($conn);
$transaction = new TransactionController($conn);
$location = new LocationController($conn);

switch ($action) {
    case 'register':
        $register->register();
    break;

    case 'login':
        $login->login();
    break;

    case 'logout':
        $logout->logout();
    break;

    case 'user_show':
        $user->show();
    break;

    case 'user_update':
        $user->updateProfile();
    break;

    case 'user_update_password':
        $user->updatePassword();
    break;

    case 'user_update_photo':
        $user->updateProfilePicture();
    break;
    //fajar tambahin ini
    case 'user_delete':
        $user->deleteAccount();
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

    case 'tickets':
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

    case 'transactions':
        $transaction->index();
    break;

    case 'transaction_show':
        $transaction->show();
    break;
    
    case 'transaction_create':
        $transaction->store();
    break;

    case 'transaction_update':
        $transaction->update();
    break;

    case 'transaction_delete':
        $transaction->delete();
    break;

    case 'locations':
        $location->index();
    break;

    case 'location_show':
        $location->show();
    break;

    default:
        header('Content-Type: application/json');
        echo json_encode(["message" => "API Online"]);
}
