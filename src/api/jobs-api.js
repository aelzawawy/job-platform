const axios = require("axios");

const searchAPI = async (search_terms, location) => {
  const options = {
    method: "POST",
    url: "https://linkedin-jobs-search.p.rapidapi.com/",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "96148c67fdmshce77d5c2d96ee31p14f301jsnc3ed3a645ded",
      "X-RapidAPI-Host": "linkedin-jobs-search.p.rapidapi.com",
    },
    data: `{"search_terms":"${search_terms}","location":"${location}","page":"1"}`,
  };

  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
};

module.exports = searchAPI;