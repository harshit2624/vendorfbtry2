const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    callback(null, origin);
  },
  credentials: true,
};

app.use(cors(corsOptions));

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

function getTimeFilter(period) {
    const now = new Date();
    let startDate;
    let endDate = new Date(now);

    switch (period) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'yesterday':
            const yesterdayStart = new Date();
            yesterdayStart.setDate(yesterdayStart.getDate() - 1);
            yesterdayStart.setHours(0, 0, 0, 0);
            startDate = yesterdayStart;

            const yesterdayEnd = new Date();
            yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
            yesterdayEnd.setHours(23, 59, 59, 999);
            endDate = yesterdayEnd;
            break;
        case 'last24hours':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case 'last7days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'last30days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case 'all':
        default:
            // No date filter
            return {};
    }

    if (startDate && endDate) {
        return { timestamp: { $gte: startDate, $lte: endDate } };
    } else if (startDate) {
        return { timestamp: { $gte: startDate } };
    }
    return {};
}

app.post('/track-event', async (req, res) => {
    const { storeCode, brandName, eventName, productName, productImage, value, currency, contents } = req.body;

    if (!storeCode || !eventName) {
        return res.status(400).send('storeCode and eventName are required');
    }

    const db = client.db('vendor_events');
    const events = db.collection('events');

    try {
        const eventData = {
            storeCode,
            brandName,
            eventName,
            timestamp: new Date()
        };

        if (eventName === 'InitiateCheckout' || eventName === 'Purchase') {
            eventData.value = value;
            eventData.currency = currency;
            eventData.contents = contents;
        } else {
            eventData.productName = productName;
            eventData.productImage = productImage;
        }

        await events.insertOne(eventData);
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
            Object.assign(query, getTimeFilter(period));
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
            Object.assign(query, getTimeFilter(period));
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
            Object.assign(query, getTimeFilter(period));
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

app.get('/top-checkout-products', async (req, res) => {
    const { storeCode, period } = req.query;

    if (!storeCode) {
        return res.status(400).send('storeCode is required');
    }

    const db = client.db('vendor_events');
    const events = db.collection('events');

    try {
        const query = { storeCode, eventName: 'InitiateCheckout' };

        if (period) {
            Object.assign(query, getTimeFilter(period));
        }

        const topProducts = await events.aggregate([
            { $match: query },
            { $unwind: "$contents" },
            { $group: {
                _id: { productName: "$contents.productName", productImage: "$contents.productImage" },
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
        console.error('Failed to fetch top checkout products', err);
        res.status(500).send('Failed to fetch top checkout products');
    }
});

app.get('/top-purchased-products', async (req, res) => {
    const { storeCode, period } = req.query;

    if (!storeCode) {
        return res.status(400).send('storeCode is required');
    }

    const db = client.db('vendor_events');
    const events = db.collection('events');

    try {
        const query = { storeCode, eventName: 'Purchase' };

        if (period) {
            Object.assign(query, getTimeFilter(period));
        }

        const topProducts = await events.aggregate([
            { $match: query },
            { $unwind: "$contents" },
            { $group: {
                _id: { productName: "$contents.productName", productImage: "$contents.productImage" },
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
        console.error('Failed to fetch top purchased products', err);
        res.status(500).send('Failed to fetch top purchased products');
    }
});

app.get('/product-performance', async (req, res) => {
    const { storeCode, period } = req.query;

    if (!storeCode) {
        return res.status(400).send('storeCode is required');
    }

    const db = client.db('vendor_events');
    const events = db.collection('events');
    const timeFilter = getTimeFilter(period);

    try {
        const viewsPipeline = [
            { $match: { storeCode, eventName: 'ViewContent', ...timeFilter } },
            { $group: {
                _id: { productName: "$productName", productImage: "$productImage" },
                count: { $sum: 1 }
            }}
        ];

        const atcPipeline = [
            { $match: { storeCode, eventName: 'AddToCart', ...timeFilter } },
            { $group: {
                _id: { productName: "$productName", productImage: "$productImage" },
                count: { $sum: 1 }
            }}
        ];

        const checkoutPipeline = [
            { $match: { storeCode, eventName: 'InitiateCheckout', ...timeFilter } },
            { $unwind: "$contents" },
            { $group: {
                _id: { productName: "$contents.productName", productImage: "$contents.productImage" },
                count: { $sum: 1 }
            }}
        ];

        const purchasePipeline = [
            { $match: { storeCode, eventName: 'Purchase', ...timeFilter } },
            { $unwind: "$contents" },
            { $group: {
                _id: { productName: "$contents.productName", productImage: "$contents.productImage" },
                count: { $sum: 1 }
            }}
        ];

        const [viewCounts, atcCounts, checkoutCounts, purchaseCounts] = await Promise.all([
            events.aggregate(viewsPipeline).toArray(),
            events.aggregate(atcPipeline).toArray(),
            events.aggregate(checkoutPipeline).toArray(),
            events.aggregate(purchasePipeline).toArray()
        ]);

        const productPerformance = {};

        viewCounts.forEach(item => {
            const productName = item._id.productName;
            if (!productName) return;
            productPerformance[productName] = {
                productName,
                productImage: item._id.productImage,
                views: item.count,
                atcs: 0,
                checkouts: 0,
                purchases: 0
            };
        });

        atcCounts.forEach(item => {
            const productName = item._id.productName;
            if (!productName) return;
            if (productPerformance[productName]) {
                productPerformance[productName].atcs = item.count;
            } else {
                productPerformance[productName] = {
                    productName,
                    productImage: item._id.productImage,
                    views: 0,
                    atcs: item.count,
                    checkouts: 0,
                    purchases: 0
                };
            }
        });

        checkoutCounts.forEach(item => {
            const productName = item._id.productName;
            if (!productName) return;
            if (productPerformance[productName]) {
                productPerformance[productName].checkouts = item.count;
            } else {
                productPerformance[productName] = {
                    productName,
                    productImage: item._id.productImage,
                    views: 0,
                    atcs: 0,
                    checkouts: item.count,
                    purchases: 0
                };
            }
        });

        purchaseCounts.forEach(item => {
            const productName = item._id.productName;
            if (!productName) return;
            if (productPerformance[productName]) {
                productPerformance[productName].purchases = item.count;
            } else {
                productPerformance[productName] = {
                    productName,
                    productImage: item._id.productImage,
                    views: 0,
                    atcs: 0,
                    checkouts: 0,
                    purchases: item.count
                };
            }
        });
        
        res.status(200).json(Object.values(productPerformance));
    } catch (err) {
        console.error('Failed to fetch product performance', err);
        res.status(500).send('Failed to fetch product performance');
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
            Object.assign(query, getTimeFilter(period));
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
