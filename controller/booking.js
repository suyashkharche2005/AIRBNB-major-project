const Booking = require("../models/booking");
const Listing = require("../models/listing");

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function normalizeDate(dateInput) {
  const date = new Date(dateInput);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests } = req.body;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  if (!checkIn || !checkOut) {
    req.flash("error", "Please select check-in and check-out dates.");
    return res.redirect(`/listings/${id}`);
  }

  const checkInDate = normalizeDate(checkIn);
  const checkOutDate = normalizeDate(checkOut);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    req.flash("error", "Invalid booking dates.");
    return res.redirect(`/listings/${id}`);
  }

  const nights = Math.round((checkOutDate - checkInDate) / MS_PER_DAY);

  if (nights <= 0) {
    req.flash("error", "Check-out must be after check-in.");
    return res.redirect(`/listings/${id}`);
  }

  const guestsCount = Math.max(1, Number(guests) || 1);
  const listingPricePerNight = Number(listing.price) || 0;
  const cleaningFee = 999;
  const serviceFee = 499;
  const taxes = Math.round(nights * listingPricePerNight * 0.18);
  const totalPrice = nights * listingPricePerNight + cleaningFee + serviceFee + taxes;

  const booking = new Booking({
    listing: listing._id,
    user: req.user._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: guestsCount,
    nights,
    listingPricePerNight,
    cleaningFee,
    serviceFee,
    taxes,
    totalPrice,
  });

  await booking.save();

  req.flash("success", "Booking confirmed successfully!");
  res.redirect("/dashboard");
};