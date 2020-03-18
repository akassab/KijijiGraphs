var mongoose = require("mongoose");

module.exports = mongoose.model('Favourite',{
    name: String,
    description: String,
    price: String,
    type: String,
    url: String,
    images: Array
});