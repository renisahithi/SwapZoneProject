import express from "express";
import {
  createTradeRequest,
  getMySentRequests,
  getMyReceivedRequests,
  respondToTradeRequest,
} from "../controllers/tradeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTradeRequest);
router.get("/sent", protect, getMySentRequests);
router.get("/received", protect, getMyReceivedRequests);
router.put("/:id", protect, respondToTradeRequest);

export default router;