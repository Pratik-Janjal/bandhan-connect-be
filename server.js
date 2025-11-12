import { connectDB } from "./config/db.js";
import userRoutes from "./routes/auth/userRoutes.js"
import express from "express";
import cors from 'cors';
// import otpRoutes from "./routes/auth/otpRoutes.js";
import profileRoutes from "./routes/auth/profileRoutes.js";
import dotenv from "dotenv"
import loginRouter from "./routes/auth/loginRoutes.js";
import feedsRouter from "./routes/feeds/feeds.js";
import PostsRouter from "./routes/posts/postsRoutes.js";
import profilesRouter from "./routes/profiles/profileRoutes.js";
import profileUpdateRouter from "./routes/profiles/profileUpdateRoutes.js";
import filterRouter from "./routes/filteredUser/filterUserRoutes.js";
import adminRoutes from "./routes/auth/admin.routes.js";


dotenv.config();
connectDB();

const app = express(); 
app.use(cors({ 
  origin: true, // frontend URL
  credentials: true // if sending cookies
}));
app.use(express.json()); // To parse JSON body 

app.get("/", (req, res) => { 
    res.send("Server is running successfully!"); 
}); 

app.use("/api", userRoutes);  // initial registration 
// app.use("/api", otpRoutes); 
app.use("/api/profile", profileRoutes);  // complete registration 
app.use("/api", loginRouter);     // login 
app.use("/api", feedsRouter); 
app.use("/api", profilesRouter); 
app.use("/api", profileUpdateRouter); 
app.use("/api", filterRouter); 
app.use("/api/posts", PostsRouter); 
app.use("/api/admin", adminRoutes);  // admin routes 
const PORT = process.env.PORT; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 

