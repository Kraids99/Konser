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

-- Tabel locations
CREATE TABLE `locations` (
    `location_id` INT NOT NULL AUTO_INCREMENT,
    `city` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `latitude` DECIMAL(10, 6) NOT NULL,
    `longitude` DECIMAL(10, 6) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`location_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Dummy data locations
INSERT INTO `locations` (
    `location_id`,
    `city`,
    `address`,
    `latitude`,
    `longitude`,
    `created_at`
) VALUES
    (1, 'Jakarta', 'Jakarta Stadium', -6.200000, 106.816700, NOW()),
    (2, 'Surabaya', 'Surabaya Grand Hall', -7.257500, 112.752100, NOW()),
    (3, 'Jakarta', 'GBK Senayan Jakarta', -6.218300, 106.802600, NOW()),
    (4, 'Jakarta', 'JIEXPO Kemayoran', -6.147500, 106.844700, NOW()),
    (5, 'Bali', 'Bali Beach Arena', -8.409500, 115.188900, NOW());

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
    (2, 'user', 'alex', 'alex@gmail.com', SHA2('alex123', 256), 'alex.png', NOW()),
    (3, 'user', 'vergie', 'vergie@gmail.com', SHA2('vergie123', 256), 'vergie.png', NOW()),
    (4, 'user', 'fajar', 'fajar@gmail.com', SHA2('fajar123', 256), 'fajar.png', NOW()),
    (5, 'user', 'rafael', 'rafael@gmail.com', SHA2('rafael123', 256), 'rafael.jpg', NOW());

-- Tabel events
CREATE TABLE `events` (
    `event_id` INT NOT NULL AUTO_INCREMENT,
    `event_name` VARCHAR(150) NOT NULL,
    `location_id` INT NOT NULL,
    `event_date` DATE NOT NULL,
    `quota` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`event_id`),
    CONSTRAINT `fk_event_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Dummy data events
INSERT INTO `events` (
    `event_id`,
    `event_name`,
    `location_id`,
    `event_date`,
    `quota`,
    `created_at`
) VALUES
    (1, 'Coldplay World Tour', 1, '2026-02-14', 50000, NOW()),
    (2, 'Dewa 19 Reunion', 2, '2026-05-10', 12000, NOW()),
    (3, 'We The Fest', 3, '2026-08-22', 35000, NOW()),
    (4, 'Java Jazz Festival', 4, '2026-03-05', 20000, NOW()),
    (5, 'Alan Walker Concert', 5, '2026-11-30', 18000, NOW());

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
