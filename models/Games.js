const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GamesSchema = new Schema({
  nameHuman: {
    type: String
  },
  gameName: {
    type: String
  },
  points: {
    type: Array
  }
})

module.exports = mongoose.model('games', GamesSchema);