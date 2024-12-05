const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sitsense'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.post('/data', (req, res) => {
  const { flex_value } = req.body;

  const query = 'INSERT INTO sensor_readings (flex_value) VALUES (?)';
  db.query(query, [flex_value], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error saving data');
    } else {
      res.status(200).send('Data saved successfully');
    }
  });
});

app.post('/add-patient', (req, res) => {
  const { name, age } = req.body;

  if (!name || !age) {
    return res.status(400).send('Name and age are required.');
  }

  const query = 'INSERT INTO patients (name, age) VALUES (?, ?)';
  db.query(query, [name, age], (err, result) => {
    if (err) {
      console.error('Error saving patient data:', err);
      return res.status(500).send('Error saving patient data.');
    }

    res.status(200).send('Patient data saved successfully!');
  });
});

app.get('/data', (req, res) => {
  const query = 'SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 1';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
      res.json(result[0]); 
    }
  });
});

app.get('/history', (req, res) => {
    const query = `
      SELECT p.name, s.timestamp, s.flex_value
      FROM sensor_readings s
      JOIN patients p ON p.id = s.patient_id
      ORDER BY s.timestamp DESC
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
        res.json(result); 
      }
    });
  });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
