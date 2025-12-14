const { MongoClient } = require('mongodb');

const mongoUrl = 'mongodb+srv://croscrowteam_db_user:mHQIEs8CZ07KHa9H@cluster0.bgucwmf.mongodb.net/';
const client = new MongoClient(mongoUrl);

async function addSampleData() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('vendor_events');
        const events = db.collection('events');

        const sampleEvents = [
            {
                storeCode: 'abc',
                eventName: 'product_view',
                productName: 'T-shirt',
                productImage: 'http://example.com/t-shirt.jpg',
                timestamp: new Date()
            },
            {
                storeCode: 'abc',
                eventName: 'add_to_cart',
                productName: 'Jeans',
                productImage: 'http://example.com/jeans.jpg',
                timestamp: new Date()
            },
            {
                storeCode: 'abc',
                eventName: 'purchase',
                productName: 'Shoes',
                productImage: 'http://example.com/shoes.jpg',
                timestamp: new Date()
            }
        ];

        await events.insertMany(sampleEvents);
        console.log('Sample data inserted');

    } catch (err) {
        console.error('Failed to insert sample data', err);
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

addSampleData();
