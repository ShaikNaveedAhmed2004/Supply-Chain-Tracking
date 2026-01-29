require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const fetch = require('node-fetch'); // Make sure to install: npm install node-fetch

// Connect to Database
connectDB();

const app = express();

// Middleware - Allow ALL CORS
app.use(cors({
    origin: true, // Allow all origins
    credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/batches', require('./routes/batches'));
app.use('/api/consumer', require('./routes/consumer'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Supply Chain API' });
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Supply Chain API'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Self-ping every 30 seconds (only in production)
    if (process.env.NODE_ENV === 'production') {
        const selfPingInterval = setInterval(async () => {
            try {
                const response = await fetch(`https://crypto-project1.onrender.com/health`);
                console.log(`Self-ping successful: ${response.status} - ${new Date().toISOString()}`);
            } catch (error) {
                console.error('Self-ping failed:', error.message);
            }
        }, 30 * 1000); // 30 seconds

        // Cleanup interval on server shutdown
        process.on('SIGINT', () => {
            clearInterval(selfPingInterval);
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            clearInterval(selfPingInterval);
            process.exit(0);
        });
    }
});

module.exports = app;