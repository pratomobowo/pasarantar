-- MySQL dump 10.13  Distrib 8.4.6, for macos14.7 (x86_64)
--
-- Host: localhost    Database: pasarantar
-- ------------------------------------------------------
-- Server version	8.4.6

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_notifications`
--

DROP TABLE IF EXISTS `admin_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_notifications` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'user_registration | new_order',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID of related entity (customer_id, order_id)',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_type` (`type`),
  KEY `idx_notifications_read` (`is_read`),
  KEY `idx_notifications_created` (`created_at`),
  KEY `idx_notifications_related` (`related_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_notifications`
--

LOCK TABLES `admin_notifications` WRITE;
/*!40000 ALTER TABLE `admin_notifications` DISABLE KEYS */;
INSERT INTO `admin_notifications` VALUES ('3gYBxIvfrd5q4RJCblg6W','new_order','Pesanan Baru Masuk','Pesanan #ORD20251022661 dari Pratomo Bowo Leksono sebesar Rp 60.000','8ZH-ha7SdysQEIoNuresF',1,'2025-10-21 11:01:58','2025-10-21 11:11:33'),('Q4eaY8WEVnBNN3gyR0cbk','new_order','Pesanan Baru Masuk','Pesanan #ORD20251022411 dari Pratomo Bowo Leksono sebesar Rp 60.000','xhx8kB3TpzmjgedJ8C5y9',1,'2025-10-21 20:03:15','2025-10-21 20:15:51'),('RdVfZHFj1H4VwSg7yTeeH','new_order','Pesanan Baru Masuk','Pesanan #ORD20251022302 dari Pratomo Bowo Leksono sebesar Rp 63.000','4PQ2NW45S1iEEYbjpIx3k',1,'2025-10-21 18:51:40','2025-10-21 18:53:40');
/*!40000 ALTER TABLE `admin_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES ('7dS0GsTqAILFvCJhd1LG2','admin','admin@pasarantar.com','$2a$10$1GjhNi6jp0A4G3K9InPgk.jYQEPK7FDY3u4QJM9eSY0R4mck7qRdS','2025-10-17 15:34:29','2025-10-17 15:34:29');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('ayam','Ayam','Produk ayam segar dan olahann','',1,'2025-10-17 15:34:29','2025-10-18 03:46:36'),('daging-sapi','Daging Sapi','Daging sapi segar dan olahan',NULL,1,'2025-10-17 15:34:29','2025-10-17 15:34:29'),('dOaplBHTCEATTeeBz5c5w','Marinasi','','',1,'2025-10-21 08:02:28','2025-10-21 08:02:28'),('ikan','Ikan','Ikan segar dan seafood',NULL,1,'2025-10-17 15:34:29','2025-10-17 15:34:29');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_addresses`
--

DROP TABLE IF EXISTS `customer_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_addresses` (
  `id` varchar(255) NOT NULL,
  `customer_id` varchar(255) NOT NULL,
  `label` varchar(50) NOT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `full_address` varchar(1000) NOT NULL,
  `province` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `coordinates` varchar(100) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customer_addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_addresses`
--

LOCK TABLES `customer_addresses` WRITE;
/*!40000 ALTER TABLE `customer_addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_notifications`
--

DROP TABLE IF EXISTS `customer_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_notifications` (
  `id` varchar(255) NOT NULL,
  `customer_id` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` varchar(1000) NOT NULL,
  `related_id` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customer_notifications_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_notifications`
--

LOCK TABLES `customer_notifications` WRITE;
/*!40000 ALTER TABLE `customer_notifications` DISABLE KEYS */;
INSERT INTO `customer_notifications` VALUES ('jOe3g7cF3jkOymV6RhqGw','Xyo-e1BZ2T4p147TU0iRn','order_confirmed','Pesanan Dikonfirmasi','Pesanan #ORD20251022411 telah dikonfirmasi. Kami akan segera memproses pesanan Anda.','xhx8kB3TpzmjgedJ8C5y9',1,'2025-10-21 20:16:06','2025-10-21 20:21:15');
/*!40000 ALTER TABLE `customer_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_social_accounts`
--

DROP TABLE IF EXISTS `customer_social_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_social_accounts` (
  `id` varchar(255) NOT NULL,
  `customer_id` varchar(255) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_user_id` varchar(255) NOT NULL,
  `provider_data` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_provider_account` (`provider`,`provider_user_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customer_social_accounts_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_social_accounts`
--

LOCK TABLES `customer_social_accounts` WRITE;
/*!40000 ALTER TABLE `customer_social_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_social_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `address` varchar(1000) DEFAULT NULL,
  `coordinates` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `provider` enum('email','google','facebook') DEFAULT 'email',
  `provider_id` varchar(255) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES ('cPpHw5kNpk-6LDD4xXKuT','Updated Test Customer','test@example.com','$2a$10$StVrBxI4kNkXZ894KDyXluXCcveajAAu09zhnEazVtkDkzKr6EWkW','08123456789','Jl. Test Address No. 123, Jakarta','-6.2088, 106.8456',NULL,'email',NULL,0,'2025-10-17 17:20:23','2025-10-17 17:22:43'),('Xyo-e1BZ2T4p147TU0iRn','Pratomo Bowo Leksono','pratomobowo@gmail.com','$2a$10$laSCBZDL/N8AQYqZ49zKluwyhJYa2XiNtdIomHpnkUAop6eMYPsVe','082215711850','Komplek Graha Sari Endah Jl nanas No 8','-6.999608032577826,107.62737273826087',NULL,'email',NULL,0,'2025-10-17 20:38:24','2025-10-21 00:34:24');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` varchar(255) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `product_variant_id` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_variant_weight` varchar(50) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` float NOT NULL,
  `total_price` float NOT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `product_variant_id` (`product_variant_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES ('5AZ-buivPo2iqGHRXQBCA','8ZH-ha7SdysQEIoNuresF','w_VKIjJ6dU0mkO0dWeT7b','bO2o8fnpJgmY-la6ewK5W','test 2','1',1,45000,45000,NULL,'2025-10-21 11:01:58'),('jDpC50o5vokUUV6rtfYg9','4PQ2NW45S1iEEYbjpIx3k','9WkoE2V_jdFkNtWKat-Je','QFnnbIVePmBGLUklNvSGX','Fillet Tenggiri Segar','500',1,38000,38000,NULL,'2025-10-21 18:51:40'),('SBjWXOwEw0LzlNECSGNnW','xhx8kB3TpzmjgedJ8C5y9','w_VKIjJ6dU0mkO0dWeT7b','bO2o8fnpJgmY-la6ewK5W','test 2','1',1,45000,45000,NULL,'2025-10-21 20:03:14'),('sH2_NXLPo6hRBCBDX8RAL','YbMU9QKE2GxaChoQpEbdL','8BQ7n0N5rXG4K1bCUTRPD','nXB5CmIfpi6NTf3UOsixj','Kepiting Telur Segar','1',1,100000,100000,NULL,'2025-10-20 19:56:02'),('xLwj4Uprouy18IX2qugll','4PQ2NW45S1iEEYbjpIx3k','IkmtAUIDOXSQNtTI98zIw','kb_qXBGh_e7HD7GYtDdKu','test 3','100',1,10000,10000,NULL,'2025-10-21 18:51:40');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(255) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `customer_id` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_whatsapp` varchar(20) NOT NULL,
  `customer_address` varchar(1000) NOT NULL,
  `customer_coordinates` varchar(100) DEFAULT NULL,
  `shipping_method` varchar(20) NOT NULL,
  `delivery_day` varchar(20) DEFAULT NULL,
  `payment_method` varchar(20) NOT NULL,
  `subtotal` float NOT NULL,
  `shipping_cost` float NOT NULL DEFAULT '0',
  `total_amount` float NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `notes` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('4PQ2NW45S1iEEYbjpIx3k','ORD20251022302','Xyo-e1BZ2T4p147TU0iRn','Pratomo Bowo Leksono','082215711850','Komplek Graha Sari Endah Jl nanas No 8','-6.89946380134174,107.64031860395707','express',NULL,'transfer',48000,15000,63000,'delivered',NULL,'2025-10-21 18:51:40','2025-10-21 18:58:59'),('8ZH-ha7SdysQEIoNuresF','ORD20251022661','Xyo-e1BZ2T4p147TU0iRn','Pratomo Bowo Leksono','082215711850','Komplek Graha Sari Endah Jl nanas No 8',NULL,'express','sabtu','transfer',45000,15000,60000,'delivered',NULL,'2025-10-21 11:01:58','2025-10-21 11:10:08'),('jzxpaYJBsUevLUg_ElP1I','ORD20251020030','Xyo-e1BZ2T4p147TU0iRn','Pratomo Bowo Leksono','082215711850','beee','-6.999587049929554,107.62736510997092','express','selasa','transfer',29750,15000,44750,'cancelled',NULL,'2025-10-19 10:27:15','2025-10-20 18:49:42'),('Kga3I_AMFroPjxYOOCpU4','ORD20251018250','Xyo-e1BZ2T4p147TU0iRn','Pratomo Bowo Leksono','082215711850','be',NULL,'express','sabtu','cod',29750,15000,44750,'delivered',NULL,'2025-10-17 16:35:49','2025-10-19 11:25:05'),('rgQKAjYKyNWkSNukrGJV1','ORD20251019000',NULL,'Pratomo Bowo Leksono','082215711850','bee','-6.999525980187298,107.6274142990044','pickup',NULL,'cod',238000,0,238000,'cancelled',NULL,'2025-10-19 09:46:15','2025-10-20 18:49:43'),('xhx8kB3TpzmjgedJ8C5y9','ORD20251022411','Xyo-e1BZ2T4p147TU0iRn','Pratomo Bowo Leksono','082215711850','Komplek Graha Sari Endah Jl nanas No 8',NULL,'express',NULL,'transfer',45000,15000,60000,'confirmed',NULL,'2025-10-21 20:03:14','2025-10-21 20:16:06'),('YbMU9QKE2GxaChoQpEbdL','ORD20251021565',NULL,'Pratomo Bowo Leksono','082215711850','Komplek Graha Sari Endah Jl nanas No 8','-6.999608032577826,107.62737273826087','express',NULL,'transfer',100000,15000,115000,'delivered',NULL,'2025-10-20 19:56:02','2025-10-21 18:46:39');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` varchar(255) NOT NULL,
  `customer_id` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES ('3-qPlmCfNN4NKUMIsTBUp','Xyo-e1BZ2T4p147TU0iRn','mc5jYBHoQE5FXvOGRf9w8lczchze8W4yCLId3llgpKdpJmamYdTuAEVZxB348cxF','2025-10-21 01:24:55',1,'2025-10-21 00:24:55'),('3hBcXFqi03kwc2BRtZKv6','Xyo-e1BZ2T4p147TU0iRn','yUENKRaDlmdA8scHkKMNWhQTr0lEeYo42gI2bAox19oQINgSdYfnAfWFqvjSaSeg','2025-10-21 01:16:51',1,'2025-10-21 00:16:51'),('7U0Ub7B9E10nTKzxkSYI7','Xyo-e1BZ2T4p147TU0iRn','Bevx31bk0775umElJH431vzCtzMFDRZ0phvhqs1gZPLXqPOJHF1UX4hvNYqLOxlK','2025-10-21 00:31:32',1,'2025-10-20 23:31:32'),('9FHA9Stvc78msdQB5BUW5','Xyo-e1BZ2T4p147TU0iRn','OVfo4LQtJGrMtYtyIikJflMSp1iSLJUaEt776cUmeKspHR1WDbPdes2T9GmvgO1S','2025-10-21 01:04:30',1,'2025-10-21 00:04:30'),('cNzZLf1ize3LmDZj2THfy','Xyo-e1BZ2T4p147TU0iRn','HXvjCqC1M9hNhRLczeKPwaJ0RB8TAYywoLjEnJZevLwJL73E6fnM8uLWAupVcx1j','2025-10-21 01:31:55',1,'2025-10-21 00:31:55'),('ftOQgwG255BlM6qpui-gT','Xyo-e1BZ2T4p147TU0iRn','UicRctyX6jFcuAV6Dq3jxnilMkOU316VaBGg9POjJYs0WBbr7kreGEyKTj2bHdPR','2025-10-21 00:53:25',1,'2025-10-20 23:53:25'),('gOE-SfyVermfmlK3lROnE','Xyo-e1BZ2T4p147TU0iRn','qrnuPKXgT9rTmhvPMZtvAxs8QlsgNVGTOHHBXyp5adDYTXycc239dbuTGqPNKAmw','2025-10-21 00:32:01',1,'2025-10-20 23:32:01'),('Jfoq99uibs0e5FWpXfRy5','Xyo-e1BZ2T4p147TU0iRn','3GmtkLhtUZEIY3kQXJWuVuNtI5IVXFEcCgpsCs8LbKBmoRLK1D8SFViZq7y7C4e9','2025-10-21 00:50:32',1,'2025-10-20 23:50:32'),('lEeoVXAQZDo1NdSqj5U30','Xyo-e1BZ2T4p147TU0iRn','pivdr5xhrYlm8RQmrU2re24uQpB2ozqXkJxeYH0ui0aQH33gsf71fZ5sTgiCqpkE','2025-10-21 01:19:17',1,'2025-10-21 00:19:17'),('ObVa4az48VdxnojBlYdu4','Xyo-e1BZ2T4p147TU0iRn','kz4DDy2nGfWd3h600obEeZ8fIiGCo3pZptRvLC0kmZRwhDOcMN1sQCqivhHvVfBC','2025-10-21 01:24:43',1,'2025-10-21 00:24:43'),('rvHk4SXbrjJVkGCRSj9Qh','Xyo-e1BZ2T4p147TU0iRn','r6BiQ9GZJoUxyTFGUAX0eKnB4i8h7tT7JGJtGcFXzsX4iZXSpla5YKAGl1qqOKRh','2025-10-20 23:36:03',1,'2025-10-20 22:36:03'),('t5cswkAJyajPCpcjZYLE8','Xyo-e1BZ2T4p147TU0iRn','IFb82Mf19uQIi2xCW7uQ2mpQMVJnWKVdeAXHsJA3xpswnF58B2VfL2kFbN4VnX23','2025-10-21 01:25:33',1,'2025-10-21 00:25:33'),('tPpVib2a4r7EiF8MLXmck','Xyo-e1BZ2T4p147TU0iRn','7ExXqSbdDN5KJvQb2M6EqgnfuYCN5EAUsid1pEvzxZXzqE6MCWY7buS7rHJuPKiM','2025-10-21 00:53:09',1,'2025-10-20 23:53:09'),('zn4bDiL-aTF_vKtlmY-7K','Xyo-e1BZ2T4p147TU0iRn','ljWl23RLmo694rRsi5uWQljsM73sHXzFpJ6V6oNiLHHtg0zP52di5nLvoPYgl21Q','2025-10-21 00:32:25',1,'2025-10-20 23:32:25');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` varchar(255) NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `customer_id` varchar(255) DEFAULT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `comment` varchar(1000) NOT NULL,
  `date` varchar(255) NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `fk_product_reviews_customer_id` (`customer_id`),
  KEY `fk_product_reviews_order_id` (`order_id`),
  CONSTRAINT `fk_product_reviews_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_reviews_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES ('PgXo1DirmQCHFhmVc0BT5','9WkoE2V_jdFkNtWKat-Je','Xyo-e1BZ2T4p147TU0iRn','4PQ2NW45S1iEEYbjpIx3k','Pratomo Bowo Leksono',5,'bagus barang nya','2025-10-22',1,'2025-10-21 19:36:36','2025-10-21 19:36:36'),('vWPkhTMl0M7mQh35oe_6R','w_VKIjJ6dU0mkO0dWeT7b','Xyo-e1BZ2T4p147TU0iRn','8ZH-ha7SdysQEIoNuresF','Pratomo Bowo Leksono',5,'kepiting nya fresh sih, keren','2025-10-22',1,'2025-10-21 18:50:01','2025-10-21 18:50:01');
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_tags`
--

DROP TABLE IF EXISTS `product_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_tags` (
  `id` varchar(255) NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `tag_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `product_tags_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_tags`
--

LOCK TABLES `product_tags` WRITE;
/*!40000 ALTER TABLE `product_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` varchar(255) NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `unit_id` varchar(255) NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `weight` varchar(50) NOT NULL,
  `price` float NOT NULL,
  `original_price` float DEFAULT NULL,
  `in_stock` tinyint(1) NOT NULL DEFAULT '1',
  `min_order_quantity` int NOT NULL DEFAULT '1',
  `barcode` varchar(255) DEFAULT NULL,
  `variant_code` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `stock_quantity` int NOT NULL DEFAULT '0',
  `manage_stock` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `product_id` (`product_id`),
  KEY `unit_id` (`unit_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variants_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES ('0lIEHhQ0RcaiowTgu-FL7','l6e3fua0xdoTYhlDHKDb-','kilogram','AAA-1kg-YLBH','1',10000,20000,1,1,NULL,NULL,1,0,0,'2025-10-21 08:00:35','2025-10-21 08:00:35'),('79Vrvk1hUTgp6Ul9mrY0e','pnTDScVshjGV3t0vc9F5D','gram',NULL,'250',10000,10000,1,1,NULL,NULL,1,0,0,'2025-10-20 00:17:51','2025-10-20 00:17:51'),('bO2o8fnpJgmY-la6ewK5W','w_VKIjJ6dU0mkO0dWeT7b','kilogram',NULL,'1',45000,50000,1,1,NULL,NULL,1,0,0,'2025-10-20 00:25:56','2025-10-20 00:25:56'),('kb_qXBGh_e7HD7GYtDdKu','IkmtAUIDOXSQNtTI98zIw','gram','TES-100g-B3CV','100',10000,10000,1,1,NULL,NULL,1,0,0,'2025-10-20 15:22:32','2025-10-20 15:22:32'),('LSct5v-Ttvuz0aaZwBznI','g0Kc1DPkGmFC3VaYy4bSV','kilogram',NULL,'1',90000,90000,1,1,NULL,NULL,1,0,0,'2025-10-19 23:53:38','2025-10-19 23:53:38'),('NIYVjM-V0jsV8xii71QMf','IkmtAUIDOXSQNtTI98zIw','gram','TES-250g-B3CV','250',20000,20000,1,1,NULL,NULL,1,0,0,'2025-10-20 15:22:32','2025-10-20 15:22:32'),('nXB5CmIfpi6NTf3UOsixj','8BQ7n0N5rXG4K1bCUTRPD','kilogram',NULL,'1',100000,100000,1,1,NULL,NULL,1,0,0,'2025-10-19 23:19:13','2025-10-19 23:19:13'),('QFnnbIVePmBGLUklNvSGX','9WkoE2V_jdFkNtWKat-Je','gram',NULL,'500',38000,38000,1,1,NULL,NULL,1,0,0,'2025-10-19 23:51:32','2025-10-19 23:57:10'),('xNory2VGSNnQbvncZIv1u','g0Kc1DPkGmFC3VaYy4bSV','gram',NULL,'500',45000,45000,1,1,NULL,NULL,1,0,0,'2025-10-19 23:53:38','2025-10-19 23:53:38'),('Zf7ujvucNPpeNk5st_CLf','9WkoE2V_jdFkNtWKat-Je','kilogram',NULL,'1',75000,75000,1,1,NULL,NULL,1,0,0,'2025-10-19 23:44:41','2025-10-19 23:57:10');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL DEFAULT '',
  `category_id` varchar(255) NOT NULL,
  `base_price` float NOT NULL,
  `description` varchar(1000) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `default_variant_id` varchar(255) DEFAULT NULL,
  `rating` float NOT NULL DEFAULT '0',
  `review_count` int NOT NULL DEFAULT '0',
  `is_on_sale` tinyint(1) NOT NULL DEFAULT '0',
  `discount_percentage` float DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('8BQ7n0N5rXG4K1bCUTRPD','Kepiting Telur Segar','kepiting-telur-segar','ikan',0,'Kepiting Segar dari pasar langsung','/uploads/Fm3PNTkEIQn6gRRwYGx8m.webp','m2IsP5nufAXfovI45iPGp',0,0,0,NULL,'2025-10-19 23:19:13','2025-10-21 14:37:58'),('9WkoE2V_jdFkNtWKat-Je','Fillet Tenggiri Segar','fillet-tenggiri-segar','ikan',0,'Fillet Ikan Tenggiri Segar','/uploads/mEi1FisJ1hgEn6ViiMZz8.webp','QFnnbIVePmBGLUklNvSGX',5,1,0,NULL,'2025-10-19 23:44:41','2025-10-21 19:36:36'),('g0Kc1DPkGmFC3VaYy4bSV','Fillet Ikan Tuna Segar','fillet-ikan-tuna-segar','ikan',0,'Fillet Ikan Tuna Segar Langsung dari Pasar','/uploads/A5TmERJTgdoZ5FzVyuhDO.webp','nkt35rNZK6W7yIMoAcfPc',0,0,0,NULL,'2025-10-19 23:53:38','2025-10-21 14:37:58'),('IkmtAUIDOXSQNtTI98zIw','test 3','test-3','ayam',0,'test 3','/uploads/0PaLKfBk3Lsb-T4_-XwC-.webp','yf0U3Jou2dyjf4df-oYqp',0,0,0,NULL,'2025-10-20 15:22:32','2025-10-21 14:37:58'),('l6e3fua0xdoTYhlDHKDb-','aaa aa','aaa-aa','ayam',0,'aaaaaa','/uploads/83mm74M7j-_p5kBPRF39L.webp','WUTU93vFKt-lBaLpLY3Ko',0,0,1,NULL,'2025-10-21 08:00:35','2025-10-21 08:00:35'),('pnTDScVshjGV3t0vc9F5D','test item','test-item','ayam',0,'test item','/uploads/fjKQ-tQUUB1TnGn9Ib63Q.webp','w2GFwOXlUa2wKX3S6Z2DE',0,0,0,NULL,'2025-10-20 00:17:51','2025-10-21 14:37:58'),('w_VKIjJ6dU0mkO0dWeT7b','test 2','test-2','ayam',0,'test 2','/uploads/ISS3V7uqv3wuwrMDBh2Pp.webp','Aa21NwGjipaZHISGlh3Dz',5,1,1,NULL,'2025-10-20 00:25:56','2025-10-21 18:50:01');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `smtp_settings`
--

DROP TABLE IF EXISTS `smtp_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `smtp_settings` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `host` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `port` int NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PasarAntar',
  `secure` tinyint(1) NOT NULL DEFAULT '0',
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `smtp_settings`
--

LOCK TABLES `smtp_settings` WRITE;
/*!40000 ALTER TABLE `smtp_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `smtp_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#3B82F6',
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `units` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `abbreviation` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units`
--

LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;
INSERT INTO `units` VALUES ('gram','Gram','g',NULL,1,'2025-10-17 15:34:29','2025-10-17 15:34:29'),('kilogram','Kilogram','kg',NULL,1,'2025-10-17 15:34:29','2025-10-17 15:34:29'),('pcs','Pieces','pcs',NULL,1,'2025-10-17 15:34:29','2025-10-17 15:34:29');
/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `website_settings`
--

DROP TABLE IF EXISTS `website_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `website_settings` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `site_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `site_description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_address` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hide_site_name_and_description` tinyint(1) NOT NULL DEFAULT '0',
  `business_hours` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_media_links` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `admin_whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `website_settings`
--

LOCK TABLES `website_settings` WRITE;
/*!40000 ALTER TABLE `website_settings` DISABLE KEYS */;
INSERT INTO `website_settings` VALUES ('twJN8HdWyIkL-9XjtCcQg','PasarAntar','Platform belanja online terpercaya untuk produk segar berkualitas','http://localhost:3000/uploads/aTbmNpDdcvYx3RhT3gnWW.webp','PasarAntar - Belanja Produk Segar Online','PasarAntar adalah platform belanja online terpercaya untuk daging, ikan, dan produk segar lainnya. Kualitas terjamin, pengantaran cepat.','admin@pasarantar.com','082215711850','Komplek, Jl. Graha Sari Endah Jl. Nanas No.8, Baleendah, Kabupaten Bandung, Jawa Barat 40375',1,'{\"monday\":{\"open\":\"08:00\",\"close\":\"17:00\",\"closed\":false},\"tuesday\":{\"open\":\"08:00\",\"close\":\"17:00\",\"closed\":false},\"wednesday\":{\"open\":\"08:00\",\"close\":\"17:00\",\"closed\":false},\"thursday\":{\"open\":\"08:00\",\"close\":\"17:00\",\"closed\":false},\"friday\":{\"open\":\"08:00\",\"close\":\"17:00\",\"closed\":false},\"saturday\":{\"open\":\"08:00\",\"close\":\"15:00\",\"closed\":false},\"sunday\":{\"open\":\"08:00\",\"close\":\"15:00\",\"closed\":true}}','{}','2025-10-18 07:00:38','2025-10-22 04:35:18',NULL);
/*!40000 ALTER TABLE `website_settings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-25 17:03:21
