const express = require('express');
const cors =require('cors');
const mongoose = require('mongoose');
const dns = require('dns');
const authRoutes = require('./routes/auth');

const dotenv = require('dotenv');
dotenv.config();
dns.setServers(["1.1.1.1","8.8.8.8"])


const app = express();

app.use(cors());
app.use(express.json());

//routesKOKO
app.use('/api/auth',authRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
    console.log("MongoDB connected");
}
).catch((err)=>{
    console.log(" mongoDB connection error:",err);
});



const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})