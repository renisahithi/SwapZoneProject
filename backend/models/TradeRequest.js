import mongoose from "mongoose";

const tradeRequestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    proposalType: {
      type: String,
      enum: ["buy", "barter"],
      required: true,
    },
    offeredItem: {
      type: String,
      trim: true,
    
    },
    offeredPrice: {
      type: Number,
    
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const TradeRequest = mongoose.model("TradeRequest", tradeRequestSchema);

export default TradeRequest;