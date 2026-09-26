import Listing from "../models/Listing.js";

const campusCoordinates = {
  "North Dorm": [78.4867, 17.385],
  "South Dorm": [78.489, 17.382],
  Library: [78.4875, 17.3855],
  "Main Building": [78.488, 17.384],
  Cafeteria: [78.4865, 17.3845],
};

export const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      price,
      campusLocation,
    } = req.body;

    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const coords = campusCoordinates[campusLocation] || [0, 0];

    const listing = await Listing.create({
      title,
      description,
      category,
      type,
      price: type === "sale" ? price : 0,
      images,
      owner: req.user._id,
      campusLocation,
      location: {
        type: "Point",
        coordinates: coords,
      },
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
export const getListings = async (req, res) => {
  try {
    const {
      category,
      type,
      search,
      sortBy,
      page = 1,
      limit = 10,
      near,
      owner, // FIXED
    } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$text = {
        $search: search,
      };
    }

    if (owner) {
      query.owner = owner;
    }

    let listingsQuery = Listing.find(query).populate(
      "owner",
      "name email campus"
    );

    // SORTING
    if (sortBy === "price_asc") {
      listingsQuery = listingsQuery.sort({ price: 1 });
    } else if (sortBy === "price_desc") {
      listingsQuery = listingsQuery.sort({ price: -1 });
    } else if (sortBy === "newest") {
      listingsQuery = listingsQuery.sort({ createdAt: -1 });
    }
    if (near && campusCoordinates[near]) {
      listingsQuery = Listing.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: campusCoordinates[near],
            },
          },
        },
      }).populate("owner", "name email campus");
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const listings = await listingsQuery
      .skip(skip)
      .limit(limitNumber);

    const total = await Listing.countDocuments(query);

    res.json({
      listings,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    console.error("Get Listings Error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "owner",
      "name email campus"
    );

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.json(listing);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to edit this listing",
      });
    }

    const fields = [
      "title",
      "description",
      "category",
      "type",
      "price",
      "status",
      "campusLocation",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    
    if (listing.type !== "sale") {
      listing.price = 0;
    }

    const updated = await listing.save();

    res.json(updated);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this listing",
      });
    }

    await listing.deleteOne();

    res.json({
      message: "Listing removed",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};