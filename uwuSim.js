var util = require("util");
var libMarkov = require("markov");
var sqlite3 = require("sqlite3").verbose();
var twitter = require("twitter");
var fs = require("fs");
var client = new Twitter(JSON.parse(fs.readFileSync("twitter.json", "utf8")));
var db = new sqlite3.Database("timeline.db")
db.serialize(function() {
   function createTweet() {
   	var markov = libMarkov(5);
   	var buildString = "";
   	db.all("SELECT content FROM tweets ORDER BY id DESC LIMIT 1000", function(err, rows) {
   	    rows.forEach(function(row) {
   	    	buildString += row.content + "\n";
   	    })
   	    markov.seed(buildString, function() {
   	    	client.post('statuses/update', {status: markov.forward(markov.pick(), 4).join(" ").replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&").substring(0, 140)}, function(error, tweet, response) {
   	    		if (error) throw error;
   	    	});
   	    })
   	});
   }
   client.stream("statuses/filter", {track: "@uwuSim"}, function(stream) {
   	stream.on("data", function(tweet) {
   		console.log(tweet);
   		var answer = markov.respond(tweet.text.replace("@uwuSim", ""), 4).replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&").substring(0, 140);
   	})
   })
});
db.close();