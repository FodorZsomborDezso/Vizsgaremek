-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Gép: db:3306
-- Létrehozás ideje: 2026. Ápr 13. 21:06
-- Kiszolgáló verziója: 8.0.45
-- PHP verzió: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `artisticeye_db`
--
CREATE DATABASE IF NOT EXISTS `artisticeye_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `artisticeye_db`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(9, '3D Render'),
(12, 'AI Művészet'),
(5, 'Design'),
(4, 'Digitális Art'),
(8, 'Éjszakai Fotózás'),
(13, 'Festmény'),
(10, 'Illusztráció'),
(11, 'Koncepciórajz'),
(17, 'Logó / Arculat'),
(7, 'Makró Fotózás'),
(6, 'Portré'),
(14, 'Rajz / Grafika'),
(15, 'Szobrászat'),
(3, 'Tech'),
(1, 'Természet'),
(18, 'Tipográfia'),
(2, 'Város'),
(16, 'Web / UI Design');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `collections`
--

CREATE TABLE `collections` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `collections`
--

INSERT INTO `collections` (`id`, `user_id`, `name`, `created_at`) VALUES
(2, 17, 'bongya spohb', '2026-03-15 10:04:47'),
(3, 7, 'szupi mappa', '2026-03-18 18:52:13'),
(4, 19, 'Sajátom', '2026-04-13 20:36:46'),
(5, 18, '8bit', '2026-04-13 21:05:50');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `collection_items`
--

CREATE TABLE `collection_items` (
  `collection_id` int NOT NULL,
  `post_id` int NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `collection_items`
--

INSERT INTO `collection_items` (`collection_id`, `post_id`, `added_at`) VALUES
(2, 15, '2026-03-15 10:04:49'),
(3, 29, '2026-03-18 18:52:15'),
(4, 50, '2026-04-13 20:36:57'),
(4, 51, '2026-04-13 20:36:51'),
(4, 52, '2026-04-13 20:36:47'),
(5, 17, '2026-04-13 21:05:51'),
(5, 30, '2026-04-13 21:05:58');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `comments`
--

CREATE TABLE `comments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `comments`
--

INSERT INTO `comments` (`id`, `user_id`, `post_id`, `content`, `created_at`) VALUES
(14, 7, 17, 'dsdsd', '2026-03-02 20:46:30'),
(27, 7, 51, 'Köszi, ezeket majd használni fogom a jővőben', '2026-04-13 20:40:55'),
(28, 7, 42, 'Kicsit az ember arányai nem egyenletesek', '2026-04-13 20:41:21'),
(29, 7, 47, 'a bal kezen egy kicsit alakítani kéne de ennek ellenére jó', '2026-04-13 20:42:29');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `feedbacks`
--

