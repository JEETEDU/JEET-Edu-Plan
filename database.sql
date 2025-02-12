-- --------------------------------------------------------
-- 호스트:                          192.168.0.7
-- 서버 버전:                        11.3.2-MariaDB-1:11.3.2+maria~deb11 - mariadb.org binary distribution
-- 서버 OS:                        debian-linux-gnu
-- HeidiSQL 버전:                  12.3.0.6589
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- jeet 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `jeet` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `jeet`;

-- 테이블 jeet.alert 구조 내보내기
CREATE TABLE IF NOT EXISTS `alert` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `read` tinyint(4) NOT NULL DEFAULT 0,
  `alert_type` tinyint(4) NOT NULL DEFAULT 0,
  `article_id` int(11) DEFAULT NULL,
  `message` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `alert_article_id_board_id_fk` (`article_id`),
  KEY `alert_user_id_user_uid_fk` (`user_id`),
  CONSTRAINT `alert_article_id_board_id_fk` FOREIGN KEY (`article_id`) REFERENCES `board` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `alert_user_id_user_uid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=383 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.board 구조 내보내기
CREATE TABLE IF NOT EXISTS `board` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `create_time` datetime NOT NULL DEFAULT current_timestamp(),
  `update_time` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `attach_files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attach_files`)),
  `category` tinyint(4) DEFAULT NULL,
  `notice` tinyint(4) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `comment_count` int(11) NOT NULL DEFAULT 0,
  `subject_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_board_subject` (`subject_id`),
  KEY `FK_board_user` (`user_id`),
  KEY `FK_board_class_info` (`class_id`),
  CONSTRAINT `FK_board_class_info` FOREIGN KEY (`class_id`) REFERENCES `class_info` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_board_subject` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_board_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.book 구조 내보내기
CREATE TABLE IF NOT EXISTS `book` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `update_time` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id` (`id`),
  KEY `FK__user` (`user_id`),
  CONSTRAINT `FK__user` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.class_info 구조 내보내기
CREATE TABLE IF NOT EXISTS `class_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `display` tinyint(4) NOT NULL DEFAULT 1,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.comment 구조 내보내기
CREATE TABLE IF NOT EXISTS `comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `attach_files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attach_files`)),
  `create_time` datetime NOT NULL DEFAULT current_timestamp(),
  `update_time` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `comment_id3_user_uid_fk` (`user_id`) USING BTREE,
  KEY `comment_id2_board_id_fk` (`article_id`) USING BTREE,
  CONSTRAINT `comment_id2_board_id_fk` FOREIGN KEY (`article_id`) REFERENCES `board` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `comment_id3_user_uid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.fcm 구조 내보내기
