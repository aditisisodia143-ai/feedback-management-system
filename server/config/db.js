// config/db.js
// Connects our app to MongoDB Atlas using the MONGO_URI from .env

const dns = require('dns');
const mongoose = require('mongoose');

// Some Windows/ISP DNS servers can't resolve the SRV records that
// "mongodb+srv://" addresses need (error: querySrv ECONNREFUSED).
// Using Google + Cloudflare DNS for these lookups fixes it.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); // stop the server if the DB can't connect
  }
};

module.exports = connectDB;
