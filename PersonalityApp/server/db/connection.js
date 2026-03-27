import mongoose from "mongoose";
 
const uri = process.env.ATLAS_URI || "";
 
try {
  await mongoose.connect(uri, {
    dbName: "personality_app",
  });
  console.log("Successfully connected to MongoDB via Mongoose!");
} catch (err) {
  console.error("MongoDB connection error:", err);
  process.exit(1); // Exit if the database connection fails
}
 
export default mongoose.connection;