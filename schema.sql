-- phpMyAdmin SQL Dump
-- CST-336 Final Project
-- Host: nwhazdrp7hdpd4a4.cbetxkdyhwsb.us-east-1.rds.amazonaws.com
-- Database: knpq9kqfuqvfgfvz

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------

CREATE TABLE `users` (
  `userId`     int          NOT NULL,
  `username`   varchar(100) NOT NULL,
  `password`   varchar(255) NOT NULL,
  `role`       enum('admin','user') NOT NULL DEFAULT 'user',
  `created_at` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Seed data: admin and user accounts
-- NOTE: replace the placeholder hashes below with real bcrypt hashes
-- before running. Generate with: node -e "const b=require('bcrypt');b.hash('S3ACR3T',10).then(console.log)"
--
INSERT INTO `users` (`userId`, `username`, `password`, `role`) VALUES
(1, 'admin', '$2b$10$REPLACE_WITH_REAL_HASH_FOR_S3ACR3T', 'admin'),
(2, 'user',  '$2b$10$REPLACE_WITH_REAL_HASH_FOR_F1N4L',   'user');

ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `username` (`username`);

ALTER TABLE `users`
  MODIFY `userId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

-- --------------------------------------------------------
-- Table structure for table `favorite_artist`
-- --------------------------------------------------------

CREATE TABLE `favorite_artist` (
  `fav_artistId` int          NOT NULL,
  `userId`       int          NOT NULL,
  `artistName`   varchar(255) NOT NULL,
  `artistImgUrl` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `favorite_artist`
  ADD PRIMARY KEY (`fav_artistId`),
  ADD KEY `userId` (`userId`);

ALTER TABLE `favorite_artist`
  MODIFY `fav_artistId` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `favorite_artist`
  ADD CONSTRAINT `fk_fa_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

-- --------------------------------------------------------
-- Table structure for table `favorite_songs`
-- --------------------------------------------------------

CREATE TABLE `favorite_songs` (
  `fav_songId` int          NOT NULL,
  `userId`     int          NOT NULL,
  `songTitle`  varchar(255) NOT NULL,
  `artistName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `favorite_songs`
  ADD PRIMARY KEY (`fav_songId`),
  ADD KEY `userId` (`userId`);

ALTER TABLE `favorite_songs`
  MODIFY `fav_songId` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `favorite_songs`
  ADD CONSTRAINT `fk_fs_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

-- --------------------------------------------------------
-- Table structure for table `favorite_concerts`
-- --------------------------------------------------------

CREATE TABLE `favorite_concerts` (
  `fav_concertId` int          NOT NULL,
  `userId`        int          NOT NULL,
  `artistName`    varchar(255) NOT NULL,
  `eventTitle`    varchar(255) NOT NULL,
  `concertDate`   date         NOT NULL,
  `venueName`     varchar(255) NOT NULL,
  `city`          varchar(100) NOT NULL,
  `country`       varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `favorite_concerts`
  ADD PRIMARY KEY (`fav_concertId`),
  ADD KEY `userId` (`userId`);

ALTER TABLE `favorite_concerts`
  MODIFY `fav_concertId` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `favorite_concerts`
  ADD CONSTRAINT `fk_fc_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

COMMIT;
