CREATE DEFINER=`sumBits`@`%` PROCEDURE `post_nearby`(IN z text)
BEGIN
  SET @s = CONCAT('CREATE TABLE IF NOT EXISTS ', z, ' (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`title` VARCHAR(255) NOT NULL,
	`category` VARCHAR(15) NULL DEFAULT NULL,
	`timestamp` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
	`latitude` DOUBLE NULL DEFAULT NULL,
	`longitude` DOUBLE NULL DEFAULT NULL,
	`content` TEXT NOT NULL,
	`vote` INT(11) NULL DEFAULT 1,
	PRIMARY KEY (`id`),
	UNIQUE INDEX `title_UNIQUE` (`title` ASC))
  ENGINE = MyISAM;');
  PREPARE stm FROM @s;
  EXECUTE stm;
END