const axios = require("axios");

async function geocodeLocation(location) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${location}`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent": "YourAppName"
    }
  });

  if (response.data.length === 0) return null;

  const place = response.data[0];
  return [parseFloat(place.lon), parseFloat(place.lat)];
}

module.exports = geocodeLocation;
