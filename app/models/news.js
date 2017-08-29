var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var NewsSchema = new Schema({
  title: {
    type: String
  },
  text: {
    type: String
  },
  date: {
    type: String
  },
  baseImg: {
    type: String
  }
});

module.exports = mongoose.model('News', NewsSchema);
