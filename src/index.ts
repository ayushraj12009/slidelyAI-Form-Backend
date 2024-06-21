import express, { Request, Response } from 'express'; // Importing Express framework
import bodyParser from 'body-parser'; // Middleware for parsing JSON body
import fs from 'fs'; // File system module for file operations
import path from 'path'; // Module for handling file paths

const app = express(); // Creating Express application
const PORT = 3000; // Port number for server
const dbFilePath = path.join(__dirname, 'db.json'); // Path to the database file

app.use(bodyParser.json()); // Parsing JSON requests

// Function to initialize the database file if it doesn't exist
const initializeDb = () => {
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify({ submissions: [] }, null, 2));
  }
};

// Middleware to initialize db.json
initializeDb();

// Route to check if server is running
app.get('/ping', (req: Request, res: Response) => {
  res.json(true);
});

// Route to handle submission of data
app.post('/submit', (req: Request, res: Response) => {
  // Extracting data from request body
  const { name, email, phone, github_link, stopwatch_time } = req.body;
  const newSubmission = { name, email, phone, github_link, stopwatch_time };

  try {
    // Reading and updating database with new submission
    let db = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    db.submissions.push(newSubmission);
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error('Error handling submission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to read a submission based on index
app.get('/read', (req: Request, res: Response) => {
  // Parsing index from query parameters
  const index = parseInt(req.query.index as string, 10);

  try {
    // Reading database and retrieving submission at specified index
    let db = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    if (index >= 0 && index < db.submissions.length) {
      res.json(db.submissions[index]);
    } else {
      res.status(404).json({ error: 'Submission not found' });
    }
  } catch (err) {
    console.error('Error reading submissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to delete a submission based on index
app.delete('/delete', (req: Request, res: Response) => {
  // Parsing index from query parameters
  const index = parseInt(req.query.index as string, 10);

  try {
    // Reading database and deleting submission at specified index
    let db = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    if (index >= 0 && index < db.submissions.length) {
      db.submissions.splice(index, 1);
      fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Submission not found' });
    }
  } catch (err) {
    console.error('Error deleting submission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to update a submission based on index
app.put('/update/:index', (req: Request, res: Response) => {
  // Parsing index from route parameters
  const index = parseInt(req.params.index, 10);
  // Extracting updated data from request body
  const { name, email, phone, github_link, stopwatch_time } = req.body;
  const updatedSubmission = { name, email, phone, github_link, stopwatch_time };

  try {
    // Reading database and updating submission at specified index
    let db = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    if (index >= 0 && index < db.submissions.length) {
      db.submissions[index] = updatedSubmission;
      fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Submission not found' });
    }
  } catch (err) {
    console.error('Error updating submission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to search for a submission by email
app.get('/search', (req: Request, res: Response) => {
  // Extracting email from query parameters
  const email = req.query.email as string;

  try {
    // Reading database and searching for submission with specified email
    let db = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    const submission = db.submissions.find((submission: { email: string }) => submission.email === email);
    if (submission) {
      res.json(submission);
    } else {
      res.status(404).json({ error: 'Submission not found' });
    }
  } catch (err) {
    console.error('Error searching submission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // Server startup message
});
