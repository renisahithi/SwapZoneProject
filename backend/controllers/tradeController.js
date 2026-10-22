import TradeRequest from "../models/TradeRequest.js";
import Listing from "../models/Listing.js";

export const createTradeRequest = async (req, res) => {
  try {
    const { listingId, proposalType, offeredItem, offeredPrice, message } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot request your own listing" });
    }

    if (listing.status !== "Available") {
      return res.status(400).json({ message: "This listing is not available for trade" });
    }

    const tradeRequest = await TradeRequest.create({
      listing: listingId,
      requester: req.user._id,
      proposalType,
      offeredItem,
      offeredPrice,
      message,
    });

    res.status(201).json(tradeRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMySentRequests = async (req, res) => {
  try {
    const requests = await TradeRequest.find({ requester: req.user._id })
      .populate("listing", "title price images status")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyReceivedRequests = async (req, res) => {
  try {
    const myListings = await Listing.find({ owner: req.user._id }).select("_id");
    const listingIds = myListings.map((l) => l._id);

    const requests = await TradeRequest.find({ listing: { $in: listingIds } })
      .populate("listing", "title price images status")
      .populate("requester", "name email campus")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const respondToTradeRequest = async (req, res) => {
  try {
    const { status } = req.body; // "Accepted" | "Rejected" | "Completed"

    const allowedStatuses = ["Accepted", "Rejected", "Completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const tradeRequest = await TradeRequest.findById(req.params.id).populate("listing");
    if (!tradeRequest) return res.status(404).json({ message: "Trade request not found" });

    if (!tradeRequest.listing) {
      return res.status(404).json({ message: "This listing no longer exists" });
    }

    if (tradeRequest.listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to respond to this request" });
    }


    const allowedTransitions = {
      Pending: ["Accepted", "Rejected"],
      Accepted: ["Completed"],
    };
    if (!allowedTransitions[tradeRequest.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot change a ${tradeRequest.status} request to ${status}`,
      });
    }

    const listingId = tradeRequest.listing._id;

    if (status === "Accepted") {
      const listing = await Listing.findById(listingId);
      if (listing.status !== "Available") {
        return res.status(400).json({ message: "This listing is no longer available" });
      }
    }

    tradeRequest.status = status;
    await tradeRequest.save();

    if (status === "Accepted") {
      await Listing.findByIdAndUpdate(listingId, { status: "Pending" });

      await TradeRequest.updateMany(
        { listing: listingId, _id: { $ne: tradeRequest._id }, status: "Pending" },
        { status: "Rejected" }
      );
    } else if (status === "Completed") {
      await Listing.findByIdAndUpdate(listingId, { status: "Completed" });
    } else if (status === "Rejected") {
     
      const otherAccepted = await TradeRequest.exists({
        listing: listingId,
        status: "Accepted",
      });
      if (!otherAccepted) {
        await Listing.findByIdAndUpdate(listingId, { status: "Available" });
      }
    }

    res.json(tradeRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};