// Author: Ayman Kassab
// Github: https://github.com/akassab/KijijiGraphs

// routes.js: Here we make use of the kijiji scraper npm package, and define available GET and POST requests which are
//  called by our Angular.js controller AppCtrl in public/js/app.js
//=======================

let kijiji = require("kijiji-scraper"); // kijiji scraper module to scrape results
let path = require('path'); //
// let Favourite = require('./models/favourite'); // FAVORITE MONGOOSE MODEL TO DO

// results:  Kijiji Search results go here
// Is a List[Dictionary]
// Format [{ title: "...", description : "...", date: "..", image : "..", images :[...},
//          attributes: {price:" ..." ,location: "..", type: "...", visits: "..."}, url: "..."},...]
let results = {}

// options: options defined in https://www.npmjs.com/package/kijiji-scraper
let options = {
    minResults: 0,
    maxResults: 40
};
// parameters: parameters defined in https://www.npmjs.com/package/kijiji-scraper
let params = {
    locationId: kijiji.locations.ONTARIO.TORONTO_GTA.CITY_OF_TORONTO,
    keywords: "",
    sortByName: "dateAsc",
    categoryId: 0
};


// Export this function
module.exports = function (app) {
    // AppCtrl calls GET on '/api/categories'  send them categories.
    // (this is called once at startup)
    app.get('/api/categories',function (req,res) { res.send(kijiji.categories);});

    // AppCtrl calls POST on '/api/search'  with parameters 'name' and 'category" in req, send them 'results'
    // (This is called every time a new search it triggered)
    app.post('/api/search',function (req,res) {
        //1) get search keywords  and category
        params.keywords = req.body.name;
        params.categoryId = req.body.category;
        // 2) use kijiji-scraper module method on keywords, category, and 'options' and 'params' defined above
        let promise = kijiji.search(params, options).then(function(ads) { results = ads; }).catch(console.error);
        // 3) once promise is complete send result back to 'AppCtrl"
        promise.then(function () { res.send(results);});
        // 4) Error check
        promise.catch(function () {});
    });

    // Always returning index.html
    app.get('*', function (req,res) { res.sendFile(path.join(__dirname, '../public', 'index.html')); });
    /*
   ==== TO DO ===
  // Controller asks for favorites give them favorites
  app.get("/api/favourites",function (req,res) {
      Favourite.find(function(err,favourites) {
          if (err) {
              res.send(err);
          }
          res.json(favourites);
       });
  });
  */
   // ===========
};