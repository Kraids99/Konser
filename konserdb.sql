CREATE DATABASE IF NOT EXISTS konser_db;

START TRANSACTION;

SET
    time_zone = "+00:00";

USE konser_db;

CREATE TABLE `token` (
    `token_id` int (11) NOT NULL AUTO_INCREMENT,
    `user_id` int (11) NOT NULL,
    `token` varchar(255) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id_token`) FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Dummy data token
INSERT INTO
    `token` (
        `token_id`,
        `user_id`,
        `token`,
        `created_at`,
        `updated_at`
    )
VALUES
    (
        1,
        1,
        'token_001',
        '2025-11-26 09:21:49',
        '2025-11-26 09:21:49'
    ),
    (
        2,
        2,
        'token_002',
        '2025-11-26 09:21:49',
        '2025-11-26 09:21:49'
    ),
    (
        3,
        3,
        'token_003',
        '2025-11-26 09:21:49',
        '2025-11-26 09:21:49'
    ),
    (
        4,
        4,
        'token_004',
        '2025-11-26 09:21:49',
        '2025-11-26 09:21:49'
    ),
    (
        5,
        5,
        'token_005',
        '2025-11-26 09:21:49',
        '2025-11-26 09:21:49'
    );

CREATE TABLE `users` (
    `user_id` int AUTO_INCREMENT,
    `role` varchar(50) NOT NULL,
    `username` varchar(100) NOT NULL,
    `email` varchar(150) NOT NULL UNIQUE,
    `password` varchar(255) NOT NULL,
    `user_profile` varchar(255) DEFAULT NULL,
    `verification_token` varchar(255) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Dummy data users
INSERT INTO
    `users` (
        `user_id`,
        `role`,
        `username`,
        `email`,
        `password`,
        `user_profile`,
        `verification_token`,
        `created_at`
    )
VALUES
    (
        1,
        'admin',
        'admin',
        'admin@gmail.com',
        SHA2 ('admin123', 256),
        'admin.jpg',
        '1',
        NOW ()
    ),
    (
        2,
        'user',
        'alex',
        'alex@example.com',
        SHA2 ('alex123', 256),
        'alex.png',
        '2',
        NOW ()
    ),
    (
        3,
        'user',
        'vergie',
        'vergie@example.com',
        SHA2 ('vergie123', 256),
        'vergie.png',
        '3',
        NOW ()
    ),
    (
        4,
        'user',
        'fajar',
        'fajar@example.com',
        SHA2 ('fajar123', 256),
        'fajar.png',
        '4',
        NOW ()
    ),
    (
        5,
        'user',
        'rafael',
        'rafael@konser.com',
        SHA2 ('rafael123', 256),
        'rafael.jpg',
        '5',
        NOW ()
    );

CREATE TABLE `events` (
    `event_id` int (11) NOT NULL AUTO_INCREMENT,
    `event_name` varchar(150) NOT NULL,
    `event_location` varchar(150) NOT NULL,
    `event_date` date NOT NULL,
    `quota` int (11) DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`event_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Dummy data events
INSERT INTO
    `events` (
        `event_id`,
        `event_name`,
        `event_location`,
        `event_date`,
        `quota`,
        `created_at`
    )
VALUES
    (
        1,
        'Coldplay World Tour',
        'Jakarta Stadium',
        '2026-02-14',
        50000,
        NOW ()
    ),
    (
        2,
        'Dewa 19 Reunion',
        'Surabaya Grand Hall',
        '2026-05-10',
        12000,
        NOW ()
    ),
    (
        3,
        'We The Fest',
        'GBK Senayan Jakarta',
        '2026-08-22',
        35000,
        NOW ()
    ),
    (
        4,
        'Java Jazz Festival',
        'JIEXPO Kemayoran',
        '2026-03-05',
        20000,
        NOW ()
    ),
    (
        5,
        'Alan Walker Concert',
        'Bali Beach Arena',
        '2026-11-30',
        18000,
        NOW ()
    );

CREATE TABLE `tickets` (
    `ticket_id` int (11) NOT NULL AUTO_INCREMENT,
    `event_id` int (11) NOT NULL,
    `ticket_type` varchar(100) NOT NULL,
    `price` decimal(10, 2) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`ticket_id`),
    FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Dummy data tickets
INSERT INTO
    `tickets` (
        `ticket_id`,
        `event_id`,
        `ticket_type`,
        `price`,
        `created_at`
    )
VALUES
    (1, 1, 'VIP', 2500000.00, NOW ()),
    (2, 1, 'Festival', 1200000.00, NOW ()),
    (3, 2, 'Reguler A', 750000.00, NOW ()),
    (4, 3, 'Early Bird', 500000.00, NOW ()),
    (5, 4, 'Premium Seat', 1800000.00, NOW ());

CREATE TABLE `transactions` (
    `transaction_id` int AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `ticket_id` int NOT NULL,
    `ticket_token` VARCHAR(255) NOT NULL,
    `quantity` int DEFAULT 1,
    `total` decimal(10, 2),
    `created_at` timestamp DEFAULT current_timestamp(),
    PRIMARY KEY (`transaction_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`) ON DELETE CASCADE ON UPDATE CASCADE
)ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;