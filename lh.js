// Step 1: Install dependencies
// Run `npm install socket.io-client sqlite3 express` in your terminal

const express = require('express');
const app = express();
const port = 3000;
const routes = require('./routes'); // Import the routes

// Serve static files from the "public" directory
app.use(express.static('public'));

// Route to get the last 20 records from the database
app.get('/lastheard', (req, res) => {
  db.all('SELECT * FROM lastheard ORDER BY Timestamp DESC LIMIT 20', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Route to get the 20 most frequent DestinationName
app.get('/top-destinations', (req, res) => {
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
  
// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const io = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();

// Step 2: Connect to the Socket.IO server with the specified path
const socket = io('https://api.brandmeister.network', {
  path: '/lh/socket.io'
});

// Step 3: Open a SQLite database
const db = new sqlite3.Database('lastheard.db');

// Step 4: Create a table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS lastheard (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Step 5: Listen for "mqtt" events
socket.on('mqtt', (data) => {
  // Step 6: Extract the payload
  const lastheardString = data.payload;

  // Step 7: Convert the payload to a JSON object
  let lastheard;
  try {
    lastheard = JSON.parse(lastheardString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return;
  }

  // Step 8: Check if lastheard.stop is 0
  if (lastheard.Stop === 0) {
    return; // Do not print if stop is 0
  }

  // Calculate duration
  const duration = lastheard.Stop - lastheard.Start;
  lastheard["Duration"] = duration;

  // Check if lastheard.Duration is < 5
  if (lastheard.Duration < 5) {
    return; // Do not print if Duration is < 5
  }

  // Skip if lastheard.DestinationName is empty
  if (!lastheard.DestinationName) {
    return;
  }

  // Skip if lastheard.DestinationCall is empty
  if (lastheard.DestinationCall) {
    return;
  }

  // Skip if lastheard.DestinationID is 9 (Local)
  if ((lastheard.DestinationID === 9)) {
    return;
  }

  // Skip if lastheard.DestinationID is 8 (Regional)
  if ((lastheard.DestinationID === 8)) {
    return;
  }

  // Step 9: Output the keys and values in the format Key......value
  for (const key in lastheard) {
    if (lastheard.hasOwnProperty(key)) {
      // console.log(`${key}......${lastheard[key]}`);
    }
  }
  // console.log('----------------');

  // Step 10: Add columns dynamically
  db.serialize(() => {
    for (const key in lastheard) {
      if (lastheard.hasOwnProperty(key)) {
        const type = typeof lastheard[key] === 'number' ? 'REAL' : 'TEXT';
        addColumnIfNotExists(db, 'lastheard', key, type);
        // db.run(`ALTER TABLE lastheard ADD COLUMN ${key} ${type}`);
      }
    }

    // Step 11: Insert the values into the table
    const columns = Object.keys(lastheard).join(', ');
    const placeholders = Object.keys(lastheard).map(() => '?').join(', ');
    const values = Object.values(lastheard);

    db.run(`INSERT INTO lastheard (${columns}) VALUES (${placeholders})`, values, function(err) {
      if (err) {
        return console.error('Error inserting data:', err.message);
      }
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
  });
});

// Handle connection errors
socket.on('connect_error', (err) => {
  console.error('Connection Error:', err);
});

// Function to add a column if it doesn't exist
function addColumnIfNotExists(db, tableName, columnName, columnType) {
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) {
        console.error('Error fetching table info:', err.message);
        return;
      }
  
      const columnExists = columns.some(column => column.name === columnName);
      if (!columnExists) {
        db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`, (err) => {
          if (err) {
            console.error(`Error adding column ${columnName}:`, err.message);
          } else {
            console.log(`Column ${columnName} added successfully.`);
          }
        });
      } else {
        // console.log(`Column ${columnName} already exists.`);
      }
    });
  }