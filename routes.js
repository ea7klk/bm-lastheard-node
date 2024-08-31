const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const moment = require('moment');

let db;

(async () => {
  db = await open({
    filename: 'data/lastheard.db',
    driver: sqlite3.Database
  });
})();

function getCountry(country) {
  switch (country) {
    case 'AT': return `CAST(DestinationID AS TEXT) LIKE '232%'`;
    case 'BE': return `CAST(DestinationID AS TEXT) LIKE '206%'`;
    case 'BG': return `CAST(DestinationID AS TEXT) LIKE '284%'`;
    case 'CH': return `CAST(DestinationID AS TEXT) LIKE '228%'`;
    case 'CY': return `CAST(DestinationID AS TEXT) LIKE '280%'`;
    case 'CZ': return `CAST(DestinationID AS TEXT) LIKE '255%'`;
    case 'DE': return `(CAST(DestinationID AS TEXT) LIKE '262%' OR CAST(DestinationID AS TEXT) LIKE '263%' OR CAST(DestinationID AS TEXT) LIKE '264%')`;
    case 'DK': return `CAST(DestinationID AS TEXT) LIKE '238%'`;
    case 'EE': return `CAST(DestinationID AS TEXT) LIKE '248%'`;
    case 'ES': return `CAST(DestinationID AS TEXT) LIKE '214%'`;
    case 'FI': return `CAST(DestinationID AS TEXT) LIKE '244%'`;
    case 'FR': return `CAST(DestinationID AS TEXT) LIKE '208%'`;
    case 'GB': return `CAST(DestinationID AS TEXT) LIKE '235%'`;
    case 'GR': return `CAST(DestinationID AS TEXT) LIKE '202%'`;
    case 'HR': return `CAST(DestinationID AS TEXT) LIKE '219%'`;
    case 'HU': return `CAST(DestinationID AS TEXT) LIKE '239%'`;
    case 'IE': return `CAST(DestinationID AS TEXT) LIKE '272%'`;
    case 'IT': return `CAST(DestinationID AS TEXT) LIKE '222%'`;
    case 'LT': return `CAST(DestinationID AS TEXT) LIKE '246%'`;
    case 'LU': return `CAST(DestinationID AS TEXT) LIKE '270%'`;
    case 'LV': return `CAST(DestinationID AS TEXT) LIKE '247%'`;
    case 'MT': return `CAST(DestinationID AS TEXT) LIKE '278%'`;
    case 'NL': return `CAST(DestinationID AS TEXT) LIKE '204%'`;
    case 'PL': return `CAST(DestinationID AS TEXT) LIKE '260%'`;
    case 'PT': return `CAST(DestinationID AS TEXT) LIKE '268%'`;
    case 'RO': return `CAST(DestinationID AS TEXT) LIKE '226%'`;
    case 'SE': return `CAST(DestinationID AS TEXT) LIKE '240%'`;
    case 'SI': return `CAST(DestinationID AS TEXT) LIKE '293%'`;
    case 'SK': return `CAST(DestinationID AS TEXT) LIKE '231%'`;
    case 'UK': return `CAST(DestinationID AS TEXT) LIKE '235%'`;
    case 'All': return `CAST(DestinationID AS TEXT) LIKE '%'`;
    default: return `CAST(DestinationID AS TEXT) LIKE '%'`;
  }
}

