var mysql = require('mysql') // Require mysql package
var http = require('http') // Require http package
var express = require('express') // Require express package
var bodyParser = require('body-parser') // Require body-parser package

// Set up mysql pool for creating connections to db
var pool = mysql.createPool({
	host:  "threadsmaindb.cbbxphbgixf1.us-west-2.rds.amazonaws.com",
	database: "ThreadsDB",
	user: "sumBits",
	password: "dbpassword",
	connectionLimit: 10 
});

var app = express();
app.use(bodyParser.json()); // Add support for JSON-encoded bodies
app.use(bodyParser.urlencoded({
	extended: true
})); // Add support for URL-encoded bodies

function getZipcode(arr){
	return "80126";
}

// Main post checking function
app.post('/', function(req, res) {
	console.log("Recieved post");
	if (req.get('Object-Type') == "location") {
		console.log("Object type is location");
		res.status(200);
		var zip = getZipcode([req.body.latitude,req.body.longitude]);
		console.log(req.body.latitude);
		console.log(req.body.longitude);
		pool.getConnection(function(err, connection) {
			connection.query("SELECT * FROM zip_00000 UNION ALL SELECT * FROM zip_" + zip, function(err, rows) {
				console.log(rows);
				res.send(rows);
				connection.release();
			});
		});
		res.end();
	};
	if (req.get('Object-Type') == "nearbypostattempt"){
		// Authenticate user
		var zip = getZipcode([req.body.latitude,req.body.longitude]);
		pool.getConnection(function(err, connection) {
			connection.query("INSERT INTO zip_" + zip + "(title,owner,category,timestamp,latitude,longitude,content) VALUES (" + req.body.post.title + ", " + req.body.user.name + ", " + req.body.post.category + ", Now(), " + req.body.post.latitude + ", " + req.body.post.longitude + ", " + req.body.post.content, function(err, rows) {
					connection.release();
				});
		});
	};
});

app.listen(8080);
