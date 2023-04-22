const axios = require("axios");
const location = (term, callback) => {
  const targetURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${term}.json?access_token=pk.eyJ1IjoiZmFyYWgxMjMiLCJhIjoiY2tpb3ZrNnE4MDB0cjJ0cDlzZXZ5eHQ5dSJ9.F6mgRF14yRJ6WN9JqtpWtw`;
  axios
    .get(targetURL)
    .then(async (response) => {
      callback(undefined, {coords: response.data.features[0].center, name: response.data.features[0].place_name})
    })
    .catch((e) => {
      callback(e.message)
    });
};
module.exports = location;