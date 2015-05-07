CREATE DEFINER=`sumBits`@`%` PROCEDURE `post_nearby`(
	IN lat double,
    IN lon double,
    IN content text,
    IN author varchar(45))
BEGIN
	DECLARE size DOUBLE DEFAULT .5*.01*20;
	INSERT INTO posts (`location`, `lookuprange`, `timestamp`, `content`, `vote`, `author`) VALUES (geomfromtext(CONCAT('POLYGON((',@lat-@size,' ',@lon-@size,',',@lat-@size,' ',@lon+@size,',',@lat+@size,' ',@lon+@size,',',@lat+@size,' ',@lon-@size,',',@lat-@size,' ',@lon-@size,'))')), geomfromtext(CONCAT('POINT(',@lat,' ',@lon,')')), now(), @content, 1, @author);
END