CREATE DEFINER=`sumBits`@`%` PROCEDURE `downvote`(IN id INT)
BEGIN
	DECLARE votecount INT;
    DECLARE size DOUBLE;
    DECLARE g TEXT;
    DECLARE loc POINT;
	SELECT vote INTO votecount 
		FROM posts 
        WHERE postid=id;
	IF @votecount-1 > -5
    THEN
		SELECT location INTO loc
			FROM posts
			WHERE postid=id;
		
		SET @size = .5*.1*(10*LN(ABS(votecount-1))+20);
		SET @g = CONCAT('POLYGON(',x(@loc)-@size,' ',y(@loc)-@size,',',x(@loc)-@size,' ',y(@loc)+@size,',',x(@loc)+@size,' ',y(@loc)-@size,',',x(@loc)+@size,' ',y(@loc)+@size,')');
		
		UPDATE posts SET vote = vote - 1, lookuprange = geomfromtext(@g) WHERE postid=id;
	ELSE
		DELETE
			FROM posts
            WHERE postid=id;
	END IF;
END