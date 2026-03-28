const mongoose = require("mongoose");
const Listing = require("./models/listing"); // adjust path if needed

mongoose.connect("mongodb://localhost:27017/yourDBName", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const DEFAULT_OWNER_ID = "6921e960c7cb0570e7cd2386"; // your ID

async function setOwnerForAllListings() {
  try {
    const result = await Listing.updateMany(
      {}, // all listings
      { $set: { owner: DEFAULT_OWNER_ID } }
    );
    console.log(`Updated ${result.modifiedCount} listings to your owner ID.`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

setOwnerForAllListings();
