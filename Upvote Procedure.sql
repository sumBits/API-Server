CREATE PROCEDURE `upvote` (id INT)
BEGIN
@size = .5*(10*LN(ABS(vote+1))+20);
UPDATE posts SET vote = vote+ 1, lookuprange = geomfromtext(POLYGON((x(location)-@size) (y(location)-@size),(x(location)-@size) (y(location)+@size),(x(location)+@size) (y(location)-@size),(x(location)+@size) (y(location)-@size))) WHERE postid=id;
END