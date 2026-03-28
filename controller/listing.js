const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");
const axios = require("axios");

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

module.exports.index = async (req, res) => {
  const { search = "", lat, lng } = req.query;

  let filter = {};

  if (search && search.trim()) {
    const q = search.trim();
    filter = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
      ],
    };
  }

  let allListings = await Listing.find(filter).populate("owner");

  let nearbyMode = false;

  if (lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) {
    const userLat = Number(lat);
    const userLng = Number(lng);
    nearbyMode = true;

    allListings = allListings
      .map((listing) => {
        const coords = listing?.geometry?.coordinates;
        let distanceKm = null;

        if (Array.isArray(coords) && coords.length === 2) {
          const [listingLng, listingLat] = coords;
          distanceKm = haversineDistanceKm(userLat, userLng, listingLat, listingLng);
        }

        return {
          ...listing.toObject(),
          distanceKm,
        };
      })
      .sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
  }

  let wishlistIds = [];
  if (req.user) {
    const user = await User.findById(req.user._id).select("wishlist");
    wishlistIds = (user?.wishlist || []).map((id) => id.toString());
  }

  res.render("listings/index.ejs", {
    allListings,
    searchQuery: search,
    nearbyMode,
    wishlistIds,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  let isWishlisted = false;
  if (req.user) {
    const user = await User.findById(req.user._id).select("wishlist");
    isWishlisted = (user?.wishlist || []).some(
      (wishId) => wishId.toString() === listing._id.toString()
    );
  }

  res.render("listings/show.ejs", { listing, isWishlisted });
};

module.exports.createListing = async (req, res) => {
  try {
    const { location } = req.body.listing;

    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      location
    )}`;

    const response = await axios.get(geoUrl, {
      headers: { "User-Agent": "Wanderlust-App" },
    });

    const coords = response.data[0]
      ? [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)]
      : [77.2090, 28.6139];

    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    listing.geometry = {
      type: "Point",
      coordinates: coords,
    };

    await listing.save();

    req.flash("success", "New listing created!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("Create Listing Error:", err);
    req.flash("error", "Could not create listing.");
    res.redirect("/listings");
  }
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body.listing;

  let listing = await Listing.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  if (updatedData.location) {
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        updatedData.location
      )}`;

      const response = await axios.get(geoUrl, {
        headers: { "User-Agent": "Wanderlust-App" },
      });

      const coords = response.data[0]
        ? [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)]
        : listing.geometry?.coordinates || [77.2090, 28.6139];

      listing.geometry = {
        type: "Point",
        coordinates: coords,
      };
    } catch (err) {
      console.log("Geocode update failed, keeping previous geometry");
    }
  }

  await listing.save();

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (listing.reviews && listing.reviews.length > 0) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }

  await User.updateMany(
    { wishlist: listing._id },
    { $pull: { wishlist: listing._id } }
  );

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

module.exports.toggleWishlist = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  const alreadySaved = user.wishlist.some(
    (listingId) => listingId.toString() === id
  );

  if (alreadySaved) {
    user.wishlist.pull(id);
    req.flash("success", "Removed from wishlist.");
  } else {
    user.wishlist.push(id);
    req.flash("success", "Added to wishlist.");
  }

  await user.save();

  const backUrl = req.get("referer") || "/listings";
  res.redirect(backUrl);
};