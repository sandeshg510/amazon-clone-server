// Imports from packages
import express from 'express';
import mongoose from 'mongoose';
import { request } from 'http';
import * as dotenv from 'dotenv';

dotenv.config();

// Imports from other files
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import productRouter from './routes/product.js';
import userRouter from './routes/user.js';
// INIT
const app = express();
const PORT = process.env.PORT;
const DB = process.env.MONGO_URI;

//Middleware
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);

//Connections
mongoose
	.connect(DB)
	.then(() => {
		console.log('Connection successful');
	})
	.catch((e) => {
		console.log(e);
	});

//Creating an API
app.listen(PORT, '0.0.0.0', () => {
	console.log(`Connected at port ${PORT}`);
});