CREATE TABLE `feedbacks` (
  `id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `feedbacks`
--

INSERT INTO `feedbacks` (`id`, `type`, `message`, `created_at`, `user_id`) VALUES
(3, 'Hiba', 'EZ', '2026-03-19 20:16:19', 7),
(4, 'Egyéb', 'AZ', '2026-03-19 20:16:23', 7),
(5, 'Egyéb', 'AMAZ\n', '2026-03-19 20:16:29', 7),
(6, 'Javaslat', 'dfdf', '2026-03-19 20:26:13', 7),
(7, 'Hiba', 'dadadsdsds', '2026-04-01 17:43:52', 7),
(8, 'Egyéb', 'Tudnátok törölni a fiókom, köszönöm szépen', '2026-04-13 21:06:28', 18);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `follows`
--

CREATE TABLE `follows` (
  `follower_id` int NOT NULL,
  `following_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `follows`
--

INSERT INTO `follows` (`follower_id`, `following_id`, `created_at`) VALUES
(7, 19, '2026-03-24 13:33:32'),
(7, 20, '2026-03-18 18:51:44'),
(18, 19, '2026-04-13 21:03:33'),
(19, 7, '2026-03-24 13:33:26'),
(19, 18, '2026-04-13 20:24:21'),
(19, 20, '2026-04-13 20:24:16'),
(19, 21, '2026-04-13 20:24:13'),
(19, 22, '2026-04-13 20:22:20'),
(20, 7, '2026-03-19 18:21:21');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `ideas`
--

CREATE TABLE `ideas` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `ideas`
--

INSERT INTO `ideas` (`id`, `user_id`, `category_id`, `title`, `description`, `created_at`) VALUES
(14, 7, 3, 'Egy meglepődött ember', 'pog', '2026-03-11 22:45:52'),
(15, 7, 6, 'wowow', 'wowow\n', '2026-03-19 18:57:54'),
(16, 7, 14, 'VALAMI GOOD', 'SZUUUUUUPEEER\n', '2026-03-19 19:01:43'),
(18, 19, 4, 'Valaki rajzolna nekem egy robot trex mintát, előre is köszi', 'ahogy érzi az illető', '2026-04-13 20:25:23'),
(19, 19, 14, 'Fanmade karaktereket kérek', 'Adjatok rajzokkal ötleteket, bármit', '2026-04-13 20:26:23');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `likes`
--

CREATE TABLE `likes` (
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `likes`
--

INSERT INTO `likes` (`user_id`, `post_id`, `created_at`) VALUES
(7, 17, '2026-03-05 19:14:59'),
(7, 25, '2026-03-16 20:17:37'),
(7, 30, '2026-03-18 22:16:10'),
(7, 32, '2026-03-23 19:49:57'),
(7, 42, '2026-04-13 20:41:03'),
(7, 43, '2026-04-13 13:58:09'),
(7, 45, '2026-04-13 13:57:47'),
(7, 46, '2026-04-13 20:55:15'),
(7, 47, '2026-04-13 20:42:12'),
(7, 49, '2026-04-13 13:57:44'),
(7, 51, '2026-04-13 20:40:32'),
(7, 52, '2026-04-13 20:40:34'),
(18, 17, '2026-04-13 21:00:18'),
(18, 30, '2026-04-13 21:00:20'),
(18, 40, '2026-04-13 21:00:22'),
(18, 42, '2026-04-13 21:00:16'),
(18, 45, '2026-04-13 21:00:14'),
(18, 47, '2026-04-13 21:00:08'),
(18, 49, '2026-04-13 21:00:10'),
(18, 51, '2026-04-13 21:00:12'),
(18, 57, '2026-04-13 21:00:06'),
(18, 59, '2026-04-13 21:00:04'),
(18, 61, '2026-04-13 21:00:03'),
(19, 41, '2026-04-13 20:22:08'),
(19, 42, '2026-04-13 20:22:14'),
(19, 45, '2026-04-13 20:21:59'),
(19, 47, '2026-04-13 20:22:09'),
(19, 48, '2026-04-13 20:34:03'),
(19, 49, '2026-04-13 20:21:57'),
(19, 50, '2026-04-13 20:30:56'),
(19, 52, '2026-04-13 20:36:01'),
(19, 53, '2026-04-13 20:40:07'),
(20, 17, '2026-03-18 18:48:27'),
(20, 25, '2026-03-18 18:48:29'),
(20, 32, '2026-03-23 22:14:52'),
(20, 40, '2026-04-13 20:45:14'),
(20, 41, '2026-04-13 20:45:13'),
(20, 42, '2026-04-13 20:45:09'),
(20, 43, '2026-04-13 20:45:08'),
(20, 45, '2026-04-13 20:45:10'),
(20, 46, '2026-04-13 20:45:12'),
(20, 47, '2026-04-13 20:45:12'),
(20, 48, '2026-04-13 20:45:07'),
(20, 49, '2026-04-13 20:45:06'),
(20, 50, '2026-04-13 20:45:03'),
(20, 51, '2026-04-13 20:45:02'),
(20, 52, '2026-04-13 20:45:01'),
(20, 53, '2026-04-13 20:45:31'),
(20, 54, '2026-04-13 20:45:29'),
(20, 55, '2026-04-13 20:45:24'),
(21, 32, '2026-03-31 19:36:35');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(20) DEFAULT 'text'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `content`, `is_read`, `created_at`, `type`) VALUES
(20, 7, 20, '❤️‍🔥❤️‍🔥❤️‍🔥❤️‍🔥❤️‍🔥❤️‍🔥', 0, '2026-03-24 21:50:31', 'text'),
(21, 7, 19, '😄😄', 1, '2026-03-24 21:50:36', 'text'),
(22, 19, 7, 'Szia zsobi', 1, '2026-04-13 20:22:35', 'text'),
(23, 19, 7, 'csak annyit szeretnék hogy full jó minden', 1, '2026-04-13 20:22:52', 'text');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `newsletter_content`
--

CREATE TABLE `newsletter_content` (
  `id` int NOT NULL,
  `content` text NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `newsletter_content`
--

INSERT INTO `newsletter_content` (`id`, `content`, `updated_at`) VALUES
(1, 'Üdvözlünk! A héten új funkciókkal bővült a galéria!', '2026-03-31 20:47:51');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `newsletter_subscribers`
--

CREATE TABLE `newsletter_subscribers` (
  `id` int NOT NULL,
  `email` varchar(150) NOT NULL,
  `user_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `subscribed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `newsletter_subscribers`
--

INSERT INTO `newsletter_subscribers` (`id`, `email`, `user_id`, `is_active`, `subscribed_at`) VALUES
(1, 'fodorzsombi0606@gmail.com', 7, 1, '2026-04-01 12:17:31');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `target_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `target_id`, `is_read`, `created_at`) VALUES
(1, 7, 14, 'like', 17, 1, '2026-03-04 20:23:03'),
(2, 7, 14, 'like', 15, 1, '2026-03-04 20:23:05'),
(3, 7, 14, 'message', NULL, 1, '2026-03-04 20:23:16'),
(4, 7, 14, 'implementation', 13, 1, '2026-03-04 20:23:46'),
(5, 7, 14, 'follow', NULL, 1, '2026-03-04 20:24:07'),
(6, 11, 7, 'like', 12, 0, '2026-03-05 19:14:58'),
(7, 10, 7, 'like', 10, 0, '2026-03-05 19:14:59'),
(8, 14, 7, 'like', 22, 0, '2026-03-05 19:15:02'),
(9, 10, 7, 'like', 13, 0, '2026-03-05 19:15:04'),
(10, 11, 7, 'like', 12, 0, '2026-03-09 18:43:05'),
(11, 11, 7, 'like', 12, 0, '2026-03-09 18:43:06'),
(12, 11, 7, 'like', 12, 0, '2026-03-09 18:43:08'),
(13, 11, 7, 'like', 12, 0, '2026-03-09 18:43:09'),
(14, 14, 7, 'follow', NULL, 0, '2026-03-11 23:06:55'),
(15, 14, 7, 'follow', NULL, 0, '2026-03-11 23:06:58'),
(16, 10, 7, 'follow', NULL, 0, '2026-03-11 23:29:38'),
(17, 10, 7, 'follow', NULL, 0, '2026-03-11 23:29:47'),
(18, 10, 7, 'follow', NULL, 0, '2026-03-11 23:29:49'),
(19, 14, 7, 'follow', NULL, 0, '2026-03-11 23:30:05'),
(20, 14, 7, 'follow', NULL, 0, '2026-03-11 23:30:06'),
(21, 14, 7, 'follow', NULL, 0, '2026-03-11 23:30:06'),
(22, 14, 7, 'follow', NULL, 0, '2026-03-11 23:30:07'),
(23, 14, 7, 'follow', NULL, 0, '2026-03-11 23:30:08'),
(24, 7, 17, 'like', 25, 1, '2026-03-15 09:58:24'),
(25, 7, 17, 'like', 15, 1, '2026-03-15 10:04:32'),
(26, 7, 17, 'like', 15, 1, '2026-03-15 10:04:36'),
(27, 7, 17, 'comment', 15, 1, '2026-03-15 10:05:05'),
(28, 14, 17, 'follow', NULL, 0, '2026-03-15 10:05:29'),
(29, 7, 17, 'like', 15, 1, '2026-03-15 10:05:34'),
(30, 7, 17, 'follow', NULL, 1, '2026-03-15 10:05:37'),
(31, 7, 20, 'like', 24, 1, '2026-03-18 18:48:21'),
(32, 7, 20, 'like', 19, 1, '2026-03-18 18:48:23'),
(33, 7, 20, 'like', 17, 1, '2026-03-18 18:48:27'),
(34, 7, 20, 'like', 28, 1, '2026-03-18 18:48:28'),
(35, 7, 20, 'like', 25, 1, '2026-03-18 18:48:29'),
(36, 7, 20, 'like', 20, 1, '2026-03-18 18:48:30'),
(37, 7, 20, 'like', 15, 1, '2026-03-18 18:48:32'),
(38, 7, 20, 'comment', 16, 1, '2026-03-18 18:48:41'),
(39, 7, 20, 'comment', 20, 1, '2026-03-18 18:48:49'),
(40, 20, 7, 'like', 29, 1, '2026-03-18 18:49:34'),
(41, 20, 7, 'like', 29, 1, '2026-03-18 18:49:45'),
(42, 20, 7, 'like', 29, 1, '2026-03-18 18:51:27'),
(43, 20, 7, 'like', 29, 1, '2026-03-18 18:51:28'),
(44, 20, 7, 'follow', NULL, 1, '2026-03-18 18:51:44'),
(45, 20, 7, 'comment', 29, 1, '2026-03-18 18:52:26'),
(46, 20, 7, 'like', 29, 1, '2026-03-18 22:29:17'),
(47, 20, 7, 'like', 29, 1, '2026-03-18 22:29:19'),
(48, 20, 7, 'like', 29, 1, '2026-03-18 22:32:21'),
(49, 20, 7, 'like', 29, 1, '2026-03-19 18:00:50'),
(50, 7, 20, 'follow', NULL, 1, '2026-03-19 18:21:21'),
(51, 20, 7, 'message', NULL, 1, '2026-03-19 18:22:27'),
(52, 7, 20, 'message', NULL, 1, '2026-03-19 20:06:35'),
(53, 7, 20, 'message', NULL, 1, '2026-03-21 18:12:57'),
(54, 20, 7, 'message', NULL, 1, '2026-03-21 18:13:35'),
(55, 7, 20, 'message', NULL, 1, '2026-03-21 18:14:06'),
(56, 7, 20, 'message', NULL, 1, '2026-03-21 18:14:11'),
(57, 20, 7, 'comment', 29, 1, '2026-03-21 18:14:37'),
(58, 20, 7, 'like', 29, 1, '2026-03-21 18:14:52'),
(59, 20, 7, 'like', 29, 1, '2026-03-21 18:14:57'),
(60, 20, 7, 'like', 29, 1, '2026-03-21 18:14:57'),
(61, 20, 7, 'like', 29, 1, '2026-03-21 18:14:57'),
(62, 20, 7, 'like', 29, 1, '2026-03-21 18:14:58'),
(63, 20, 7, 'like', 29, 1, '2026-03-21 18:14:59'),
(64, 20, 7, 'like', 29, 1, '2026-03-21 18:14:59'),
(65, 20, 7, 'like', 29, 1, '2026-03-21 18:14:59'),
(66, 20, 7, 'like', 29, 1, '2026-03-21 18:15:00'),
(67, 20, 7, 'like', 29, 1, '2026-03-21 18:15:00'),
(68, 20, 7, 'like', 29, 1, '2026-03-21 18:15:00'),
(69, 20, 7, 'like', 29, 1, '2026-03-21 18:15:00'),
(70, 20, 7, 'like', 29, 1, '2026-03-21 18:15:00'),
(71, 20, 7, 'like', 29, 1, '2026-03-21 18:15:05'),
(72, 20, 7, 'like', 29, 1, '2026-03-21 18:15:06'),
(73, 20, 7, 'like', 29, 1, '2026-03-21 18:15:08'),
(74, 20, 7, 'like', 29, 1, '2026-03-21 18:15:10'),
(75, 20, 7, 'like', 29, 1, '2026-03-21 18:15:10'),
(76, 20, 7, 'like', 29, 1, '2026-03-21 18:15:11'),
(77, 20, 7, 'like', 29, 1, '2026-03-21 18:15:11'),
(78, 20, 7, 'like', 29, 1, '2026-03-21 18:15:12'),
(79, 20, 7, 'like', 29, 1, '2026-03-21 18:15:12'),
(80, 20, 7, 'like', 29, 1, '2026-03-21 18:15:13'),
(81, 20, 7, 'like', 29, 1, '2026-03-21 18:15:13'),
(82, 20, 7, 'like', 29, 1, '2026-03-21 18:15:14'),
(83, 20, 7, 'like', 29, 1, '2026-03-21 18:15:14'),
(84, 20, 7, 'like', 29, 1, '2026-03-21 18:15:15'),
(85, 20, 7, 'like', 29, 1, '2026-03-21 18:15:16'),
(86, 20, 7, 'like', 29, 1, '2026-03-21 18:15:16'),
(87, 20, 7, 'message', NULL, 1, '2026-03-21 19:52:43'),
(88, 20, 7, 'comment', 29, 1, '2026-03-23 22:04:51'),
(89, 20, 7, 'comment', 29, 1, '2026-03-23 22:04:53'),
(90, 20, 7, 'comment', 29, 1, '2026-03-23 22:04:54'),
(91, 20, 7, 'comment', 29, 1, '2026-03-23 22:04:58'),
(92, 7, 20, 'like', 32, 1, '2026-03-23 22:14:52'),
(93, 7, 20, 'message', NULL, 1, '2026-03-23 22:32:15'),
(94, 7, 19, 'follow', NULL, 1, '2026-03-24 13:33:26'),
(95, 19, 7, 'follow', NULL, 1, '2026-03-24 13:33:32'),
(96, 19, 7, 'message', NULL, 1, '2026-03-24 13:33:46'),
(97, 20, 7, 'message', NULL, 1, '2026-03-24 21:50:31'),
(98, 19, 7, 'message', NULL, 1, '2026-03-24 21:50:36'),
(99, 7, 21, 'like', 32, 1, '2026-03-31 19:36:35'),
(100, 7, 21, 'like', 28, 1, '2026-03-31 19:36:36'),
(101, 7, 21, 'like', 20, 1, '2026-03-31 19:36:38'),
(102, 22, 7, 'like', 49, 0, '2026-04-13 13:57:44'),
(103, 22, 7, 'like', 45, 0, '2026-04-13 13:57:47'),
(104, 22, 7, 'like', 43, 0, '2026-04-13 13:58:09'),
(105, 22, 19, 'like', 49, 0, '2026-04-13 20:21:57'),
(106, 22, 19, 'like', 45, 0, '2026-04-13 20:21:59'),
(107, 7, 19, 'like', 34, 1, '2026-04-13 20:22:01'),
(108, 7, 19, 'like', 24, 1, '2026-04-13 20:22:03'),
(109, 7, 19, 'like', 15, 1, '2026-04-13 20:22:06'),
(110, 22, 19, 'like', 41, 0, '2026-04-13 20:22:08'),
(111, 22, 19, 'like', 47, 0, '2026-04-13 20:22:09'),
(112, 22, 19, 'like', 42, 0, '2026-04-13 20:22:14'),
(113, 22, 19, 'follow', NULL, 0, '2026-04-13 20:22:20'),
(114, 7, 19, 'message', NULL, 1, '2026-04-13 20:22:35'),
(115, 7, 19, 'message', NULL, 1, '2026-04-13 20:22:52'),
(116, 7, 19, 'message', NULL, 1, '2026-04-13 20:23:11'),
(117, 21, 19, 'follow', NULL, 0, '2026-04-13 20:24:13'),
(118, 20, 19, 'follow', NULL, 1, '2026-04-13 20:24:16'),
(119, 18, 19, 'follow', NULL, 1, '2026-04-13 20:24:21'),
(120, 22, 19, 'like', 48, 0, '2026-04-13 20:34:03'),
(121, 7, 19, 'implementation', 14, 1, '2026-04-13 20:39:56'),
(122, 7, 19, 'implementation', 14, 1, '2026-04-13 20:39:56'),
(123, 19, 7, 'like', 51, 0, '2026-04-13 20:40:32'),
(124, 19, 7, 'like', 52, 0, '2026-04-13 20:40:34'),
(125, 19, 7, 'comment', 51, 0, '2026-04-13 20:40:55'),
(126, 22, 7, 'like', 42, 0, '2026-04-13 20:41:03'),
(127, 22, 7, 'comment', 42, 0, '2026-04-13 20:41:21'),
(128, 22, 7, 'like', 47, 0, '2026-04-13 20:42:12'),
(129, 22, 7, 'comment', 47, 0, '2026-04-13 20:42:29'),
(130, 19, 7, 'implementation', 19, 0, '2026-04-13 20:44:08'),
(131, 19, 20, 'like', 52, 0, '2026-04-13 20:45:01'),
(132, 19, 20, 'like', 51, 0, '2026-04-13 20:45:02'),
(133, 19, 20, 'like', 50, 0, '2026-04-13 20:45:03'),
(134, 22, 20, 'like', 49, 0, '2026-04-13 20:45:06'),
(135, 22, 20, 'like', 48, 0, '2026-04-13 20:45:07'),
(136, 22, 20, 'like', 43, 0, '2026-04-13 20:45:08'),
(137, 22, 20, 'like', 42, 0, '2026-04-13 20:45:09'),
(138, 22, 20, 'like', 45, 0, '2026-04-13 20:45:10'),
(139, 22, 20, 'like', 46, 0, '2026-04-13 20:45:12'),
(140, 22, 20, 'like', 47, 0, '2026-04-13 20:45:12'),
(141, 22, 20, 'like', 41, 0, '2026-04-13 20:45:13'),
(142, 22, 20, 'like', 40, 0, '2026-04-13 20:45:14'),
(143, 7, 20, 'like', 34, 1, '2026-04-13 20:45:15'),
(144, 7, 20, 'like', 31, 1, '2026-04-13 20:45:17'),
(145, 7, 20, 'like', 55, 1, '2026-04-13 20:45:24'),
(146, 19, 20, 'like', 54, 0, '2026-04-13 20:45:29'),
(147, 19, 20, 'like', 53, 0, '2026-04-13 20:45:31'),
(148, 19, 20, 'implementation', 18, 0, '2026-04-13 20:47:10'),
(149, 22, 7, 'like', 46, 0, '2026-04-13 20:55:15'),
(150, 7, 18, 'like', 61, 0, '2026-04-13 21:00:03'),
(151, 7, 18, 'like', 59, 0, '2026-04-13 21:00:04'),
(152, 20, 18, 'like', 57, 0, '2026-04-13 21:00:06'),
(153, 22, 18, 'like', 47, 0, '2026-04-13 21:00:08'),
(154, 22, 18, 'like', 49, 0, '2026-04-13 21:00:10'),
(155, 19, 18, 'like', 51, 0, '2026-04-13 21:00:12'),
(156, 22, 18, 'like', 45, 0, '2026-04-13 21:00:14'),
(157, 22, 18, 'like', 42, 0, '2026-04-13 21:00:16'),
(158, 7, 18, 'like', 17, 0, '2026-04-13 21:00:18'),
(159, 7, 18, 'like', 30, 0, '2026-04-13 21:00:20'),
(160, 22, 18, 'like', 40, 0, '2026-04-13 21:00:22'),
(161, 19, 18, 'follow', NULL, 0, '2026-04-13 21:03:33'),
(162, 19, 18, 'implementation', 19, 0, '2026-04-13 21:05:35');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `posts`
--

CREATE TABLE `posts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `idea_id` int DEFAULT NULL,
  `title` varchar(150) DEFAULT NULL,
  `description` text,
  `image_url` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `image_data` longblob,
  `image_type` varchar(50) DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `category_id`, `idea_id`, `title`, `description`, `image_url`, `created_at`, `image_data`, `image_type`, `tags`) VALUES
(17, 7, 1, NULL, 'dsds', 'dsds', 'http://localhost:3000/api/posts/17/image', '2026-03-02 20:45:11', NULL, 'image/jpeg', NULL),
(25, 7, 16, NULL, 'Capybara', 'waaaa', 'http://localhost:3000/api/posts/25/image', '2026-03-05 18:55:46', NULL, 'image/jpeg', 'capybara,capy,bara,cap,ybara'),
(30, 7, 4, NULL, 'V1', 'pretty cool pic', 'http://localhost:3000/api/posts/30/image', '2026-03-18 22:05:23', NULL, 'image/jpeg', 'v1'),
(32, 7, 16, NULL, 'capybara', 'bara', 'http://localhost:3000/api/posts/32/image', '2026-03-19 19:55:04', NULL, 'image/jpeg', 'bara,barax'),
(40, 22, 4, NULL, 'Very good gaming hud', '', 'http://localhost:3000/api/posts/40/image', '2026-04-09 22:11:24', NULL, 'image/jpeg', NULL),
(41, 22, 4, NULL, 'Hori :3', 'Ő itt Hori a csillagjegyes pártaláló.', 'http://localhost:3000/api/posts/41/image', '2026-04-09 22:13:10', NULL, 'image/jpeg', NULL),
(42, 22, 4, NULL, 'Hori!', '', 'http://localhost:3000/api/posts/42/image', '2026-04-09 22:14:49', NULL, 'image/jpeg', NULL),
(43, 22, 4, NULL, 'Hori?', '', 'http://localhost:3000/api/posts/43/image', '2026-04-09 22:14:49', NULL, 'image/jpeg', NULL),
(45, 22, 11, NULL, 'Nagyon barátságos úriember', '', 'http://localhost:3000/api/posts/45/image', '2026-04-09 22:18:33', NULL, 'image/jpeg', NULL),
(46, 22, 11, NULL, 'Egy cool guy nagyon cool-ul néz a távolba', '', 'http://localhost:3000/api/posts/46/image', '2026-04-09 22:26:46', NULL, 'image/jpeg', NULL),
(47, 22, 11, NULL, 'Nagyon epic bot fogás', '', 'http://localhost:3000/api/posts/47/image', '2026-04-09 22:27:24', NULL, 'image/jpeg', NULL),
(48, 22, 11, NULL, 'Sovány Goku villany erőt kap', '', 'http://localhost:3000/api/posts/48/image', '2026-04-09 22:29:29', NULL, 'image/jpeg', NULL),
(49, 22, 11, NULL, 'Egy naon aranyos maid ruhás leányzó', '', 'http://localhost:3000/api/posts/49/image', '2026-04-09 22:31:13', NULL, 'image/jpeg', NULL),
(50, 19, 14, NULL, 'Első rajzom, elfogadok kritikát', '1-2 óra volt és ötlet alapján csináltam', 'http://localhost:3000/api/posts/50/image', '2026-04-13 20:30:52', NULL, 'image/jpeg', 'naruto,anime,rajz,grafit'),
(51, 19, 4, NULL, 'Néhány ötlet anime karakterhez ruha', 'ötletet a jjk-ből merítve', 'http://localhost:3000/api/posts/51/image', '2026-04-13 20:33:47', NULL, 'image/jpeg', 'anime,egyszerű,minta'),
(52, 19, 13, NULL, 'Egy szerelmes pár', 'Hosszú idő volt megcsinálni', 'http://localhost:3000/api/posts/52/image', '2026-04-13 20:35:49', NULL, 'image/jpeg', 'anime,festmény'),
(53, 19, 13, 14, 'Meglepődött ember festve', '10-20 órába telt', 'http://localhost:3000/api/posts/53/image', '2026-04-13 20:39:56', NULL, 'image/jpeg', 'festmény,sikoly,régies,classic,új'),
(54, 19, 13, 14, 'Meglepődött ember rajzolva', '10-20 percbe telt', 'http://localhost:3000/api/posts/54/image', '2026-04-13 20:39:56', NULL, 'image/jpeg', 'festmény,sikoly,régies,classic,új'),
(55, 7, 4, 19, 'Steve', 'Ezek az én ötleteim a karakterhez', 'http://localhost:3000/api/posts/55/image', '2026-04-13 20:44:08', NULL, 'image/jpeg', 'fanmade,cool,digitalart,karakter,simple'),
(56, 20, 4, 18, 'Menő robot trex', 'Ennyire futotta', 'http://localhost:3000/api/posts/56/image', '2026-04-13 20:47:10', NULL, 'image/jpeg', 'trex,robot,digitalart'),
(57, 20, 4, NULL, 'Egy jelenet a kedvenc játékomból ', 'újra kreálva', 'http://localhost:3000/api/posts/57/image', '2026-04-13 20:52:03', NULL, 'image/jpeg', 'game,games,digitalart,red,black'),
(58, 7, 14, NULL, 'Egy sárkány', 'Kb 2-3 órámba telt és 2 fekete tűfilcembe', 'http://localhost:3000/api/posts/58/image', '2026-04-13 20:53:35', NULL, 'image/jpeg', 'sárkány,fekete,fehér,rajz,papír'),
(59, 7, 14, NULL, 'Kő robot', 'Az egész ceruzával készült kb 3 óra volt', 'http://localhost:3000/api/posts/59/image', '2026-04-13 20:54:57', NULL, 'image/jpeg', 'robot,rajz,papír'),
(60, 7, 14, NULL, 'Telefontok sárkány', 'már lassan 5 éves a rajz de gondoltam feltöltöm', 'http://localhost:3000/api/posts/60/image', '2026-04-13 20:56:46', NULL, 'image/jpeg', 'sárkány,rajz,fekete'),
(61, 7, 14, NULL, 'Egy rajzolt vár', 'Egy megrajzolt vár, csak ceruzával', 'http://localhost:3000/api/posts/61/image', '2026-04-13 20:57:51', NULL, 'image/jpeg', 'vár,rajz,papír'),
(62, 18, 10, NULL, 'Több színben pompázó fa', '', 'http://localhost:3000/api/posts/62/image', '2026-04-13 21:03:18', NULL, 'image/jpeg', 'fa,szines'),
(63, 18, 11, 19, 'Kis ördög', 'csak koncepció', 'http://localhost:3000/api/posts/63/image', '2026-04-13 21:05:35', NULL, 'image/jpeg', 'digitalart,fehér,piros');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `reports`
--

CREATE TABLE `reports` (
  `id` int NOT NULL,
  `reporter_id` int NOT NULL,
  `target_type` enum('post','comment','user') NOT NULL,
  `target_id` int NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','resolved') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `reports`
--

INSERT INTO `reports` (`id`, `reporter_id`, `target_type`, `target_id`, `reason`, `status`, `created_at`) VALUES
(3, 7, 'post', 15, 'utálom bongya spobot', 'pending', '2026-03-01 11:45:11'),
(4, 7, 'post', 25, 'nem tetszik', 'pending', '2026-03-11 23:47:46'),
(5, 7, 'post', 26, 'ez sem tetszik', 'pending', '2026-03-11 23:48:02');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `full_name` varchar(100) DEFAULT NULL,
  `bio` text,
  `avatar_url` varchar(255) DEFAULT 'https://via.placeholder.com/150',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `location` varchar(100) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `last_seen` datetime DEFAULT NULL,
  `avatar_data` longblob,
  `avatar_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `full_name`, `bio`, `avatar_url`, `created_at`, `location`, `is_verified`, `verification_token`, `verification_token_expires`, `reset_token`, `reset_token_expires`, `last_seen`, `avatar_data`, `avatar_type`) VALUES
(7, 'zsonibi', 'fodorzsombi0606@gmail.com', '$2b$10$AVoCRUGUc8xXoRDPT/j/ZuiEX3R5ez4KF.jraWiHm4DX2f0k3.1MK', 'admin', 'Fodor Zsombor Dezső', 'Az ArtisticEye egyik fejlesztője. Szoftver fejlesztő és tesztelő.', 'http://localhost:3000/api/users/7/avatar', '2026-02-17 18:21:27', 'Magyarorszag, Cserszegtomaj', 1, NULL, NULL, '177283', '2026-04-13 14:57:09', '2026-04-13 20:59:14', NULL, 'image/jpeg'),
(18, 'v1', 'valami@valami.hu', '$2b$10$nuJoHDiQP9yJtouD0ADRNu9Gi4If2DeAq.ejcs5yEhbTwzQ19DkbK', 'user', 'valami', 'valami', 'http://localhost:3000/api/users/18/avatar', '2026-03-16 20:10:10', 'valami', 1, NULL, NULL, NULL, NULL, '2026-04-13 21:03:36', NULL, 'image/jpeg'),
(19, 'Akos', 'akos060316@gmail.com', '$2b$10$DC8Tc6Og0vW9EbKGy8xFVO4Qri7M/GrEGCMtwaXkC6THN99uT8cyS', 'admin', 'Gerencsér Ákos', 'Az ArtisticEye egyik fejlesztője. Szoftver fejlesztő és tesztelő.', 'http://localhost:3000/api/users/19/avatar', '2026-03-17 08:38:40', 'Magyarorszag, Tapolca', 1, NULL, NULL, NULL, NULL, '2026-04-13 20:36:03', NULL, NULL),
(20, 'Ricsi', 'Ricsi@gmail.com', '$2b$10$GtNq.gjy4uebdALBtVSlT.q3w4k0O22wpxVuMEMWdci/thJ0ojE5y', 'user', 'Ricsárd', 'Ricsi vagyok', 'http://localhost:3000/api/users/20/avatar', '2026-03-18 18:47:18', 'Magyarország', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'image/jpeg'),
(21, 'Felhasznalo', 'zsomzsomfodfod@gmail.com', '$2b$10$KJKtW5BmRFwpmoN7kzZPCu3iLybYEu2YVaGzKLYlUBsBe5jhZg3tm', 'user', NULL, NULL, 'https://ui-avatars.com/api/?name=Felhasznalo&background=random&color=fff&size=128', '2026-03-31 19:34:07', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 'FKL210', 'fodorkoppany@gmail.com', '$2b$10$MGa0Ik..sy.70x9Vy7R3Luh.sTat6jgOke32FBGGJoMuaH9hCpsnO', 'user', 'Fodor Koppány László', 'Rajzolni próbálgatok', 'http://localhost:3000/api/users/22/avatar', '2026-04-09 21:36:18', 'Magyaroszág', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- A tábla indexei `collections`
--
ALTER TABLE `collections`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `collection_items`
--
ALTER TABLE `collection_items`
  ADD PRIMARY KEY (`collection_id`,`post_id`);

--
-- A tábla indexei `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- A tábla indexei `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`follower_id`,`following_id`),
  ADD KEY `following_id` (`following_id`);

--
-- A tábla indexei `ideas`
--
ALTER TABLE `ideas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- A tábla indexei `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`user_id`,`post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- A tábla indexei `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- A tábla indexei `newsletter_content`
--
ALTER TABLE `newsletter_content`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_unique` (`email`),
  ADD KEY `fk_user_id` (`user_id`);

--
-- A tábla indexei `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `fk_posts_ideas` (`idea_id`);

--
-- A tábla indexei `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reporter_id` (`reporter_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT a táblához `collections`
--
ALTER TABLE `collections`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT a táblához `feedbacks`
--
ALTER TABLE `feedbacks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT a táblához `ideas`
--
ALTER TABLE `ideas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT a táblához `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT a táblához `newsletter_content`
--
ALTER TABLE `newsletter_content`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=163;

--
-- AUTO_INCREMENT a táblához `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT a táblához `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `ideas`
--
ALTER TABLE `ideas`
  ADD CONSTRAINT `ideas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ideas_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Megkötések a táblához `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  ADD CONSTRAINT `newsletter_subscribers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_posts_ideas` FOREIGN KEY (`idea_id`) REFERENCES `ideas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `posts_ibfk_3` FOREIGN KEY (`idea_id`) REFERENCES `ideas` (`id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
