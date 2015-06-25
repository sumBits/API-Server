CREATE DEFINER=`sumBits`@`%` PROCEDURE `upvote`(IN id INT)
BEGIN
	DECLARE votecount INT;
    DECLARE loc POINT;
	SELECT vote INTO votecount 
		FROM posts 
        WHERE postid=id;
	
    SELECT location INTO loc
		FROM posts
        WHERE postid=id;
	
	SET @size = .5*.01*(10*LN(ABS(@votecount+1))+20);
	SELECT x(@loc) into @x;
    SELECT y(@loc) into @y;
	SET @g = CONCAT('POLYGON((',@x-@size,' ',@y-@size,',',@x-@size,' ',@y+@size,',',@x+@size,' ',@y+@size,',',@x+@size,' ',@y-@size,',',@x-@size,' ',@y-@size,'))');
	
	UPDATE posts SET vote = vote + 1, lookuprange = geomfromtext(@g) WHERE postid=id;
END