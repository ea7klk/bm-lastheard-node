const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('data/lastheard.db');

// Route to get the last 20 records from the database
router.get('/lastheard', (req, res) => {
  db.all('SELECT * FROM lastheard ORDER BY Timestamp DESC LIMIT 20', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Route to get the 20 most frequent DestinationName
router.get('/top-destinations', (req, res) => {
  db.all(`
    SELECT DestinationName, DestinationID, COUNT(*) AS count 
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
router.get('/record-count', (req, res) => {
  db.get('SELECT COUNT(*) AS count FROM lastheard', (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: row.count });
  });
});

// Route to get the 20 most frequent SourceCall
router.get('/top-sourcecalls', (req, res) => {
  db.all(`
    SELECT SourceCall, TalkerAlias, COUNT(*) AS count 
    FROM lastheard 
    WHERE SourceCall != ''
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

// Route to get the 20 most frequent DestinationID for spanish groups (starts with "21")
router.get('/top-destinations-ea', (req, res) => {
  db.all(`
    SELECT DestinationName, DestinationID, COUNT(*) AS count 
    FROM lastheard 
    WHERE CAST(DestinationID AS TEXT) LIKE '21%' AND
      CAST(DestinationID AS TEXT) NOT LIKE '216%' AND
      CAST(DestinationID AS TEXT) NOT LIKE '219%'
    GROUP BY DestinationName, DestinationID 
    ORDER BY count DESC 
    LIMIT 20
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.get('/top-sourcecallsEA', (req, res) => {
  db.all(`
    SELECT SourceCall, SourceID, TalkerAlias, COUNT(*) AS count 
    FROM lastheard 
    WHERE SourceCall != '' and 
      CAST(SourceID AS TEXT) LIKE '21%' AND
      CAST(SourceID AS TEXT) NOT LIKE '216%' AND
      CAST(SourceID AS TEXT) NOT LIKE '219%'
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

module.exports = router;
