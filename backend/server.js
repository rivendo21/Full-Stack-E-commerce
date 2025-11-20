import express from 'express'; 
import open from 'open'; // Add this line
import dotenv from 'dotenv'; 
import { connectDB } from './config/db.js';
import productroutes from './routes/route.js';


dotenv.config();
const app = express();
const PORT=process.env.PORT || 5000;
app.use(express.json());
app.use("/api/products",productroutes);


app.listen(PORT,()=>{
  connectDB();
    console.log("Server is running on port"+PORT);
    open('http://localhost:5000');
});

