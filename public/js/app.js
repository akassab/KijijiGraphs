// Author: Ayman Kassab
// Github: https://github.com/akassab/KijijiGraphs

// $scope.js: 
// What: Here we make use of an Angular model 'kGraphs' , and its controller 'AppCtrl'.
// Purpose:  Serve as the front end  engine to the website by updating html elements dynamically using templating.
//=======================

// kGraphs: An angular module.
// Initial Steps:
//  1) Define module "kGraphs".
//  2) Add modules:
//      i)  chart.js: for displaying the graph.
//      ii)  angular-loading-bar: to represent waiting time for http requests.
//      iii) gAnimate: optional for angular-loading-bar, NOT USED YET.
//      Iv)  smoothscroll: for scrolling to elements, NOT USED YET.
//  3) Uses built in objects:
//      i)   $scope:  referring to application model.
//      ii)  $http: service that facilitates communication with the remote HTTP servers via the browser's XMLHttpRequest
//            object or via JSONP.
//      iii) $window: service that is a wrapper around window object.

let kGraphs = angular.module("kGraphs", ['chart.js', 'angular-loading-bar','ngAnimate', 'smoothScroll'])
    .controller("AppCtrl",function($scope, $http, $window){
    // Private fields ===============
    // url: url of the API
    let url = 'http://localhost:8080';
    // results: Kijiji Adds;
    //          type: [Dict,...]
    let results = [];
    // Initial category ID: 0 for all categories.
    let categoryId = 0;
    // Dict of Dicts of each category level (level 1-3)
    let levelDicts = {one: {},two: {},three:{}};
    // calculates the median of the array of integers
    function median(array) {
        var numbers = array.slice(0);
        var median = 0, count = numbers.length;
        numbers.sort();
        if (count % 2 === 0) {  // is even
            median = (numbers[count / 2 - 1] + numbers[count / 2]) / 2;
        } else { // is odd
            median = numbers[(count - 1) / 2];
        }
        return median;
    }
    // calculates the mean and median of an array of integers
    function getMeanStd(data) {
        var sum=0;     // stores sum of elements
        var sumsq = 0; // stores sum of squares
        var l = data.length;
        for(var i=0;i<l;++i) {
            sum+=data[i];
            sumsq+=data[i]*data[i];
        }
        var mean = sum/l;
        var variance = sumsq / l - mean*mean;
        var sd = Math.sqrt(variance);
        return [mean,sd];
    }
    // Determines if a number is an outlier given the mean and std. NOT USED AT THE MOMENT
    function isOutlier(number, meanSd) {return !(number> meanSd[0] - 3 *meanSd[1] && number < meanSd[0] + 3 *meanSd[1]);}
    // SCOPE DEFINERS ===============
    $scope.alertType = "purple";
    $scope.alert= "Welcome! Try searching something you like!"
    // categoryBarHelper: Serves as front end helper to provide fields and function to help update the categories view
    // upon selections.
     function categoryBarHelper() {
            // Dict of List of strings for each category level.
            $scope.levelCategories = {one : [], two : [], three: []};
            // Dict of String titles for every (3) categories in the search bar.
            $scope.levelTitles = {one: "ALL_CATEGORIES", two: "-", three: "-"};
            // Dict of functions, called on ng-click directives in index.html when categories are selected.
            $scope.levelSelectedFunctions = {
                one: function (selected) {
                    // We clear level 2 and 3 every time a level 1 category is selected and set level 1 title.
                    levelDicts.two = {};
                    levelDicts.three = {};
                    $scope.levelCategories.two = [];
                    $scope.levelCategories.three = [];
                    $scope.levelTitles = {one: selected, two: "-", three: "-"};
                    // 0) If ALL_CATEGORIES is selected just return
                    if (selected === "ALL_CATEGORIES") { categoryId = 0; return; }
                    // 1) Find level 2's dict in level 1's dict.
                    for (const categoryKey in levelDicts.one) {
                        if (categoryKey.toString() === $scope.levelTitles.one) {
                            levelDicts.two = levelDicts.one[categoryKey];
                            for (let categoryKey in levelDicts.two) {
                                // 2) This will run first: Set the category ID of the selected level based on 1 which is now in dict 2.
                                if (categoryKey.toString() === "id") {
                                    categoryId = levelDicts.two[categoryKey];
                                }
                                // 3) The rest will be this: Populate level 2's strings with its categories based on level 1.
                                else {
                                    $scope.levelCategories.two.push(categoryKey.toString());
                                }
                            }
                            break;
                        }
                    }
                    // Have "ALL_CATEGORIES" selected automically after level 1 is selected.
                    $scope.levelSelectedFunctions.two("ALL_CATEGORIES");
                },
                two:  function (selected) {
                    // We clear level 3 every time a level 2 category is selected and set level 2 title.
                    levelDicts.three = {};
                    $scope.levelCategories.three = [];
                    $scope.levelTitles.two = selected;
                    $scope.levelTitles.three = "-";
                    // 0) If ALL_CATEGORIES is selected just return
                    if (selected === "ALL_CATEGORIES") { categoryId = levelDicts.two.categoryId; return; }
                    // 1) Find level 3's dict in level 2's dict.
                    for (const categoryKey in levelDicts.two) {
                        if (categoryKey.toString() === $scope.levelTitles.two) {
                            levelDicts.three = levelDicts.two[categoryKey];
                            for (let categoryKey in levelDicts.three) {
                                // 2) This will run first: Set the category ID of the selected level based on 2 which is now in dict 3.
                                if (categoryKey.toString() === "id") {
                                    categoryId = levelDicts.three[categoryKey];
                                }
                                // 3) The rest will be this: Populate level 3's strings with its categories based on level 2.
                                else {
                                    $scope.levelCategories.three.push(categoryKey.toString());
                                }
                            }
                            break;
                        }
                    }
                    $scope.levelSelectedFunctions.three("ALL_CATEGORIES");
                },
                three: function (selected) {
                    // We set level 3's title.
                    $scope.levelTitles.three = selected;
                    // 0) If ALL_CATEGORIES is selected just return
                    if (selected === "ALL_CATEGORIES") { categoryId = levelDicts.three.categoryId; return; }
                    // 1) Find the level 3 selected in level 3's dict and set the category ID and break.
                    for (let categoryKey in levelDicts.three) {
                        if (categoryKey.toString() === $scope.levelTitles.three) {
                            categoryId = levelDicts.three[categoryKey].categoryId;
                            break;
                        }
                    }
                }
            };
        }
    // chartJsHelper(): Serves as front end helper to provide fields and function to help update the graph view
    // upon search and mouse events (such as touching graph nodes).
     function chartJsHelper() {
            //[Dict]: saved adds by the user.
            $scope.savedAdds = [];
            // [int,]: labels for x axis
            $scope.labels = [0,1,2,3,4,5,6];
            // [[int],]: data for different data, currently using only 1 set of data
            $scope.data = [[0]];
            // [string,]: different graphs, currently using only one
            $scope.series = ['Series A'];
            // [dict,]: some options part of chart.js
            $scope.datasetOverride =  [{
                label: "Line chart",
                borderWidth: 3,
                hoverBackgroundColor: "rgba(255,99,132,0.4)",
                hoverBorderColor: "rgba(255,99,132,1)",
                type: 'line'
            }];
            // [string,]: Graph colours
            $scope.colors = ['#373373', '#ff8e72'];
            // Options for chartJs
            $scope.options = {
                responsive:true,
                tooltips: {
                    callbacks: {
                        // Tooltip open hovering graph node
                        title: function (tooltipItem, data) {
                            return "Price: $" + results[tooltipItem[0]['index']].attributes.price + "\nDate: " + results[tooltipItem[0]['index']].date.slice(0,10)
                                + "\nType: " + results[tooltipItem[0]['index']].attributes.type + "\n---" + results[tooltipItem[0]['index']].title + "---\n" +
                                results[tooltipItem[0]['index']].description;
                        },
                    }
                },
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true  ,
                            position: 'left',
                        }
                    ]
                }
            };
            // searchProduct: function called upon search, performs POST request with keywords and categories indicated by user.
            $scope.searchProduct = function(searchedProduct) {
                // Update alert while loading
                $scope.alert = '🔎Scraping Kijiji adds🔍... This might take a bit...';
                // Update alert colour while loading
                $scope.alertType = 'warning';
                $http({
                    method: 'POST',
                    url: url + '/api/search',
                    data: {name: searchedProduct, category: categoryId},
                }).then(function (searchResults){
                    let tempData = [];
                    // get the response data
                    results = searchResults.data;
                    // clear chart.js data and labels
                    $scope.data = [[]];
                    $scope.labels = [];
                    // copy the price from the response data in results into tempData
                    for (let i = 0; i < results.length; ++i) { tempData.push(results[i].attributes.price); }
                    // Calculate the mean and standard deviation
                    let meanStd = getMeanStd(tempData);
                    // Push price and date onto data and labels scope variables
                    for (let i = 0; i < tempData.length; ++i) {
                        let price = tempData[i];
                        let date = results[i].date.slice(0,10);
                        $scope.data[0].push(price);
                        $scope.labels.push(date);
                    }
                    // If there was no results
                    if ($scope.data[0].length == 0) {
                        // Add 0 to keep the graph happy
                        $scope.data[0].push(0);
                        // Update alert colour and message
                        $scope.alertType = "secondary";
                        $scope.alert=" 🤦 This is awkward... Couldn't find anything for that.\n Hmm I know! Try looking up cats! 🐈"

                    }
                    // Otherwise display mean and median price and update alert colour
                    else {
                        $scope.alert = 'The average price is about $' + Math.round(meanStd[0]) + " and the median price is about $" + median($scope.data[0]) + " Click on a node to save! 👉 ⚫";
                        $scope.alertType = 'success';
                    }
                    // error check
                },function (error){
                    console.log(error);
                });
            };
            // Opens link specified at link in a new tab
            $scope.openLinkHelper =  function(link) { $window.open(link, '_blank');};
            // $scope.onClick(): Called clicking the window
            $scope.onClick = function (points, evt) {
                // If do this if we clicked on a point
                if (points.length != 0) {
                    // get the index of the point
                    let index = points[0]._index;
                    // get the dict of Add corresponding to the node
                    let result = results[index];
                    // check if the item already existed, if it did, return and dont add anything to the list of saved items.
                    for (let i = 0; i < $scope.savedAdds.length; ++i) {
                        if ($scope.savedAdds[i].title === result.title) {
                            return;
                        }
                    }
                    // creat a new item corresponding to the item clicked
                    let add = {title : result.title, description: result.description, date: result.date.slice(0,10),
                        price : result.attributes.price, link: result.url, type : result.attributes.type };
                    // add this add to the savedAdds
                    $scope.savedAdds.push(add);
                    $scope.$apply();
                }
            };
         // removeSavedItem(itemToRemove): remove a saved item from the list.
         $scope.removeSavedItem = function(itemToRemove) {
             for (let i = 0; i < $scope.savedAdds.length; ++i) {
                 if ($scope.savedAdds[i] == itemToRemove) {
                     $scope.savedAdds.splice(i,1);
                     break;
                 }
             }
         };

     }
    // SCOPE USERS ===============
    // performs an GET request using $http service on /api/categories to get level categories from kijiji-scraper
    // module in routes.js
    function getCategories () {
        $http({ method: 'GET',  url: url + '/api/categories'}).then(function (searchResult) {
            levelDicts.one = searchResult.data;
            for (let key in levelDicts.one) { $scope.levelCategories.one.push(key.toString());}
        }, function (error) {console.log(error)});
    }
    // openLinkHelper(link): opens a url link using $window service. NOT USED AT THE MOMENT
    // Call functions defined above.
    categoryBarHelper();
    getCategories();
    chartJsHelper();
});
// Filter to remove underscores
kGraphs.filter('underscoreless', function () {return function (input) {return input.replace(/_/g, ' ');};});
// Filter to turn sentences into title case
kGraphs.filter('titlecase', function() {
    return function (input) {
        var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
        input = input.toLowerCase();
        return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
            if (index > 0 && index + match.length !== title.length &&
                match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
                (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }
            if (match.substr(1).search(/[A-Z]|\../) > -1) {
                return match;
            }
            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    }
});



