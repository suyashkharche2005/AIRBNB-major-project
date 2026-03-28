const express = require("express");
const router = express.Router();

router.get("/privacy", (req, res) => {
  res.render("static/privacy.ejs");
});

router.get("/terms", (req, res) => {
  res.render("static/terms.ejs");
});

router.get("/help-center", (req, res) => {
  res.render("static/help-center.ejs");
});

module.exports = router;