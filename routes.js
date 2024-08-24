const express = require('express');
const router = express.Router();
const app = express();

// Route to get the last 20 records from the database
app.get('/lastheard', (req, res) => {
  db.all('SELECT * FROM lastheard ORDER BY Timestamp DESC LIMIT 20', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Route to get the 5 most frequent DestinationName
app.get('/top-destinations', (req, res) => {
    db.all(`
      SELECT DestinationName, COUNT(*) AS count 
      FROM lastheard 
      GROUP BY DestinationName 
      ORDER BY count DESC 
      LIMIT 20
    `, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
  
  // Route to get the count of records in the database
  app.get('/record-count', (req, res) => {
    db.get('SELECT COUNT(*) AS count FROM lastheard', (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ count: row.count });
    });
  });

// Route to get the count of records in the database
app.get('/record-count', (req, res) => {
  db.get('SELECT COUNT(*) AS count FROM lastheard', (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: row.count });
  });
});

// Route to get the 20 most frequent SourceCall
app.get('/top-sourcecalls', (req, res) => {
    db.all(`
      SELECT SourceCall, TalkerAlias, COUNT(*) AS count 
      FROM lastheard 
      GROUP BY SourceCall, TalkerAlias 
      ORDER BY count DESC 
      LIMIT 20
    `, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });