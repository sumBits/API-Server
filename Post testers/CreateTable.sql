if COUNT(SELECT * FROM information_schema.tables WHERE TABLE_SCHEMA = 'ThreadsDB' AND table_name = 'zone_39_n106')=0 then
  CREATE TABLE `ThreadsDB`.`zone_#_#` (
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
  ENGINE = MyISAM;
end if;
INSERT INTO 'zone_39_n106' SET {
  "title":"Testy test",
  "category":"Test",
  "latitude":38,
  "longitude":-104,
  "content":"This is a post that should return an error"
};