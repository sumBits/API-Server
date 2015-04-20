'use strict';

// Using a location json, returns array of nearby posts
exports.getNearby = function(req, res, pool) {
	// If the POST recieved is a location object (expecting an array of posts in response that are from the nearby area)
    console.log("Object type is location"); // Debugging
    console.log(req.body.latitude); // Debugging
    console.log(req.body.longitude); // Debugging
    pool.getConnection(function (err, connection) { // Create the connection to the databasae, passed as connection to the function
        connection.query(getZoneQueryRedesign([req.body.latitude, req.body.longitude]), function (err, rows) { // Send the query asking for the full table of that zip code and the 00000 zip code to the db, returns the rows json object, passed to the function
            console.log(rows); // Debugging
            if (!err) {
                // If there is no error from the db
                res.status(200); // Send a 200 code (meaning there was no error)
                res.send(rows); //  Send the json object representing the rows that were received
            } // TODO create table here?
            connection.release(); // Put the db connection back in the pool
            res.end(); // Send the END packet thing to the request, ending the connection created by the POST from the app
        });
    });
};

exports.postNearby = function(req, res,  pool) {
	// If the server recieves an object containing the post and location and user info required to make a new nearby post
    // TODO add authentication HERE, just a token verification
    pool.getConnection(function (err, connection) {
        // Create the conneciton to the database
        console.log("Post attempt: latitude - " + req.body.post.latitude + " - longitude - " + req.body.post.longitude); // Debugging
        connection.query("CALL post_nearby(\'" + zoneLookup([req.body.post.latitude, req.body.post.longitude]) + "\')", req.body.post, function (err, rows) {
            if(!err){
                // Successfully created table if necessary
                connection.query("INSERT INTO " + zoneLookup([req.body.post.latitude, req.body.post.longitude]) + " SET ?", req.body.post, function (err, rows) {
                    if(!err){
                        // Inserted Successfully!
                        res.status(200).end(); // Send a status 200 (success) and end code back to the app
                    }else{
                        res.status(500).send("There was an error posting into this Thread.").end();
                        console.log("Error posting into nearby threads: ", err);
                    }
                    connection.release(); // Release the db connection back to the pool
                });
            }else{
                // Did not successfully create table
                res.status(500).send("There was an error posting into this Thread.").end();
                console.log("Error posting into nearby threads: ", err);
            }
        });
    });
};

// UTIL FUNCIONS

function zoneLookup(arr) {
    var solution = "zone_";
    var lat = "";
    var lon = "";

    lat = Math.floor(Math.abs(arr[0])) + "";
    if (arr[0] < 0) {
        solution = solution + "n";
    };
    solution = solution + Math.abs(lat) + "_";
    lon = Math.floor(Math.abs(arr[1])) + "";
    if (arr[1] < 0) {
        solution = solution + "n";
    };
    solution = solution + Math.abs(lon);

    return solution;
};

