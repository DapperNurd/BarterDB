CREATE DATABASE  IF NOT EXISTS `barterdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `barterdb`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: barterdb
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `item`
--

DROP TABLE IF EXISTS `item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `value` int NOT NULL,
  `transfer_cost` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item`
--

LOCK TABLES `item` WRITE;
/*!40000 ALTER TABLE `item` DISABLE KEYS */;
INSERT INTO `item` VALUES (11,'Wheat (lb)',5,2,'2024-11-09 02:56:13','2024-11-08 20:35:16'),(12,'Potato (lb)',2,3,'2024-11-09 02:56:19','2024-11-08 21:58:38'),(13,'Saffron (g)',10,2,'2024-11-09 02:56:38','2024-11-08 20:35:49'),(14,'Corn (lb)',8,3,'2024-11-09 02:56:57','2024-11-08 20:35:53');
/*!40000 ALTER TABLE `item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_transit`
--

DROP TABLE IF EXISTS `item_transit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_transit` (
  `item_transit_id` int NOT NULL AUTO_INCREMENT,
  `receiving_user_id` int NOT NULL,
  `received_item_id` int NOT NULL,
  `receiving_amount` float NOT NULL,
  `associated_transaction_id` int NOT NULL,
  PRIMARY KEY (`item_transit_id`),
  KEY `receiving_user_id_idx` (`receiving_user_id`),
  KEY `associated_transaction_id_idx` (`associated_transaction_id`),
  KEY `received_item_id_idx` (`received_item_id`),
  CONSTRAINT `associated_transaction_id` FOREIGN KEY (`associated_transaction_id`) REFERENCES `transaction` (`transaction_id`),
  CONSTRAINT `received_item_id` FOREIGN KEY (`received_item_id`) REFERENCES `item` (`item_id`),
  CONSTRAINT `receiving_user_id` FOREIGN KEY (`receiving_user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_transit`
--

LOCK TABLES `item_transit` WRITE;
/*!40000 ALTER TABLE `item_transit` DISABLE KEYS */;
/*!40000 ALTER TABLE `item_transit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `link` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `notification_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partnership`
--