function getTimeRange(range) {
  const now = moment();
  switch (range) {
    case 'last-minute': return [moment().subtract(1, 'minutes').toISOString().replace(/T/, ' ').replace(/\..+/, ''), now.toISOString().replace(/T/, ' ').replace(/\..+/, '')];
    case 'last-5-minutes': return [moment().subtract(5, 'minutes').toISOString().replace(/T/, ' ').replace(/\..+/, ''), now.toISOString().replace(/T/, ' ').replace(/\..+/, '')];
    case 'last-15-minutes': return [moment().subtract(15, 'minutes').toISOString().replace(/T/, ' ').replace(/\..+/, ''), now.toISOString().replace(/T/, ' ').replace(/\..+/, '')];
    case 'last-30-minutes': return [moment().subtract(30, 'minutes').toISOString().replace(/T/, ' ').replace(/\..+/, ''), now.toISOString().replace(/T/, ' ').replace(/\..+/, '')];
    case 'last-hour': return [moment().subtract(1, 'hours').toISOString().replace(/T/, ' ').replace(/\..+/, ''), now.toISOString().replace(/T/, ' ').replace(/\..+/, '')];
    case 'last-6-hours': return [moment().subtract(6, 'hours').toISOString().replace(/T/, ' ').replace(/\..+/, ''), now.toISOString().replace(/T/, ' ').replace(/\..+/, '')];
    case 'last-12-hours': return [moment().subtract(12, 'hours').toISOString().replace(/T/, ' ').replace(/\..+/, ''), now.toISOString().replace(/T/, ' ').replace(/\..+/, '')];
    case 'today': return [moment().startOf('day').toISOString().replace(/T/, ' ').replace(/\..+/, ''), now.toISOString().replace(/T/, ' ').replace(/\..+/, '')];
    case 'last-24-hours': return [moment().subtract(24, 'hours').toISOString().replace(/T/, ' ').replace(/\..+/, ''), now.toISOString().replace(/T/, ' ').replace(/\..+/, '')];
    case 'last-2-days': return [moment().subtract(48, 'hours').toISOString().replace(/T/, ' ').replace(/\..+/, ''), now.toISOString().replace(/T/, ' ').replace(/\..+/, '')];
    case 'all': return [null, null];
    default: return [null, null];
  }
}

router.get('/lastheard', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM lastheard ORDER BY Timestamp DESC LIMIT 20');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/record-count', async (req, res) => {
  try {
    const row = await db.get('SELECT COUNT(*) AS count FROM lastheard');
    res.json({ count: row.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/record-oldest', async (req, res) => {
  try {
    const row = await db.get('SELECT MIN(DATETIME(Timestamp)) AS oldest from lastheard');
    res.json({ oldest: row.oldest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/record-newest', async (req, res) => {
  try {
    const row = await db.get('SELECT MAX(DATETIME(Timestamp)) AS newest from lastheard');
    res.json({ newest: row.newest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/record-count-range-country', async (req, res) => {
  const { range, country } = req.query;
  const [start, end] = getTimeRange(range);
  let query = `SELECT COUNT(*) AS count FROM lastheard WHERE ${getCountry(country)}`;
  if (start && end) {
    query += ` AND datetime(Timestamp) > DATETIME('${start}') AND datetime(Timestamp) < DATETIME('${end}')`;
  }
  try {
    const row = await db.get(query);
    res.json({ count: row.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/top-destination-range-country', async (req, res) => {
  const { range, country } = req.query;
  const [start, end] = getTimeRange(range);
  let query = `
    SELECT DestinationName, DestinationID, COUNT(*) AS count, sum(Duration) as totalDuration 
    FROM lastheard 
    WHERE SourceCall != '' AND ${getCountry(country)}
  `;
  if (start && end) {
    query += ` AND datetime(Timestamp) > DATETIME('${start}') AND datetime(Timestamp) < DATETIME('${end}')`;
  }
  query += ` GROUP BY DestinationName ORDER BY count DESC LIMIT 20`;
  try {
    const rows = await db.all(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/top-call-range-country', async (req, res) => {
  const { range, country } = req.query;
  const [start, end] = getTimeRange(range);
  let query = `
    SELECT SourceID, SourceCall, SourceName, COUNT(*) AS count, sum(Duration) as totalDuration 
    FROM lastheard 
    WHERE SourceCall != '' AND ${getCountry(country)}
  `;
  if (start && end) {
    query += ` AND datetime(Timestamp) > DATETIME('${start}') AND datetime(Timestamp) < DATETIME('${end}')`;
  }
  query += ` GROUP BY SourceID ORDER BY count DESC LIMIT 25`;
  try {
    const rows = await db.all(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