function getZoneQueryRedesign(arr) {
    // Start with empty arrays for the latitude and longitude values to come
	var lat = [];
	var lon = [];
    // Start with the known beginning of the solution
	var solution = "Set @s = 'SELECT * FROM worldwide';\n"

	if (arr[0] < 0) {
		lat.push("n" + Math.floor(Math.abs(arr[0])));
	} else {
		lat.push(Math.floor(Math.abs(arr[0]))+"");
	};

	if (arr[1] < 0) {
		lat.push("n" + Math.floor(Math.abs(arr[1])));
	} else {
		lat.push(Math.floor(Math.abs(arr[1]))+"");
	};

	if (Math.abs(Math.round(arr[0]) - arr[0]) < 0.1) {
		if (Math.round(Math.abs(arr[0])) > Math.abs(arr[0])) {
			if (arr[0] > 0) {
				lat.push(Math.floor(Math.abs(arr[0]+1))+"");
                lon.push(lon[0]);
			} else {
				lat.push("n" + Math.floor(Math.abs(arr[0])+1));
                lon.push(lon[0]);
			};
		} else {
            if (arr[0] > 0) {
                lat.push(Math.floor(Math.abs(arr[0]-1))+"");
                lon.push(lon[0]);
            } else {
                lat.push("n" + Math.floor(Math.abs(arr[0])-1));
                lon.push(lon[0]);
            };
        }
	};

    if (Math.abs(Math.round(arr[1]) - arr[1]) < 0.1) {
        if (Math.round(Math.abs(arr[1])) > Math.abs(arr[1])) {
            if (arr[1] > 0) {
                lon.push(Math.floor(Math.abs(arr[1]+1))+"");
                lat.push(lat[0]);
            } else {
                lon.push("n" + Math.floor(Math.abs(arr[1])+1));
                lat.push(lat[0]);
            };
        } else {
            if (arr[1] > 0) {
                lon.push(Math.floor(Math.abs(arr[1]-1))+"");
                lat.push(lat[0]);
            } else {
                lon.push("n" + Math.floor(Math.abs(arr[1])-1));
                lat.push(lat[0]);
            };
        }
    };

    if (lat.length == 3 && lon.length == 3) {
        // We have a corner!
        // It should be much much easier to write the code this way... I hope
        lat.push(lat[1]);
        lon.push(lon[2]);
        // Boom. Much easier.
    };

    // Here is where the real query-making code starts. Oh boy.
    
    for (var i = 0; i < lat.length; i++) {
        solution = solution + "IF (EXISTS (SELECT " + "zone_"+ lat[i] + "_" + lon[i] + " FROM information_schema.tables)) then SET @s=concat(@s, ' UNION ALL SELECT * FROM " + "zone_"+ lat[i] + "_" + lon[i] + "'); END IF;";
    };

    solution = solution + "PREPARE stm FROM @s; EXECUTE stm;";
}

function getZoneQuery(arr) {
    var lat = "";
    var lon = "";
    var solution = "SELECT * FROM worldwide UNION ALL SELECT * FROM zone_";
    var additionalzones = "";

    var lonpositive = false;
    var latpositive = false;
    var closetolat = false;
    var latclosetof = false;
    var closetolon = false;
    var lonclosetof = false;

    if (arr[0] >= 0) {
        latpositive = true;
        lat = Math.floor(arr[0]).toString();
        console.log("Lat is positive");
    } else {
        lat = "n" + Math.abs(Math.ceil(arr[0]));
        console.log("Lat is negative");
    };
    if (arr[1] >= 0) {
        lonpositive = true;
        lon = Math.floor(arr[1]).toString();
        console.log("Lon is positive");
    } else {
        lon = "n" + Math.abs(Math.ceil(arr[1]));
        console.log("Lon is negative");
    };

    if (latpositive) {
        if (Math.abs(Math.round(arr[0]) - arr[0]) < 0.1) {
            closetolat = true;
            if (Math.round(arr[0]) == Math.floor(arr[0])) {
                latclosetof = true;
            };
            additionalzones = additionalzones + " UNION ALL SELECT * FROM zone_" + Math.round(arr[0]) + "_" + lon;
        };
    } else {
        if (Math.abs(Math.round(arr[0]) - arr[0]) < 0.1) {
            closetolat = true;
            if (Math.round(arr[0]) == Math.ceil(arr[0])) {};
            additionalzones = additionalzones + " UNION ALL SELECT * FROM zone_n" + Math.abs(Math.round(arr[0])) + "_" + lon;
        };
    };

    if (lonpositive) {
        if (Math.abs(Math.round(arr[1]) - arr[1]) < 0.1) {
            closetolat = true;
            if (Math.round(arr[1]) == Math.floor(arr[1])) {
                lonclosetof = true;
            };
            additionalzones = additionalzones + " UNION ALL SELECT * FROM zone_" + lat + "_" + Math.round(arr[1]);
        };
    } else {
        if (Math.abs(Math.round(arr[1]) - arr[1]) < 0.1) {
            closetolat = true;
            if (Math.round(arr[1]) == Math.ceil(arr[1])) {};
            additionalzones = additionalzones + " UNION ALL SELECT * FROM zone_" + lat + "_n" + Math.abs(Math.round(arr[1]));
        };
    };

    if (closetolat && closetolon) {
        // TODO add code to add the corner zones to the query
    };

    solution = solution + lat + "_" + lon;
    console.log("Original solution: " + solution);
    solution = solution + additionalzones;
    console.log("Changed solution: " + solution);
    return solution;
};
