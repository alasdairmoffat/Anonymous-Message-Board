/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */
/* global suite test suiteTeardown */

const chaiHttp = require('chai-http');
const chai = require('chai');

const { assert } = chai;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  suiteTeardown(async () => {
    server.stop();
  });

  const delete_password = 'isadtyrc2n%gbk';
  let threadId1;
  let threadId2;

  suite('API ROUTING FOR /api/threads/:board', () => {
    suite('POST', () => {
      test('missing parameters', (done) => {
        chai
          .request(server)
          .post('/api/threads/tests')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(
              res.text,
              'missing parameters',
              'Response should warn of missing parameters.',
            );
            done();
          });
      });

      test('Post new Thread', (done) => {
        chai
          .request(server)
          .post('/api/threads/tests')
          .send({ text: 'this is the test text', delete_password })
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });

      test('Post second thread for testing replies', (done) => {
        chai
          .request(server)
          .post('/api/threads/tests')
          .send({ text: 'this is the text for the replies thread', delete_password })
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });
    });

    suite('GET', () => {
      test('Get most recent Threads', (done) => {
        chai
          .request(server)
          .get('/api/threads/tests')
          .end((err, res) => {
            threadId1 = res.body[1]._id;
            threadId2 = res.body[0]._id;

            assert.equal(res.status, 200);
            assert.isArray(res.body, 'Response should be an Array.');
            assert.isAtLeast(res.body.length, 2, 'Response should have at least two members');
            assert.isAtMost(res.body.length, 10, 'Response should have at most 10 members');
            assert.property(res.body[0], '_id', 'Response should contain property _id.');
            assert.property(res.body[0], 'text', 'Response should contain property text.');
            assert.equal(
              res.body[0].text,
              'this is the text for the replies thread',
              'Response text should be "this is the text for the replies thread".',
            );
            assert.property(
              res.body[0],
              'created_on',
              'Response should contain property created_on',
            );
            assert.property(res.body[0], 'bumped_on', 'Response should contain property bumped_on');
            assert.property(res.body[0], 'replies', 'Response should contain property replies.');
            assert.isArray(res.body[0].replies, 'Replies should be an Array');
            assert.isAtMost(
              res.body[0].replies.length,
              3,
              'Replies array should contain at most 3 replies',
            );
            assert.notProperty(
              res.body[0],
              'reported',
              'Response should not contain property reported',
            );
            assert.notProperty(
              res.body[0],
              'delete_password',
              'Response should not contain property delete_password',
            );
            done();
          });
      });
    });

    suite('PUT', () => {
      test('report a thread', (done) => {
        chai
          .request(server)
          .put('/api/threads/tests')
          .send({ thread_id: threadId1 })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success', 'Response should state "success".');
            done();
          });
      });
    });

    suite('DELETE', () => {
      test('incorrect delete_password', (done) => {
        chai
          .request(server)
          .delete('/api/threads/tests')
          .send({ thread_id: threadId1, delete_password: 'wrong password' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(
              res.text,
              'incorrect password',
              'Response should state "incorrect password".',
            );
            done();
          });
      });

      test('successful delete', (done) => {
        chai
          .request(server)
          .delete('/api/threads/tests')
          .send({ thread_id: threadId1, delete_password })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success', 'Response should state "success".');
            done();
          });
      });
    });
  });

  suite('API ROUTING FOR /api/replies/:board', () => {
    let reply_id;

    suite('POST', () => {
      test('Post new reply to existing thread.', (done) => {
        chai
          .request(server)
          .post('/api/replies/tests')
          .send({ thread_id: threadId2, delete_password, text: 'this is the test reply' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });
    });

    suite('GET', () => {
      test('Get replies from existing thread', (done) => {
        chai
          .request(server)
          .get('/api/replies/tests')
          .query({ thread_id: threadId2 })
          .end((err, res) => {
            reply_id = res.body.replies[0]._id;

            assert.equal(res.status, 200);
            assert.isObject(res.body, 'Response should be an object.');
            assert.property(res.body, '_id', 'Response should contain property _id.');
            assert.property(res.body, 'text', 'Response should contain property text.');
            assert.equal(
              res.body.text,
              'this is the text for the replies thread',
              'Text should be "this is the text for the replies thread"',
            );
            assert.property(res.body, 'created_on', 'Response should contain property created_on.');
            assert.property(res.body, 'bumped_on', 'Response should contain property bumped_on.');
            assert.property(res.body, 'replies', 'Response should contain property replies.');
            assert.isArray(res.body.replies, 'Replies should be an Array');
            assert.isAtLeast(
              res.body.replies.length,
              1,
              'Replies array should contain at least 1 reply',
            );
            assert.property(
              res.body.replies[0],
              'text',
              'First reply should contain property text.',
            );
            assert.equal(
              res.body.replies[0].text,
              'this is the test reply',
              'First reply text should be "this is the test reply"',
            );
            assert.notProperty(
              res.body,
              'reported',
              'Response should not contain property reported',
            );
            assert.notProperty(
              res.body,
              'delete_password',
              'Response should not contain property delete_password',
            );
            done();
          });
      });
    });

    suite('PUT', () => {
      test('report a reply', (done) => {
        chai
          .request(server)
          .put('/api/replies/test')
          .send({ thread_id: threadId2, reply_id })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success', 'Response should state "success"');
            done();
          });
      });
    });

    suite('DELETE', () => {
      test('incorrect delete_password', (done) => {
        chai
          .request(server)
          .delete('/api/replies/tests')
          .send({ thread_id: threadId2, reply_id, delete_password: 'wrong password' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(
              res.text,
              'incorrect password',
              'Response should state "incorrect password".',
            );
            done();
          });
      });

      test('successful delete', (done) => {
        chai
          .request(server)
          .delete('/api/replies/tests')
          .send({ thread_id: threadId2, reply_id, delete_password })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success', 'Response should state "success"');
            done();
          });
      });
    });
  });

  suite('Final cleanup', () => {
    test('delete remianing thread', (done) => {
      chai
        .request(server)
        .delete('/api/threads/tests')
        .send({ thread_id: threadId2, delete_password })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success', 'Response should state success');
          done();
        });
    });
  });
});
