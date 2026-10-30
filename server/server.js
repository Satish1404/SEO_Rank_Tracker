import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/DB.js";
import authRouter from "./routes/authRoute.js"

connectDB()

const app = express();

app.use(cors());
app.use(express.json())


app.get('/',(req, res)=>{
    res.send("server is running")
})

app.use("/api/auth", authRouter)

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log(`server running on port ${PORT}`))