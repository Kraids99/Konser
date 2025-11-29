<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/Auth/RegisterController.php';
require_once __DIR__ . '/controllers/Auth/LoginController.php';
require_once __DIR__ . '/controllers/Auth/LogoutController.php';

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

    default:
        header('Content-Type: application/json');
        echo json_encode(["message" => "API Online"]);
}



