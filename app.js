
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
const MongoStore=require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const axios = require("axios");

// ROUTES
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRoutes = require("./routes/user.js");
const { error } = require("console");

const dburl=process.env.ATLASDB_URL;
// ---------------- DB CONNECTION ----------------
main()
  .then(() => console.log("connected to DB"))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(dburl);
}

// ---------------- VIEW ENGINE & MIDDLEWARE ----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------------- SESSION & FLASH ----------------
const store = MongoStore.create({
mongoUrl: dburl,
crypto: {
secret: process.env.SECRET,
},
touchAfter: 24 * 3600,
});

store.on("error",() =>{
  console.log("error in mongo Store",err
  )
})


const sessionOptions = {
  store,
  resave: false,
  saveUninitialized: true,
  secret: process.env.SECRET,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
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
// Make flash messages + user + MAP_STYLE available to ALL EJS templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  // 🔥 Make MAP_STYLE from .env available in EJS
  res.locals.MAP_STYLE = process.env.MAP_STYLE;

  next();
});

// ---------------- ROUTES ----------------    <!--<h3>All Listings</h3>--> 
   
  //<!-- <form method="GET" action="/listings/new">
  //<button>Create New Listing</button>   
    // </form>  
  


app.use("/", userRoutes);
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews); // nested route

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// ---------------- START SERVER ----------------
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});










/*
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
const axios = require("axios");

// ROUTES
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// ---------------- DB CONNECTION ----------------
main()
  .then(() => console.log("connected to DB"))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// ---------------- VIEW ENGINE & MIDDLEWARE ----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------------- SESSION & FLASH ----------------
const sessionOptions = {
  resave: false,
  saveUninitialized: true,
  secret: "mysupersecretcode",
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
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
// Make flash messages + user + MAP_STYLE available to ALL EJS templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  // 🔥 Make MAP_STYLE from .env available in EJS
  res.locals.MAP_STYLE = process.env.MAP_STYLE;

  next();
});

// ---------------- ROUTES ----------------    <!--<h3>All Listings</h3>--> 
   
  //<!-- <form method="GET" action="/listings/new">
  //<button>Create New Listing</button>   
    // </form>  
  


app.use("/", userRoutes);
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews); // nested route

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// ---------------- START SERVER ----------------
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});















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
const userRoutes = require("./routes/user.js");   // <-- ADDED

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// ---------------- DB CONNECTION ----------------
main()
  .then(() => console.log("connected to DB"))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// ---------------- VIEW ENGINE & MIDDLEWARE ----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------------- SESSION & FLASH ----------------
const sessionOptions = {
  resave: false,
  saveUninitialized: true,
  secret: "mysupersecretcode",
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
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

// Make flash messages available to templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;        // optional but useful
  next();
});

// ---------------- ROUTES ----------------
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use("/", userRoutes);               // <-- FIXED: USERS ROUTES
app.use("/listings", listings);
app.use("listings/:id/reviews", reviews);     // NOT nested

//app.use("/listings", listings);
//app.use("/listings/:id/reviews", reviews);

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
        res.locals.currUser = req.user;

    next();
});


// ---------------- START SERVER ----------------
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});



code end here */ 


/*
app.use((err, req, res, next) => {
  res.send("something went wrong");
});  
/*



/*
// null listings

  app.get('/admin/delete-null-listings', async (req, res) => {
  try {
    const result = await Listing.deleteMany({
      $or: [
        { price: null },
        { title: null },
        { description: null },
        { image: null },
        { location: null },
        { country: null }
      ]
    });
    res.send(✅ Deleted ${result.deletedCount} null or incomplete listings.);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error deleting listings');
  }
});




*/ 
/*
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode , message  } = err;
  res.status(statusCode).send(message);
});




//app.all("*",(req,res,next)=>{
  //next(new ExpressError("404","page not found"));

  //})


/*app.all("*", (req,res,next) =>{
  next(new ExpressError(404,"page not found!"));
})
*/




// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });








