CREATE PROCEDURE `TableCheckerAndUnioner` ()
BEGIN
  Set @s = 'SELECT * FROM worldwide';
  IF (EXISTS (SELECT tablename1 FROM information_schema.tables))
    then SET @s=concat(@s, ' UNION ALL SELECT * FROM *tablename1*');
  END IF;
  IF (EXISTS (SELECT tablename2 FROM information_schema.tables))
	then SET @s=concat(@s, ' UNION ALL SELECT * FROM *tablename2*');
  END IF;
  IF (EXISTS (SELECT tablename3 FROM information_schema.tables))
	then SET @s=concat(@s, ' UNION ALL SELECT * FROM *tablename3*');
  END IF;
  PREPARE stm FROM @s;
  EXECUTE stm;
END
