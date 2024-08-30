const express = require('express');
const app = express();
const port = 3000;
const routes = require('./routes.js'); // Import the routes

// Serve static files from the "public" directory
app.use(express.static('public'));

// use the routes defined in routes.js
app.use('/', routes);

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});

const io = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();

// Step 2: Connect to the Socket.IO server with the specified path
const socket = io('https://api.brandmeister.network', {
  path: '/lh/socket.io'
});

// Step 3: Open a SQLite database
const db = new sqlite3.Database('data/lastheard.db');

// Step 4: Create a table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS lhhistory (
    ID INTEGER PRIMARY KEY ,
    Timestamp DATETIME , LinkName TEXT, Slot REAL, SourceID REAL, 
    DestinationID REAL, Route TEXT, LinkCall TEXT, SessionType REAL, 
    SourceName TEXT, DestinationCall TEXT, DestinationName TEXT, 
    State REAL, Start REAL, Stop REAL, RSSI TEXT, BER REAL, 
    ReflectorID REAL, LinkType REAL, CallTypes TEXT, 
    LossCount REAL, TotalCount REAL, Master REAL, 
    TalkerAlias TEXT, FlagSet REAL, Event TEXT, LinkTypeName TEXT, 
    ContextID REAL, SessionID TEXT, SourceCall TEXT, Duration REAL);`
  );  
});

// Insert counter
let insertCounter = 0;

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

  // Check if lastheard.Duration is < 5 (Avoid kerchunks)
  if (lastheard.Duration < 5) {
    return; 
  }

  // Skip if lastheard.DestinationName is empty
  if (!lastheard.DestinationName) {
    return;
  }

  // Skip if lastheard.SourceCall is empty)
  if (!lastheard.SourceCall) {
    return;
  }

  // Skip if lastheard.DestinationCall is not empty
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

      // Increment the insert counter
      insertCounter++;

      if (insertCounter >= 2000) {
        const query =`BEGIN TRANSACTION;
        INSERT INTO lhhistory
        SELECT *
        FROM lastheard
        WHERE timestamp < datetime('now', '-24 hours');
        DELETE FROM lastheard
        WHERE timestamp < datetime('now', '-24 hours');
        COMMIT;`;
        db.exec(query, (err) => {  
          if (err) {
            console.error('Error running housekeeping:', err.message);
          } else {
            console.log('Housekeeping completed successfully.');
            db.run('VACUUM; ANALYZE;', (err) => {
              if (err) {
                  console.error('Error running VACUUM:', err.message);
              } else {
                  console.log('VACUUM and ANALYZE completed successfully.');
                  insertCounter = 0; // Reset the counter after successful housekeeping
              }
          });
        }
       });
      }
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
