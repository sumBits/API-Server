CREATE DEFINER=`sumBits`@`%` PROCEDURE `postnearby`(
	IN lat double,
    IN lon double,
    IN content text,
    IN author varchar(45))
BEGIN
    DECLARE postusername VARCHAR(45);
    DECLARE g TEXT;
    SELECT username into @postusername from Users where email=author;
    SET @loc = geomfromtext(CONCAT('POINT(',lat,' ',lon,')'));
    SET @size = 0.1;
    SELECT x(@loc) into @x;
    SELECT y(@loc) into @y;
	SET @g = CONCAT('POLYGON((',@x-@size,' ',@y-@size,',',@x-@size,' ',@y+@size,',',@x+@size,' ',@y+@size,',',@x+@size,' ',@y-@size,',',@x-@size,' ',@y-@size,'))');
	
    INSERT INTO posts (`location`, `lookuprange`, `timestamp`, `content`, `vote`, `author`) VALUES (@loc,geomfromtext(@g), now(), content, 1, @postusername);
END