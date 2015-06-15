CREATE DEFINER=`sumBits`@`%` PROCEDURE `postnearby`(
	IN lat double,
    IN lon double,
    IN content text,
    IN author varchar(45))
BEGIN
	DECLARE size DOUBLE DEFAULT .5*.01*20;
    DECLARE postusername VARCHAR(45);
    SELECT username into @postusername from Users where email=author;
    SET @loc = geomfromtext(CONCAT('POINT(',lat,' ',lon,')'));
	SET @g = CONCAT('POLYGON((',x(@loc)-@size,' ',y(@loc)-@size,',',x(@loc)-@size,' ',y(@loc)+@size,',',x(@loc)+@size,' ',y(@loc)+@size,',',x(@loc)+@size,' ',y(@loc)-@size,',',x(@loc)-@size,' ',y(@loc)-@size,'))');
	INSERT INTO posts (`location`, `lookuprange`, `timestamp`, `content`, `vote`, `author`) VALUES (@loc,geomfromtext(@g), now(), content, 1, @postusername);
END