import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import listingRoutes from "./routes/listingRoutes.js";
import authRoutes from "./routes/authRoutes.js"; 
import tradeRoutes from "./routes/tradeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/listings", listingRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/reviews", reviewRoutes);
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("SwapZone API is running");
});