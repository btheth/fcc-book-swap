const mongoose = require('mongoose');

// define the User model schema
const BookSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  imageurl: String,
  tradeable: Boolean,
  userId: String
});

module.exports = mongoose.model('books', BookSchema);