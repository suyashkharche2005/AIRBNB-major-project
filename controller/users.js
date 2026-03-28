const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.rendersignup = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.logIn(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to WanderLust!");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.renderlogin = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to WanderLust!");
  res.redirect(res.locals.redirectUrl || "/listings");
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};

module.exports.renderWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  const wishlistListings = user?.wishlist || [];

  res.render("users/wishlist.ejs", {
    wishlistListings,
  });
};

module.exports.renderDashboard = async (req, res) => {
  const userId = req.user._id;

  const myListings = await Listing.find({ owner: userId }).populate({
    path: "reviews",
    populate: { path: "author" },
  });

  const bookings = await Booking.find({ user: userId })
    .populate("listing")
    .sort({ createdAt: -1 });

  const user = await User.findById(userId).populate("wishlist");

  const totalListings = myListings.length;
  const totalWishlist = user?.wishlist?.length || 0;
  const totalBookings = bookings.length;

  let totalReviews = 0;
  let ratingSum = 0;

  for (const listing of myListings) {
    const reviews = listing.reviews || [];
    totalReviews += reviews.length;

    for (const review of reviews) {
      ratingSum += review.rating || 0;
    }
  }

  const averageRating =
    totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : "0.0";

  let totalBookingRevenue = 0;
  for (const booking of bookings) {
    totalBookingRevenue += booking.totalPrice || 0;
  }

  res.render("users/dashboard.ejs", {
    myListings,
    bookings,
    totalListings,
    totalWishlist,
    totalReviews,
    averageRating,
    totalBookings,
    totalBookingRevenue,
  });
};