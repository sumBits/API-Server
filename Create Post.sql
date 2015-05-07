CREATE DEFINER=`sumBits`@`%` PROCEDURE `post_nearby`(
	IN lat double,
    IN lon double,
    IN content text,
    IN author varchar(45))
BEGIN
	DECLARE size DOUBLE DEFAULT .5*.01*20;
    DECLARE postusername VARCHAR(45);
    SELECT username into @postusername from Users where email=@author;
	INSERT INTO posts (`location`, `lookuprange`, `timestamp`, `content`, `vote`, `author`) VALUES (geomfromtext(CONCAT('POINT(',@lat,' ',@lon,')')),geomfromtext(CONCAT('POLYGON((',@lat-@size,' ',@lon-@size,',',@lat-@size,' ',@lon+@size,',',@lat+@size,' ',@lon+@size,',',@lat+@size,' ',@lon-@size,',',@lat-@size,' ',@lon-@size,'))')), now(), @content, 1, @postusername);
END