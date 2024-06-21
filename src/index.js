"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express"); // Importing Express framework
var body_parser_1 = require("body-parser"); // Middleware for parsing JSON body
var fs_1 = require("fs"); // File system module for file operations
var path_1 = require("path"); // Module for handling file paths
var app = (0, express_1.default)(); // Creating Express application
var PORT = 3000; // Port number for server
var dbFilePath = path_1.default.join(__dirname, 'db.json'); // Path to the database file

app.use(body_parser_1.default.json()); // Parsing JSON requests

// Function to initialize the database file if it doesn't exist
var initializeDb = function () {
    if (!fs_1.default.existsSync(dbFilePath)) {
        fs_1.default.writeFileSync(dbFilePath, JSON.stringify({ submissions: [] }, null, 2));
    }
};
initializeDb();

// Route to check if server is running
app.get('/ping', function (req, res) {
    res.json(true);
});

// Route to handle submission of data
app.post('/submit', function (req, res) {
    // Extracting data from request body
    var _a = req.body, name = _a.name, email = _a.email, phone = _a.phone, github_link = _a.github_link, stopwatch_time = _a.stopwatch_time;
    var newSubmission = { name: name, email: email, phone: phone, github_link: github_link, stopwatch_time: stopwatch_time };
    try {
        // Reading and updating database with new submission
        var db = JSON.parse(fs_1.default.readFileSync(dbFilePath, 'utf8'));
        db.submissions.push(newSubmission);
        fs_1.default.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
        res.json({ success: true });
    }
    catch (err) {
        console.error('Error handling submission:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to read a submission based on index
app.get('/read', function (req, res) {
    // Parsing index from query parameters
    var index = parseInt(req.query.index, 10);
    try {
        // Reading database and retrieving submission at specified index
        var db = JSON.parse(fs_1.default.readFileSync(dbFilePath, 'utf8'));
        if (index >= 0 && index < db.submissions.length) {
            res.json(db.submissions[index]);
        }
        else {
            res.status(404).json({ error: 'Submission not found' });
        }
    }
    catch (err) {
        console.error('Error reading submissions:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to delete a submission based on index
app.delete('/delete', function (req, res) {
    // Parsing index from query parameters
    var index = parseInt(req.query.index, 10);
    try {
        // Reading database and deleting submission at specified index
        var db = JSON.parse(fs_1.default.readFileSync(dbFilePath, 'utf8'));
        if (index >= 0 && index < db.submissions.length) {
            db.submissions.splice(index, 1);
            fs_1.default.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
            res.json({ success: true });
        }
        else {
            res.status(404).json({ error: 'Submission not found' });
        }
    }
    catch (err) {
        console.error('Error deleting submission:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update a submission based on index
app.put('/update/:index', function (req, res) {
    // Parsing index from route parameters
    var index = parseInt(req.params.index, 10);
    // Extracting updated data from request body
    var _a = req.body, name = _a.name, email = _a.email, phone = _a.phone, github_link = _a.github_link, stopwatch_time = _a.stopwatch_time;
    var updatedSubmission = { name: name, email: email, phone: phone, github_link: github_link, stopwatch_time: stopwatch_time };
    try {
        // Reading database and updating submission at specified index
        var db = JSON.parse(fs_1.default.readFileSync(dbFilePath, 'utf8'));
        if (index >= 0 && index < db.submissions.length) {
            db.submissions[index] = updatedSubmission;
            fs_1.default.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
            res.json({ success: true });
        }
        else {
            res.status(404).json({ error: 'Submission not found' });
        }
    }
    catch (err) {
        console.error('Error updating submission:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to search for a submission by email
app.get('/search', function (req, res) {
    // Extracting email from query parameters
    var email = req.query.email;
    try {
        // Reading database and searching for submission with specified email
        var db = JSON.parse(fs_1.default.readFileSync(dbFilePath, 'utf8'));
        var submission = db.submissions.find(function (submission) { return submission.email === email; });
        if (submission) {
            res.json(submission);
        }
        else {
            res.status(404).json({ error: 'Submission not found' });
        }
    }
    catch (err) {
        console.error('Error searching submission:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Starting the server
app.listen(PORT, function () {
    console.log("Server is running on http://localhost:".concat(PORT)); // Server startup message
});
