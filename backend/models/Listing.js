import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Textbooks",
        "Electronics",
        "Dorm Essentials",
        "Academic Supplies",
        "Skills",
        "Other",
      ],
    },

    type: {
      type: String,
      required: true,
      enum: ["sale", "barter", "donate"],
    },

    price: {
      type: Number,
      default: 0,
    },

    images: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["Available", "Pending", "Completed"],
      default: "Available",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    campusLocation: {
      type: String,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  }
);

listingSchema.index({
  title: "text",
  description: "text",
});

listingSchema.index({
  location: "2dsphere",
});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;