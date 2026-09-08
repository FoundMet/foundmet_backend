import dotenv from 'dotenv';
dotenv.config({
    path:'.env'
});

import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectionDb from './config/db.config.js';
import authRouter from './routes/auth.routes.js';
import feedRouter from './routes/feed.routes.js';
import connectionRouter from './routes/connection.routes.js';
import ratingRouter from './routes/rating.routes.js';

const app = express();
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({origin:"*"}));

// db config
connectionDb();

// health route
app.get("/health",(req,res)=>{
    res.status(200).json({
        message:"Server Health Is 100%"
    });
});

// routes
app.use('/auth',authRouter);
app.use('/api/v1',feedRouter);
app.use('/api/v1/connections',connectionRouter);
app.use('/api/v1/ratings',ratingRouter);

export default app;