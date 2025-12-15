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
    const { storeCode, brandName, eventName, productName, productImage } = req.body;

    if (!storeCode || !eventName) {
        return res.status(400).send('storeCode and eventName are required');
    }

    const db = client.db('vendor_events');
    const events = db.collection('events');

    try {
        await events.insertOne({
            storeCode,
            brandName,
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
    const { storeCode, event, period } = req.query;

    if (!storeCode) {
        return res.status(400).send('storeCode is required');
    }

    const db = client.db('vendor_events');
    const events = db.collection('events');

    try {
        const query = { storeCode };

        if (event && event !== 'all') {
            query.eventName = event;
        }

        if (period) {
            const now = new Date();
            let startDate;

            if (period === 'last24hours') {
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            } else if (period === 'last7days') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (period === 'last30days') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            if (startDate) {
                query.timestamp = { $gte: startDate };
            }
        }

        const vendorEvents = await events.find(query).sort({ timestamp: -1 }).toArray();
        res.status(200).json(vendorEvents);
    } catch (err) {
        console.error('Failed to fetch events', err);
        res.status(500).send('Failed to fetch events');
    }
});

app.get('/top-viewed-products', async (req, res) => {
    const { storeCode, period } = req.query;

    if (!storeCode) {
        return res.status(400).send('storeCode is required');
    }

    const db = client.db('vendor_events');
    const events = db.collection('events');

    try {
        const query = { storeCode, eventName: 'ViewContent' };

        if (period) {
            const now = new Date();
            let startDate;

            if (period === 'last24hours') {
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            } else if (period === 'last7days') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (period === 'last30days') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            if (startDate) {
                query.timestamp = { $gte: startDate };
            }
        }

        const topProducts = await events.aggregate([
            { $match: query },
            { $group: {
                _id: { productName: "$productName", productImage: "$productImage" },
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: {
                _id: 0,
                productName: "$_id.productName",
                productImage: "$_id.productImage",
                count: 1
            }}
        ]).toArray();

        res.status(200).json(topProducts);
    } catch (err) {
        console.error('Failed to fetch top viewed products', err);
        res.status(500).send('Failed to fetch top viewed products');
    }
});

app.get('/top-added-to-cart-products', async (req, res) => {
    const { storeCode, period } = req.query;

    if (!storeCode) {
        return res.status(400).send('storeCode is required');
    }

    const db = client.db('vendor_events');
    const events = db.collection('events');

    try {
        const query = { storeCode, eventName: 'AddToCart' };

        if (period) {
            const now = new Date();
            let startDate;

            if (period === 'last24hours') {
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            } else if (period === 'last7days') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (period === 'last30days') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            if (startDate) {
                query.timestamp = { $gte: startDate };
            }
        }

        const topProducts = await events.aggregate([
            { $match: query },
            { $group: {
                _id: { productName: "$productName", productImage: "$productImage" },
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: {
                _id: 0,
                productName: "$_id.productName",
                productImage: "$_id.productImage",
                count: 1
            }}
        ]).toArray();

        res.status(200).json(topProducts);
    } catch (err) {
        console.error('Failed to fetch top added to cart products', err);
        res.status(500).send('Failed to fetch top added to cart products');
    }
});

app.get('/event-counts', async (req, res) => {
    const { storeCode, period } = req.query;

    if (!storeCode) {
        return res.status(400).send('storeCode is required');
    }

    const db = client.db('vendor_events');
    const events = db.collection('events');

    try {
        const query = { storeCode };

        if (period) {
            const now = new Date();
            let startDate;

            if (period === 'last24hours') {
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            } else if (period === 'last7days') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (period === 'last30days') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            if (startDate) {
                query.timestamp = { $gte: startDate };
            }
        }

        const eventCounts = await events.aggregate([
            { $match: query },
            { $group: {
                _id: "$eventName",
                count: { $sum: 1 }
            }}
        ]).toArray();

        // Convert array to a more useful object like { page_view: 100, add_to_cart: 20 }
        const counts = eventCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        res.status(200).json(counts);
    } catch (err) {
        console.error('Failed to fetch event counts', err);
        res.status(500).send('Failed to fetch event counts');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
