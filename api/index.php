<?php
require_once __DIR__ . '/database.php';
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

    default:
        header('Content-Type: application/json');
        echo json_encode(["message" => "API Online"]);
}

