const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');

const db = new sqlite3.Database('data/lastheard.db');

// Adding function to permit querying by some time ranges in the future: 
function getTimeRange(range) {
  const now = moment();
  switch (range) {
    case 'last-hour':
      return [
        moment().subtract(1, 'hours').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'last-12-hours':
      return [
        moment().subtract(12, 'hours').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'today':
      return [
        moment().startOf('day').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'last-24-hours':
      return [
        moment().subtract(24, 'hours').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'this-week':
      return [
        moment().startOf('week').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'last-7-days':
      return [
        moment().subtract(7, 'days').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'this-month':
      return [
        moment().startOf('month').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'last-month':
      return [
        moment().subtract(1, 'months').startOf('month').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.subtract(1, 'months').endOf('month').toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'all':
      return [null, null];
    default:
      return [null, null];
  }
}

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

// Route to get the 20 most frequent SourceCall EA (Spain)
router.get('/top-sourcecallsEA', (req, res) => {
  db.all(`
    SELECT SourceCall, TalkerAlias, COUNT(*) AS count 
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

// Route to get the 20 most frequent SourceID filtered by time range for spanish groups (starts with "21")

router.get('/top-sourcecalls-rangeEA', (req, res) => {
  const { range } = req.query;
  const [start, end] = getTimeRange(range);
  console.log(range, start, end);
  let query = `
    SELECT SourceCall, SourceID, TalkerAlias, COUNT(*) AS count
    FROM lastheard 
    WHERE SourceCall != ''
      AND CAST(SourceID AS TEXT) LIKE '21%'
      AND CAST(SourceID AS TEXT) NOT LIKE '216%' 
      AND CAST(SourceID AS TEXT) NOT LIKE '219%'
      `;
  const params = [];
  
  if (start && end) {
    // params.push(start, end);
    query += `AND datetime(Timestamp) > DATETIME('${start}') 
      AND datetime(Timestamp) < DATETIME('${end}')
    `;
  }

  query += `GROUP BY SourceCall, TalkerAlias 
    ORDER BY count DESC 
    LIMIT 20`;
  console.log(query);
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});
  

module.exports = router;