CREATE TABLE IF NOT EXISTS `fcm` (
  `user_id` int(11) NOT NULL,
  `token` tinytext NOT NULL,
  UNIQUE KEY `token` (`token`) USING HASH,
  KEY `fcm_user_id_user_uid_fk` (`user_id`),
  CONSTRAINT `fcm_user_id_user_uid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.file 구조 내보내기
CREATE TABLE IF NOT EXISTS `file` (
  `id` char(12) NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.homework 구조 내보내기
CREATE TABLE IF NOT EXISTS `homework` (
  `article_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `due_date` date DEFAULT NULL,
  `done` tinyint(4) DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subject_id` int(11) NOT NULL,
  PRIMARY KEY (`article_id`,`user_id`),
  KEY `homework_class_id_class_info_id_fk` (`class_id`) USING BTREE,
  KEY `homework_subject_id_subject_id_fk` (`subject_id`),
  KEY `homework_user_id_user_uid_fk` (`user_id`),
  CONSTRAINT `homework_article_id_board_id_fk` FOREIGN KEY (`article_id`) REFERENCES `board` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `homework_cid_class_info_id_fk` FOREIGN KEY (`class_id`) REFERENCES `class_info` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `homework_subject_id_subject_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `homework_user_id_user_uid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.log 구조 내보내기
CREATE TABLE IF NOT EXISTS `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `detail` text NOT NULL,
  `time` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `log_user_id_user_uid_fk` (`user_id`),
  CONSTRAINT `log_user_id_user_uid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=245 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.sleep 구조 내보내기
CREATE TABLE IF NOT EXISTS `sleep` (
  `date` date NOT NULL DEFAULT curdate(),
  `user_id` int(11) NOT NULL,
  `wakeup` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sleep` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`date`,`user_id`),
  KEY `sleep_user_id_user_uid_fk` (`user_id`),
  CONSTRAINT `sleep_user_id_user_uid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.student_class 구조 내보내기
CREATE TABLE IF NOT EXISTS `student_class` (
  `user_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`class_id`),
  KEY `student_class_class_id_class_info_id_fk` (`class_id`),
  CONSTRAINT `student_class_class_id_class_info_id_fk` FOREIGN KEY (`class_id`) REFERENCES `class_info` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `student_class_user_id_user_uid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.subject 구조 내보내기
CREATE TABLE IF NOT EXISTS `subject` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `class_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_subject_class_info` (`class_id`),
  CONSTRAINT `FK_subject_class_info` FOREIGN KEY (`class_id`) REFERENCES `class_info` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.teacher_class 구조 내보내기
CREATE TABLE IF NOT EXISTS `teacher_class` (
  `user_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  KEY `teacher_class_subjec_id_subject_id_fk` (`subject_id`) USING BTREE,
  KEY `teacher_class_class_id_class_info_id_fk` (`class_id`),
  KEY `teacher_class_user_id_user_uid_fk` (`user_id`),
  CONSTRAINT `teacher_class_class_id_class_info_id_fk` FOREIGN KEY (`class_id`) REFERENCES `class_info` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `teacher_class_subject_id_subject_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `teacher_class_user_id_user_uid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.timetable 구조 내보내기
CREATE TABLE IF NOT EXISTS `timetable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start` time NOT NULL,
  `end` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `timetable_class_id_class_info_id_fk` (`class_id`),
  KEY `timetable_subject_id_subject_id_fk` (`subject_id`),
  CONSTRAINT `timetable_class_id_class_info_id_fk` FOREIGN KEY (`class_id`) REFERENCES `class_info` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `timetable_subject_id_subject_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.today_answer 구조 내보내기
CREATE TABLE IF NOT EXISTS `today_answer` (
  `date` date NOT NULL DEFAULT curdate(),
  `user_id` int(11) NOT NULL,
  `answer_1` text DEFAULT NULL,
  `answer_2` text DEFAULT NULL,
  `answer_3` text DEFAULT NULL,
  `answer_lastday` text DEFAULT NULL,
  `answer_school` text DEFAULT NULL,
  `answer_academy` text DEFAULT NULL,
  PRIMARY KEY (`date`,`user_id`) USING BTREE,
  KEY `today_answer_user_id_user_uid_fk` (`user_id`),
  CONSTRAINT `today_answer_user_id_user_uid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.today_question 구조 내보내기
CREATE TABLE IF NOT EXISTS `today_question` (
  `date` date NOT NULL,
  `question_1` text DEFAULT NULL,
  `question_2` text DEFAULT NULL,
  `question_3` text DEFAULT NULL,
  PRIMARY KEY (`date`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.to do 구조 내보내기
CREATE TABLE IF NOT EXISTS `todo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `due_date` date DEFAULT NULL,
  `content` text NOT NULL,
  `done` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `todo_user_id_user_uid_fk` (`user_id`),
  CONSTRAINT `todo_user_id_user_uid_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 jeet.user 구조 내보내기
CREATE TABLE IF NOT EXISTS `user` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `login_id` char(20) NOT NULL,
  `pw` binary(32) NOT NULL,
  `user_type` tinyint(4) NOT NULL DEFAULT 0,
  `name` char(5) NOT NULL,
  `first_year` year(4) DEFAULT NULL,
  `school` varchar(255) DEFAULT NULL,
  `joined_term` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `user_login_id_unique` (`login_id`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
