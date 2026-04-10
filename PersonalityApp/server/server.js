// server/server.js
 
import "./config/env.js"; // MUST be first import
import express from "express";
import cors from "cors";
import connectDB from "./db/connection.js";
 
import loginRoutes from "./routes/login.js";
import registerRoutes from "./routes/regi.js";
import friendRoutes from "./routes/friends.js";
import passwordRoutes from "./routes/password.js";
import quizRoutes from "./routes/quiz.js";
 
const PORT = process.env.PORT || 5050;
const app = express();
 
connectDB();
 
app.use(cors());
app.use(express.json());
 
// Routes
app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/friends", friendRoutes);
app.use("/password", passwordRoutes);
app.use("/quiz", quizRoutes);
 
// Optional test route
app.get("/", (req, res) => {
  res.send("Server is running.");
});
 
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
 