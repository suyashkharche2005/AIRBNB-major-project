const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");

// Optional models — only use if they exist in your project
let Booking = null;
try {
  Booking = require("../models/booking.js");
} catch (err) {
  Booking = null;
}

// ---------------- SIGNUP ----------------
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;

      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);

      req.login(registeredUser, (err) => {
        if (err) return next(err);

        req.flash("success", "Welcome to WanderLust!");
        return res.redirect("/listings");
      });
    } catch (e) {
      req.flash("error", e.message);
      return res.redirect("/signup");
    }
  })
);

// ---------------- LOGIN ----------------
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back to WanderLust!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);

// ---------------- LOGOUT ----------------
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
});

// ---------------- WISHLIST ----------------
router.get(
  "/wishlist",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");

    res.render("users/wishlist.ejs", {
      wishlistListings: user?.wishlist || [],
    });
  })
);

// ---------------- DASHBOARD ----------------
router.get(
  "/dashboard",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");

    // My listings with reviews
    const myListings = await Listing.find({ owner: req.user._id }).populate("reviews");

    const totalListings = myListings.length;
    const totalWishlist = user?.wishlist ? user.wishlist.length : 0;

    // Reviews + average rating
    let totalReviews = 0;
    let ratingsSum = 0;

    myListings.forEach((listing) => {
      const reviews = listing.reviews || [];
      totalReviews += reviews.length;

      reviews.forEach((review) => {
        ratingsSum += review.rating || 0;
      });
    });

    const averageRating =
      totalReviews > 0 ? (ratingsSum / totalReviews).toFixed(1) : "0.0";

    // Bookings
    let bookings = [];
    let totalBookings = 0;
    let totalBookingRevenue = 0;

    if (Booking) {
      bookings = await Booking.find({ user: req.user._id }).populate("listing");
      totalBookings = bookings.length;

      totalBookingRevenue = bookings.reduce((sum, booking) => {
        return sum + Number(booking.totalPrice || 0);
      }, 0);
    }

    res.render("users/dashboard.ejs", {
      user,
      totalListings,
      totalWishlist,
      totalReviews,
      averageRating,
      totalBookings,
      totalBookingRevenue,
      myListings,
      bookings,
    });
  })
);

module.exports = router;