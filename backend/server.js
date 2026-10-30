import express from 'express';
import cors from 'cors';
import logger from './middleware/logger.js';
import pool from './config/db.js';
import employeeRoutes from './routes/employeeRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';

const app = express();

app.use(cors({
    origin : 'http://localhost:4200'
}))

app.use(express.json())

app.use(logger)

app.use('/api/employees',employeeRoutes)

app.use('/api/departments', departmentRoutes);

app.use('/api/auth', authRoutes)

app.use(errorHandler)

const port = 5000;

app.get('/',(req,res)=>{
    res.json({
        message : "Employee Management System API Is Running"
    })
})

pool.query('SELECT NOW()').then(results=>{
    console.log("Database connected : ",results.rows[0])
}).catch(error=>{
    console.log("Data Connection Failed : ",error.message)
})

app.listen(port,()=>{
    console.log(`Server Running on http://localhost:${port}`)
})
