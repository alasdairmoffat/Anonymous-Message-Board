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

const threadSchema = new Schema({
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
  bumped_on: {
    type: Date,
    default: Date.now,
  },
  reported: {
    type: Boolean,
    default: false,
  },
  replies: {
    type: [replySchema],
  },
});

function modelThread(collection) {
  return mongoose.model('Thread', threadSchema, collection);
}

function modelReply() {
  return mongoose.model('Reply', replySchema);
}

module.exports = { modelThread, modelReply };