DROP TABLE IF EXISTS `partnership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partnership` (
  `partnership_id` int NOT NULL AUTO_INCREMENT,
  `user1_id` int DEFAULT NULL,
  `user2_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`partnership_id`),
  KEY `user1_id_idx` (`user1_id`),
  KEY `user2_id_idx` (`user2_id`),
  CONSTRAINT `user1_id` FOREIGN KEY (`user1_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `user2_id` FOREIGN KEY (`user2_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partnership`
--

LOCK TABLES `partnership` WRITE;
/*!40000 ALTER TABLE `partnership` DISABLE KEYS */;
INSERT INTO `partnership` VALUES (41,73,60,'2024-11-08 01:59:56','2024-11-07 17:59:56'),(42,75,59,'2024-11-12 21:51:53','2024-11-12 13:51:53');
/*!40000 ALTER TABLE `partnership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partnership_request`
--

DROP TABLE IF EXISTS `partnership_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partnership_request` (
  `partnership_request_id` int NOT NULL AUTO_INCREMENT,
  `requesting_user_id` int DEFAULT NULL,
  `requested_user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`partnership_request_id`),
  KEY `requesting_user_id_idx` (`requesting_user_id`),
  KEY `requested_user_id_idx` (`requested_user_id`),
  CONSTRAINT `requested_user_id` FOREIGN KEY (`requested_user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `requesting_user_id` FOREIGN KEY (`requesting_user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partnership_request`
--

LOCK TABLES `partnership_request` WRITE;
/*!40000 ALTER TABLE `partnership_request` DISABLE KEYS */;
INSERT INTO `partnership_request` VALUES (105,64,59,'2024-10-22 17:29:13'),(115,59,75,'2024-11-12 21:50:48');
/*!40000 ALTER TABLE `partnership_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `posting_user_id` int NOT NULL,
  `requesting_item_id` int NOT NULL,
  `requesting_amount` float DEFAULT '1',
  `offering_item_id` int NOT NULL,
  `offering_amount` float DEFAULT '1',
  `is_negotiable` tinyint DEFAULT '0',
  `user_id_receiving` int NOT NULL,
  `user_id_giving` int NOT NULL,
  `is_matched` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `requesting_item_id_idx` (`requesting_item_id`),
  KEY `offering_item_id_idx` (`offering_item_id`),
  KEY `posting_user_id_idx` (`posting_user_id`),
  KEY `user_id_receiving_idx` (`user_id_receiving`),
  KEY `user_id_giving_idx` (`user_id_giving`),
  CONSTRAINT `offering_item_id` FOREIGN KEY (`offering_item_id`) REFERENCES `item` (`item_id`),
  CONSTRAINT `posting_user_id` FOREIGN KEY (`posting_user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `requesting_item_id` FOREIGN KEY (`requesting_item_id`) REFERENCES `item` (`item_id`),
  CONSTRAINT `user_id_giving` FOREIGN KEY (`user_id_giving`) REFERENCES `user` (`user_id`),
  CONSTRAINT `user_id_receiving` FOREIGN KEY (`user_id_receiving`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (127,59,12,8,14,2,0,75,59,1,'2024-11-12 22:10:00','2024-11-12 14:11:04'),(128,60,14,2,12,8,0,73,60,1,'2024-11-12 22:10:57','2024-11-12 14:11:04'),(129,75,14,25,12,100,1,59,75,1,'2024-11-12 22:13:01','2024-11-12 14:13:53'),(130,73,12,4,14,1,1,60,73,1,'2024-11-12 22:13:46','2024-11-12 14:13:53'),(131,59,13,4,14,5,0,59,59,1,'2024-11-17 00:10:37','2024-11-16 16:12:35'),(132,60,14,5,13,4,0,60,60,1,'2024-11-17 00:11:45','2024-11-16 16:12:35'),(133,59,14,10,13,8,1,59,59,1,'2024-11-17 00:39:07','2024-11-16 16:39:28'),(134,73,13,4,14,5,1,73,73,1,'2024-11-17 00:39:07','2024-11-16 16:39:28');
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('H2pNk1NOsoXADR2nTWkSEEPhcM1t9liJ',1731891190,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2024-11-18T00:28:11.689Z\",\"httpOnly\":true,\"path\":\"/\"},\"userId\":59}'),('upDQvxx1uWsUfRg2sSzjlc5w-7bMcF6t',1731890426,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2024-11-18T00:14:50.050Z\",\"httpOnly\":true,\"path\":\"/\"},\"userId\":73}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `primary_post_id` int NOT NULL,
  `secondary_post_id` int NOT NULL,
  `hash_code` varchar(16) NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `primary_approved` tinyint DEFAULT '0',
  `secondary_approved` tinyint DEFAULT '0',
  `proposing_post_id` int DEFAULT NULL,
  `proposing_primary_request_amt` float DEFAULT NULL,
  `proposing_primary_offer_amt` float DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `post1_id_idx` (`primary_post_id`),
  KEY `post2_id_idx` (`secondary_post_id`),
  KEY `proposing_user_id_idx` (`proposing_post_id`),
  CONSTRAINT `post1_id` FOREIGN KEY (`primary_post_id`) REFERENCES `post` (`post_id`),
  CONSTRAINT `post2_id` FOREIGN KEY (`secondary_post_id`) REFERENCES `post` (`post_id`),
  CONSTRAINT `proposing_user_id` FOREIGN KEY (`proposing_post_id`) REFERENCES `post` (`post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
INSERT INTO `transaction` VALUES (35,133,134,'M1540493ZJKWHMSE',0,0,1,134,10,8,'2024-11-17 00:39:28','2024-11-16 16:40:26');
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `access_level` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (59,'ben','$2b$10$wRELDcsIhiZ/ntDFB0xIHujrBWTJLzGR/5Aqo3oiBKNIhoKRL2p1K',NULL,NULL,2,'2024-10-22 17:23:05','2024-10-22 10:23:36'),(60,'davin','$2b$10$3KdvW4R4QXOZZ57frkHS6eKlWkOAYT1AEe7BvjAfJEY58K5E6zScq',NULL,NULL,2,'2024-10-22 17:23:12','2024-10-22 10:23:36'),(61,'cs360','$2b$10$Yu/KYDcAmzI8RBZ7p6EeQOjonntpwt23UK7wRcUfgGwVaqkeMhiMK',NULL,NULL,1,'2024-10-22 17:23:22','2024-11-08 19:51:42'),(64,'test3','$2b$10$ORsaMz0KmRkxg0y5gXwY8uMokWh3PDUHqkMfY8PoWDAvIUhyThcD.',NULL,NULL,-1,'2024-10-22 17:25:22','2024-11-08 19:49:34'),(66,'test5','$2b$10$7K6H/a7TySdVcOmt4FxKpuYSzG2/MBs7ql74WSPsz48er6KVaO352',NULL,NULL,1,'2024-10-22 17:25:45','2024-10-22 10:27:31'),(67,'test7','$2b$10$hj0tp.bCijpjEYswU4w79.yV33j7Sp.dRnfGybqEDzUhKpFlHXgC.',NULL,NULL,1,'2024-10-22 17:26:25','2024-10-22 10:27:32'),(70,'test10','$2b$10$DXXsT57ixJQQvoH9Y0vR7ui5krFmmbJweOapZaEM/hGFgiAVJyjsa',NULL,NULL,1,'2024-10-22 17:26:42','2024-10-22 14:06:43'),(72,'demo','$2b$10$bcUgTlVoxzi66GBFgiJn4eUtj7jEdm/mz3OWhFB/7hlZpKRQK8swu','1234567','some address',1,'2024-10-23 20:05:03','2024-11-12 14:06:52'),(73,'davin2','$2b$10$.HK6F2IuXgTq3alic1nxrO9mDZv/NmW07Iji2Itz0i3py4GUNNM6.',NULL,NULL,1,'2024-11-08 01:59:11','2024-11-07 17:59:30'),(75,'ben2','$2b$10$sCaGB0hAPfRRBrUE4Qc5Ge2BE6dWycAxsqWvb2t9ksN7bsiGhVL4C',NULL,NULL,1,'2024-11-12 21:49:20','2024-11-12 13:50:11');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_item`
--

DROP TABLE IF EXISTS `user_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_item` (
  `user_item_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `item_amount` float NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_item_id`),
  UNIQUE KEY `unique_user_item` (`user_id`,`item_id`),
  KEY `item_id_idx` (`item_id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `item_id` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_item`
--

LOCK TABLES `user_item` WRITE;
/*!40000 ALTER TABLE `user_item` DISABLE KEYS */;
INSERT INTO `user_item` VALUES (60,73,14,1,'2024-11-12 22:12:15','2024-11-12 14:14:33'),(63,60,12,100,'2024-11-12 22:15:14','2024-11-12 14:15:14'),(65,60,13,1,'2024-11-17 00:11:36','2024-11-16 16:14:08'),(66,60,14,5,'2024-11-17 00:15:42','2024-11-16 16:15:42'),(67,59,13,4,'2024-11-17 00:15:42','2024-11-16 16:15:42');
/*!40000 ALTER TABLE `user_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-02 22:21:07
