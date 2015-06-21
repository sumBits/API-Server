CREATE DEFINER=`sumBits`@`%` PROCEDURE `downvote`(IN id INT)
BEGIN
	DECLARE votecount INT;
    DECLARE size DOUBLE;
    DECLARE g TEXT;
    DECLARE loc POINT;
	SELECT vote INTO @votecount 
		FROM posts 
        WHERE postid=id;
	IF @votecount > -5
    THEN
		SELECT location INTO @loc
			FROM posts
			WHERE postid=id;
		SET @size = .5*.01*(10*LN(ABS(@votecount-1))+20);
		SELECT x(@loc) into @x;
    	SELECT y(@loc) into @y;
		SET @g = CONCAT('POLYGON((',@x-@size,' ',@y-@size,',',@x-@size,' ',@y+@size,',',@x+@size,' ',@y+@size,',',@x+@size,' ',@y-@size,',',@x-@size,' ',@y-@size,'))');
	
		UPDATE posts SET vote = vote - 1, lookuprange = geomfromtext(@g) WHERE postid=id;
	ELSE
		DELETE
			FROM posts
            WHERE postid=id;
		SELECT 'Deleted post';
	END IF;
END