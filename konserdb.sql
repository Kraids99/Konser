CREATE DATABASE IF NOT EXISTS konser_db;

SET time_zone = "+00:00";

USE konser_db;

START TRANSACTION;

-- Tabel users
CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT,
    `role` VARCHAR(50) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `user_profile` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Dummy data users
INSERT INTO `users` (
    `user_id`,
    `role`,
    `username`,
    `email`,
    `password`,
    `user_profile`,
    `created_at`
) VALUES
    (1, 'admin', 'admin', 'admin@gmail.com', SHA2('admin123', 256), 'admin.jpg', NOW()),
    (2, 'user', 'alex', 'alex@example.com', SHA2('alex123', 256), 'alex.png', NOW()),
    (3, 'user', 'vergie', 'vergie@example.com', SHA2('vergie123', 256), 'vergie.png', NOW()),
    (4, 'user', 'fajar', 'fajar@example.com', SHA2('fajar123', 256), 'fajar.png', NOW()),
    (5, 'user', 'rafael', 'rafael@konser.com', SHA2('rafael123', 256), 'rafael.jpg', NOW());

-- Tabel events
CREATE TABLE `events` (
    `event_id` INT NOT NULL AUTO_INCREMENT,
    `event_name` VARCHAR(150) NOT NULL,
    `event_location` VARCHAR(150) NOT NULL,
    `event_date` DATE NOT NULL,
    `quota` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`event_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Dummy data events
INSERT INTO `events` (
    `event_id`,
    `event_name`,
    `event_location`,
    `event_date`,
    `quota`,
    `created_at`
) VALUES
    (1, 'Coldplay World Tour', 'Jakarta Stadium', '2026-02-14', 50000, NOW()),
    (2, 'Dewa 19 Reunion', 'Surabaya Grand Hall', '2026-05-10', 12000, NOW()),
    (3, 'We The Fest', 'GBK Senayan Jakarta', '2026-08-22', 35000, NOW()),
    (4, 'Java Jazz Festival', 'JIEXPO Kemayoran', '2026-03-05', 20000, NOW()),
    (5, 'Alan Walker Concert', 'Bali Beach Arena', '2026-11-30', 18000, NOW());

-- Tabel tickets
CREATE TABLE `tickets` (
    `ticket_id` INT NOT NULL AUTO_INCREMENT,
    `event_id` INT NOT NULL,
    `ticket_type` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`ticket_id`),
    CONSTRAINT `fk_ticket_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Dummy data tickets
INSERT INTO `tickets` (
    `ticket_id`,
    `event_id`,
    `ticket_type`,
    `price`,
    `created_at`
) VALUES
    (1, 1, 'VIP', 2500000.00, NOW()),
    (2, 1, 'Reguler', 1200000.00, NOW()),
    (3, 2, 'VIP', 750000.00, NOW()),
    (4, 3, 'Reguler', 500000.00, NOW()),
    (5, 4, 'VIP', 1800000.00, NOW());

-- Tabel transactions
CREATE TABLE `transactions` (
    `transaction_id` INT AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `ticket_id` INT NOT NULL,
    `ticket_token` VARCHAR(255) NOT NULL,
    `quantity` INT DEFAULT 1,
    `total` DECIMAL(10, 2),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`transaction_id`),
    CONSTRAINT `fk_transaction_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_transaction_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Tabel token (remember me)
CREATE TABLE `token` (
    `token_id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    PRIMARY KEY (`token_id`),
    CONSTRAINT `fk_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Dummy data token
INSERT INTO `token` (
    `token_id`,
    `user_id`,
    `token`,
    `created_at`,
    `updated_at`
) VALUES
    (1, 1, 'token_001', '2025-11-26 09:21:49', '2025-11-26 09:21:49'),
    (2, 2, 'token_002', '2025-11-26 09:21:49', '2025-11-26 09:21:49'),
    (3, 3, 'token_003', '2025-11-26 09:21:49', '2025-11-26 09:21:49'),
    (4, 4, 'token_004', '2025-11-26 09:21:49', '2025-11-26 09:21:49'),
    (5, 5, 'token_005', '2025-11-26 09:21:49', '2025-11-26 09:21:49');

COMMIT;
