const mongoose = require('mongoose');

// define the User model schema
const HistorySchema = new mongoose.Schema({
  action: String,
  userbook: String,
  otherbook: String,
  userId: String,
  time: Date
});

module.exports = mongoose.model('history', HistorySchema);