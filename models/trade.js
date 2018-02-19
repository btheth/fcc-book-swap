const mongoose = require('mongoose');

// define the User model schema
const TradeSchema = new mongoose.Schema({
  sourceUserId: String,
  sourceBookId: String,
  targetUserId: String,
  targetBookId: String
});

module.exports = mongoose.model('trades', TradeSchema);