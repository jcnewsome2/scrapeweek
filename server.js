
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;
// Initialize Express
var app = express();
// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
extended: false
}));
// Make public a static dir
app.use(express.static("public"));
// Database configuration with mongoose
mongoose.connect("----///----");
var db = mongoose.connection;
// Show any mongoose errors
db.on("error", function(error) {
console.log("Mongoose Error: ", error);
});

db.once("open", function() {
console.log("Mongoose connection successful.");
});
// Routes

// ======

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
// First, we grab the body of the html with request
request("http://www.espn.com/college-football/team/_/id/2567/smu-mustangs", function(error, response, html) {
// Then, we load that into cheerio and save it to $ for a shorthand selector
var $ = cheerio.load(html);
// Now, we grab every h5 within an article tag, and do the following:
$("article h1").each(function(i, element) {
// Save an empty result object
var result = {};

result.title = $(this).children("a").text();
result.link = $(this).children("a").attr("href");

console.log(entry);
// Now, save that entry to the db
entry.save(function(err, doc) {
// Log any errors
if (err) {
console.log(err);
}
// Or log the doc
else {
console.log(doc);
}
});
});
});
// Tell the browser that we finished scraping the text
res.send("Scrape Complete");
});
// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
// Grab every doc in the Articles array
Article.find({}, function(error, doc) {
// Log any errors
if (error) {
console.log(error);
}
// Or send the doc to the browser as a json object
else {
res.json(doc);
}
});
});
// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
Article.findOne({ "_id": req.params.id })
.populate("note")
.exec(function(error, doc) {
if (error) {
console.log(error);
}
else {
res.json(doc);
}
});
});
app.post("/articles/:id", function(req, res) {
var newNote = new Note(req.body);
newNote.save(function(error, doc) {
if (error) {
console.log(error);
}
// Otherwise
else {
Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
.exec(function(err, doc) {
if (err) {
console.log(err);
}
else {
res.send(doc);
}
});
}
});
});
// Listen on port 3000
app.listen(process.env.PORT || 3000, function() {
console.log("App runnin on port 3000!  Smile for Now");
});