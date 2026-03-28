const mongoose = require("mongoose");
const Listing = require("../models/listing");

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

  const MY_ID = new mongoose.Types.ObjectId("6921e960c7cb0570e7cd2386");

  const result = await Listing.updateMany(
    {},
    { $set: { owner: MY_ID } }
  );

  console.log(result);
  mongoose.connection.close();
}

run();
