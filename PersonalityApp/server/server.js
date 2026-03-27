import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import express from "express";
import cors from "cors";
import "./db/connection.js";
import login from "./routes/login.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/login", login);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
