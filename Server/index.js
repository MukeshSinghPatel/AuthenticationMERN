const express = require('express');
const cors = require('cors');

const dotenv = require('dotenv');
dotenv.config();

const cookieParser = require('cookie-parser');
const connectDb  = require('./config/database');
const authRoute = require('./routes/authRoutes')
const userRoute = require('./routes/userRoutes')

connectDb();

const allowedOrigins = ['https://authenticationmern-cli.onrender.com']

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin : allowedOrigins, credentials: true}));

// API Endpoints

app.get('/', (req, res)=>{
    res.send(`API Working`);
})

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);


app.listen(port, ()=>{
    console.log(`Server is running on PORT: ${port}`)
});
