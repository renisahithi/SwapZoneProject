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

    const tradeRequest = await TradeRequest.findById(req.params.id).populate("listing");
    if (!tradeRequest) return res.status(404).json({ message: "Trade request not found" });

    if (tradeRequest.listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to respond to this request" });
    }

    tradeRequest.status = status;
    await tradeRequest.save();
    if (status === "Accepted") {
      await Listing.findByIdAndUpdate(tradeRequest.listing._id, { status: "Pending" });
    } else if (status === "Completed") {
      await Listing.findByIdAndUpdate(tradeRequest.listing._id, { status: "Completed" });
    } else if (status === "Rejected") {
      await Listing.findByIdAndUpdate(tradeRequest.listing._id, { status: "Available" });
    }

    res.json(tradeRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};