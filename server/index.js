const express = require('express');
const cors =require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const User = require('./models/user');
const dns = require('dns');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registration');
const paymentRoutes = require('./routes/payments');
const announcementRoutes = require('./routes/announcements');
const idCardRoutes = require('./routes/idCard');
const errorHandler = require('./middleware/errorHandler');
const sessionStore = require('./utils/sessionStore');

const dotenv = require('dotenv');
dotenv.config();
dns.setServers(["1.1.1.1","8.8.8.8"])


const app = express();
let databaseReady = false;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => {
    res.status(databaseReady ? 200 : 503).json({
        status: databaseReady ? 'ok' : 'degraded',
        database: databaseReady ? 'connected' : 'disconnected',
        redis: sessionStore.getStatus(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

//routesKOKO
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/id-card', idCardRoutes);
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI || process.env.Mongo_URI)
    .then(async ()=>{
    databaseReady = true;
    await User.syncIndexes();
    console.log("MongoDB connected");
}
).catch((err)=>{
    console.log(" mongoDB connection error:",err);
});



const PORT=process.env.PORT || 3000;

const server = app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

const shutdown = async () => {
    server.close(async () => {
        await mongoose.connection.close();
        await sessionStore.close();
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);