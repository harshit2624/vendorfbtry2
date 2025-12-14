const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Force open CORS policy
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

const mongoUrl = 'mongodb+srv://croscrowteam_db_user:mHQIEs8CZ07KHa9H@cluster0.bgucwmf.mongodb.net/';
const client = new MongoClient(mongoUrl);

async function connectToDb() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}

connectToDb();

app.post('/track-event', async (req, res) => {
    const { storeCode, eventName, productName, productImage } = req.body;

    if (!storeCode || !eventName) {
        return res.status(400).send('storeCode and eventName are required');
    }

    const db = client.db('vendor_events');
    const events = db.collection('events');

    try {
        await events.insertOne({
            storeCode,
            eventName,
            productName,
            productImage,
            timestamp: new Date()
        });
        res.status(200).send('Event tracked');
    } catch (err) {
        console.error('Failed to insert event', err);
        res.status(500).send('Failed to track event');
    }
});

app.get('/data', async (req, res) => {
    const { storeCode } = req.query;

    if (!storeCode) {
        return res.status(400).send('storeCode is required');
    }

    const db = client.db('vendor_events');
    const events = db.collection('events');

    try {
        const vendorEvents = await events.find({ storeCode }).sort({ timestamp: -1 }).toArray();
        res.status(200).json(vendorEvents);
    } catch (err) {
        console.error('Failed to fetch events', err);
        res.status(500).send('Failed to fetch events');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
