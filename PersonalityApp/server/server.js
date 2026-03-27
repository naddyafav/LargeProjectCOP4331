import "./config/env.js";  // MUST be first import
console.log("ATLAS_URI:", process.env.ATLAS_URI);
import express from "express";
import cors from "cors";
import connectDB from "./db/connection.js";
import login from "./routes/login.js";

const PORT = process.env.PORT || 5050;
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/login", login);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});