const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');

const db = new sqlite3.Database('data/lastheard.db');

// Add a function to allow selecting countries
function getCountry(country) {
  switch (country) {
    case 'EA':
      return `
        CAST(DestinationID AS TEXT) LIKE '214%' 
      `;
    case 'DE':
      return `
        (CAST(DestinationID AS TEXT) LIKE '262%' OR  CAST(DestinationID AS TEXT) LIKE '263%' OR CAST(DestinationID AS TEXT) LIKE '264%')
      `;
    case 'All':
      return `
        CAST(DestinationID AS TEXT) LIKE '%' 
      `;
    default:
      return `
        CAST(DestinationID AS TEXT) LIKE '%' 
      `;
  }
}

// Adding function to permit querying by some time ranges: 
function getTimeRange(range) {
  const now = moment();
  switch (range) {
    case 'last-minute':
      return [
        moment().subtract(1, 'minutes').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'last-5-minutes':
      return [
        moment().subtract(5, 'minutes').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'last-15-minutes':
      return [
        moment().subtract(15, 'minutes').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'last-30-minutes':
      return [
        moment().subtract(30, 'minutes').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'last-hour':
      return [
        moment().subtract(1, 'hours').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
        now.toISOString().replace(/T/, ' ').replace(/\..+/, '')
      ];
    case 'last-6-hours':
      return [
        moment().subtract(6, 'hours').toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
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

// Route to get the count of records in the database filtered by time range
router.get('/record-count-range', (req, res) => {
  const { range } = req.query;
  const [start, end] = getTimeRange(range);
  // console.log(range, start, end);
  let query = `
    SELECT COUNT(*) AS count FROM lastheard
      `;
  const params = [];
  if (start && end) {
    // params.push(start, end);
    query += `WHERE datetime(Timestamp) > DATETIME('${start}') 
      AND datetime(Timestamp) < DATETIME('${end}')
    `;
  }
  // console.log(query);
  db.get(query, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: row.count });
  });
});

// Route to get the count of records in the database filtered by time range and only EA
router.get('/record-count-range-ea', (req, res) => {
  const { range } = req.query;
  const [start, end] = getTimeRange(range);
  // console.log(range, start, end);
  let query = `
    SELECT COUNT(*) AS count FROM lastheard
    WHERE CAST(DestinationID AS TEXT) LIKE '214%' 
      `;
  const params = [];
  if (start && end) {
    // params.push(start, end);
    query += `AND datetime(Timestamp) > DATETIME('${start}') 
      AND datetime(Timestamp) < DATETIME('${end}')
    `;
  }
  // console.log(query);
  db.get(query, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: row.count });
  });
});

// Route to get the count of records in the database filtered by time range and country
router.get('/record-count-range-country', (req, res) => {
  const { range, country } = req.query;
  const [start, end] = getTimeRange(range);
  // console.log(range, country, start, end);
  
  let query = `
    SELECT COUNT(*) AS count FROM lastheard
    WHERE ${getCountry(country)}
  `;
  const params = [];
  
  if (start && end) {
    query += `AND datetime(Timestamp) > DATETIME('${start}') 
              AND datetime(Timestamp) < DATETIME('${end}')
    `;
  }
  
  // console.log(query);
  db.get(query, (err, row) => {
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
    WHERE CAST(DestinationID AS TEXT) LIKE '214%' 
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

// Route to get the 20 most frequent DestinationID filtered by time range and country
router.get('/top-destination-range-country', (req, res) => {
  const { range, country } = req.query;
  const [start, end] = getTimeRange(range);
  // console.log(range, country, start, end);
  
  let query = `
    SELECT DestinationName, DestinationID, COUNT(*) AS count, sum(Duration) as totalDuration 
    FROM lastheard 
    WHERE SourceCall != ''
      AND ${getCountry(country)}
  `;
  const params = [];
  
  if (start && end) {
    query += `AND datetime(Timestamp) > DATETIME('${start}') 
              AND datetime(Timestamp) < DATETIME('${end}')
    `;
  }

  query += `GROUP BY DestinationName 
            ORDER BY count DESC 
            LIMIT 20`;
  // console.log(query);
  db.all(query, params, (err, rows) => {
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
      CAST(SourceID AS TEXT) LIKE '214%' 
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
  // console.log(range, start, end);
  let query = `
    SELECT SourceCall, SourceID, TalkerAlias, COUNT(*) AS count
    FROM lastheard 
    WHERE SourceCall != ''
      AND CAST(SourceID AS TEXT) LIKE '214%'
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
  // console.log(query);
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});
  
module.exports = router;
