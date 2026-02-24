const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri || uri.includes('username:password') || uri.includes('cluster.mongodb.net/luxora')) {
        console.error('❌ MONGO_URI is not configured! Update your .env file with a real MongoDB connection string.');
        console.error('   Current value looks like a placeholder. Server will start but API calls requiring DB will fail.');
        return;
    }

    try {
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        console.error('   Server will continue running but DB operations will fail.');
    }
};

module.exports = connectDB;
