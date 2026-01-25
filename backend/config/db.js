const mongoose = require('mongoose');

/**
 * Kết nối đến MongoDB
 * Sử dụng mongoose để quản lý database
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📂 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Thoát nếu không kết nối được database
    }
};

module.exports = connectDB;
