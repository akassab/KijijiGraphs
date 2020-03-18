// TO DO:
// Add user-login favourites
// Add clear option
// Add location option


const kijiji = require("kijiji-scraper");
var Favourite = require('./models/favourite');
module.exports = function (app) {
    // api-----------------------
    // Someone asked for favourites, send them  favourites --- TO DO
    app.get("/api/favourites",function (req,res) {
        Favourite.find(function(err,favourites) {
            if (err) {
                res.send(err);
            }
            res.json(favourites);
         });
    });
    // some one asked for categories, send them categories
    app.get("/api/categories",function (req,res) {
        res.send(kijiji.categories);
    });

    // someone asked for a new search result, return them the results
    app.post("/api/",function (req,res) {
        params.keywords = req.body.name;
        params.categoryId = req.body.category;
        var promise = kijiji.search(params, options).then(function(ads) {
            results = ads;
        }).catch(console.error);
        promise.then(function () {
            res.send(results);
        });
        promise.catch(function () {
        });
    });
};

// Default options and parameters
let options = {
    minResults: 40
};
let params = {
    locationId: kijiji.locations.ONTARIO.TORONTO_GTA.CITY_OF_TORONTO,
    keywords: "",
    sortByName: "dateAsc",
    categoryId: 0
};
