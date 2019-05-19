const mongoose = require('mongoose');

const { Schema } = mongoose;

const replySchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  delete_password: {
    type: String,
    required: true,
  },
  created_on: {
    type: Date,
    default: Date.now,
  },
  reported: {
    type: Boolean,
    default: false,
  },
});

function modelReply() {
  return mongoose.model('Reply', replySchema);
}
module.exports = modelReply;
