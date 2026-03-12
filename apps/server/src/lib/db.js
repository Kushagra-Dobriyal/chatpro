import mongoose from "mongoose";

export const connectDB=async()=>{
    try {
        console.log("DEBUG: process.env.DATABASE_URL=", process.env.DATABASE_URL);
        const conn=await mongoose.connect(process.env.DATABASE_URL);
        console.log(`Connected to ${conn.connection.host}`);
    } catch (e) {
        console.log("Error connecting to MongoDB", e);
    }
}