let kGraphs = angular.module("kGraphs", ['chart.js']);


// takes the http service to load in our data from our local host
// on success take the products and assign them
// assign them to this apps products products
kGraphs.controller("AppCtrl",function($scope, $http, $window){
    let app = this;
    let url = 'http://localhost:8080';
    app.id = 0;
    app.level1Dict ={};
    app.level2Dict = {};
    app.level3Dict = {};
    app.level1Strings = [];
    app.level2Strings = [];
    app.level3Strings = [];
    app.level1 = "ALL_CATEGORIES";
    app.level2 = "N/A";
    app.level3 = "N/A";
    app.level1Selected = function (selected) {
        app.level1 = selected;
        app.level2Dict = {};
        app.level3Dict = {};
        app.level2 = "N/A";
        app.level3 = "N/A";
        app.level2Strings = [];
        app.level3Strings = [];

        if (selected === "ALL_CATEGORIES") {
            app.id = 0;
            return;
        }
        for (const categoryKey in app.level1Dict) {
            if (categoryKey.toString() === app.level1) {
                app.level2Dict = app.level1Dict[categoryKey];
                break;
            }
        }
        for (let categoryKey in app.level2Dict) {
            if (categoryKey.toString() === "id") {
                app.id = app.level2Dict[categoryKey];
            }
            else {
                app.level2Strings.push(categoryKey.toString());
            }
        }
        app.level2Selected("ALL_CATEGORIES");


    };
    app.level2Selected = function (selected) {
        app.level2 = selected;
        app.level3Dict = {};
        app.level3 = "N/A";
        app.level3Strings = [];

        if (selected === "ALL_CATEGORIES") {
            app.id = app.level2Dict.id;
            return;
        }
        for (const categoryKey in app.level2Dict) {
            if (categoryKey.toString() === app.level2) {
                app.level3Dict = app.level2Dict[categoryKey];
                break;
            }
        }
        for (let categoryKey in app.level3Dict) {
            if (categoryKey.toString() === "id") {
                app.id = app.level3Dict[categoryKey];
            }
            else {
                app.level3Strings.push(categoryKey.toString());
            }
        }
        app.level3Selected("ALL_CATEGORIES");


    };
    app.level3Selected = function (selected) {
        app.level3 = selected;
        if (selected === "ALL_CATEGORIES") {
            app.id = app.level3Dict.id;
            return;
        }

        for (let categoryKey in app.level3Dict) {
            if (categoryKey.toString() === app.level3) {
                app.id = app.level3Dict[categoryKey].id;
            }
        }


    };
    $scope.labels = [0,1,2,3,4,5,6];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [ 0 ];
    $scope.onClick = function (points, evt) {
        if (points.length != 0) {
            var index = points[0]._index;
            var url = app.results[index].url;
            $window.open(url.toString(), '_blank');

        }};
    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
    $scope.options = {
        responsive:true,
        tooltips: {
            callbacks: {
                title: function (tooltipItem, data) {
                    return app.results[tooltipItem[0]['index']].title;
                },
                label: function (tooltipItem, data) {
                    return app.results[tooltipItem['index']].attributes.price;
                },
                afterLabel: function (tooltipItem, data) {
                    return app.results[tooltipItem['index']].attributes.type;
                }
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
    // called upon search
    app.searchProduct = function(searchedProduct) {
        $http({
            method: 'POST',
            url: url + '/api/search',
            data: {name: searchedProduct, category: app.id},
        }).then(function (searchResults){
            app.results = searchResults.data;
            $scope.data = [];
            $scope.labels = [];
            for (let i = 0; i < app.results.length; ++i) {
                if (app.results[i].attributes.price != 0) {
                    $scope.data.push(app.results[i].attributes.price);
                }
                else {
                    var removed = app.results.splice(i,1);
                    --i;
                }
            }
            for (let i = 0; i < app.results.length; ++i) {
                $scope.labels.push(i);
            }
        },function (error){

        });
    }
    // initializes categories and other stuff
    function setup() {
        $http({
            method: 'GET',
            url: url + '/api/categories'
        }).then(function (searchResult) {
            app.level1Dict = searchResult.data;

            for (let key in app.level1Dict) {
                app.level1Strings.push(key.toString());

            }
        }, function (error) {

        });
    }
    setup();

});

kGraphs.filter('underscoreless', function () {
    return function (input) {
        return input.replace(/_/g, ' ');
    };
});