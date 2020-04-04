/*
 *
 *
 *       Complete the API routing below
 *
 *
 */
/* eslint-disable camelcase */

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

dotenv.config();

const { modelThread } = require('../models/Schema');
const { modelReply } = require('../models/Schema');

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(console.log('MongoDB connected'))
  .catch(err => console.log(err));

module.exports = (app) => {
  app
    .route('/api/threads/:board')

    .get(async (req, res) => {
      const { board } = req.params;
      const Thread = modelThread(board);
      const threads = await Thread.find(
        {},
        {
          reported: 0,
          delete_password: 0,
          'replies.reported': 0,
          'replies.delete_password': 0,
          __v: 0,
          replies: { $slice: -3 },
        },
      )
        .sort('-bumped_on')
        .limit(10);

      res.json(threads);
    })

    .post(async (req, res) => {
      const { board } = req.params;
      const { text, delete_password } = req.body;

      if (!(text && delete_password)) {
        res.send('missing parameters');
      } else {
        const Thread = modelThread(board);
        const hash = await bcrypt.hash(delete_password, 12);
        const newThread = new Thread({ text, delete_password: hash });
        const data = await newThread.save();
        res.redirect(`/b/${board}`);
      }
    })

    .delete(async (req, res) => {
      const { board } = req.params;
      const { thread_id, delete_password } = req.body;

      if (!(thread_id && delete_password)) {
        res.send('missing parameters');
      } else {
        const Thread = modelThread(board);
        const thread = await Thread.findById(thread_id);
        const hash = thread.delete_password;
        const isMatch = await bcrypt.compare(delete_password, hash);

        if (isMatch) {
          const success = await Thread.findByIdAndDelete(thread_id);
          res.send('success');
        } else {
          res.send('incorrect password');
        }
      }

      const Thread = modelThread(board);
    })

    .put(async (req, res) => {
      const { board } = req.params;
      const { thread_id } = req.body;

      const Thread = modelThread(board);
      await Thread.findByIdAndUpdate(thread_id, { reported: true });
      res.send('success');
    });

  app
    .route('/api/replies/:board')

    .get(async (req, res) => {
      const { board } = req.params;
      const { thread_id } = req.query;

      const Thread = modelThread(board);
      const thread = await Thread.findById(thread_id, {
        reported: 0,
        delete_password: 0,
        'replies.reported': 0,
        'replies.delete_password': 0,
        __v: 0,
      });

      res.json(thread);
    })

    .post(async (req, res) => {
      const { board } = req.params;
      const { text, delete_password, thread_id } = req.body;

      if (!(text && delete_password && thread_id)) {
        res.send('missing parameters');
      } else {
        const Reply = modelReply(board);
        const Thread = modelThread(board);
        const hash = await bcrypt.hash(delete_password, 12);

        const newReply = new Reply({ text, delete_password: hash });
        const thread = await Thread.findByIdAndUpdate(thread_id, {
          $push: { replies: newReply },
          bumped_on: Date.now(),
        });

        res.redirect(`/b/${board}/${thread_id}`);
      }
    })

    .delete(async (req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id, delete_password } = req.body;

      if (!(thread_id && reply_id && delete_password)) {
        res.send('missing parameters');
      } else {
        const Thread = modelThread(board);

        const thread = await Thread.findOne(
          { _id: thread_id, 'replies._id': reply_id },
          { 'replies.$.delete_password': 1 },
        );
        const hash = thread.replies[0].delete_password;
        const isMatch = await bcrypt.compare(delete_password, hash);

        if (isMatch) {
          const updatedThread = await Thread.findOneAndUpdate(
            { _id: thread_id, 'replies._id': reply_id },
            { 'replies.$.text': '[deleted]' },
            { new: true },
          );

          res.send('success');
        } else {
          res.send('incorrect password');
        }
      }
    })

    .put(async (req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id } = req.body;

      const Thread = modelThread(board);
      const thread = await Thread.findOneAndUpdate(
        { _id: thread_id, 'replies._id': reply_id },
        { 'replies.$.reported': true },
        { new: true },
      );

      res.send('success');
    });
};
