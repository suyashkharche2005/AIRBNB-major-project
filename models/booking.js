const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      default: 1,
      min: 1,
    },
    nights: {
      type: Number,
      required: true,
      min: 1,
    },
    listingPricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    cleaningFee: {
      type: Number,
      default: 999,
      min: 0,
    },
    serviceFee: {
      type: Number,
      default: 499,
      min: 0,
    },
    taxes: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);