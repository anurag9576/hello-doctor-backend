const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('doctorprofiles');

        console.log('Checking indexes for doctorprofiles...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        const doctorIdIndex = indexes.find(idx => idx.name === 'doctorId_1');
        if (doctorIdIndex) {
            console.log('Found problematic index doctorId_1. Dropping it...');
            await collection.dropIndex('doctorId_1');
            console.log('Index doctorId_1 dropped successfully.');
        } else {
            console.log('Index doctorId_1 not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fix();
