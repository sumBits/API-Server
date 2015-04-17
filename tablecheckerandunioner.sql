CREATE PROCEDURE `TableCheckerAndUnioner` ()
BEGIN
  Set @s = 'SELECT * FROM worldwide';
  IF (SELECT COUNT(tablename1) FROM information_schema.tables) > 0
    then SET @s=concat(@s, ' UNION ALL SELECT * FROM *tablename1*');
  END IF;
  IF (SELECT COUNT(tablename2) FROM information_schema.tables) > 0
	then SET @s=concat(@s, ' UNION ALL SELECT * FROM *tablename2*');
  END IF;
  IF (SELECT COUNT(tablename3) FROM information_schema.tables) > 0
	then SET @s=concat(@s, ' UNION ALL SELECT * FROM *tablename3*');
  END IF;
  PREPARE stm FROM @s;
  EXECUTE stm;
END
