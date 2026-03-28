if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// ROUTES
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRoutes = require("./routes/user.js");
const staticPagesRouter = require("./routes/staticPages.js");

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

// ---------------- DB CONNECTION ----------------
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB");
}

main().catch((err) => console.log("MongoDB Error:", err));

// ---------------- VIEW ENGINE & MIDDLEWARE ----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------------- SESSION & FLASH ----------------
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ---------------- PASSPORT AUTH ----------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ---------------- GLOBAL VARIABLES ----------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.MAP_STYLE = process.env.MAP_STYLE || "";
  next();
});

// ---------------- ROUTES ----------------
app.use("/", staticPagesRouter);
app.use("/", userRoutes);
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// ---------------- HOME REDIRECT ----------------
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ---------------- 404 HANDLER ----------------
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Oh no, something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", {
    err: { statusCode, message },
  });
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});