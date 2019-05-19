/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */
/* global suite test */

const chaiHttp = require('chai-http');
const chai = require('chai');

const { expect, assert } = chai;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
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
            expect(res.status).to.equal(200);
            expect(res.text, 'Response should warn of missing parameters.').to.equal(
              'missing parameters',
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
            expect(res.status).to.equal(200);
            done();
          });
      });

      test('Post second thread for testing replies', (done) => {
        chai
          .request(server)
          .post('/api/threads/tests')
          .send({ text: 'this is the text for the replies thread', delete_password })
          .end((err, res) => {
            expect(res.status).to.equal(200);
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

            expect(res.status).to.equal(200);
            expect(res.body, 'Response should be an Array.').to.be.an('Array');
            expect(res.body.length, 'Response should have between two and 10 members')
              .to.be.above(1)
              .to.be.below(11);
            expect(res.body[0], 'Response should contain property _id.').to.have.property('_id');
            expect(
              res.body[0],
              'Response should contain text "this is the text for the replies thread".',
            )
              .to.have.property('text')
              .to.be.a('String')
              .to.equal('this is the text for the replies thread');
            expect(res.body[0], 'Response should contain created_on as a Date.')
              .to.have.property('created_on')
              .to.be.a('Date');
            expect(res.body[0], 'Response should contain bumped_on as a Date.')
              .to.have.property('bumped_on')
              .to.be.a('Date');
            expect(res.body[0], 'Response should contain replies as an Array.')
              .to.have.property('replies')
              .to.be.an('Array');
            expect(
              res.body[0].replies.length,
              'Replies array should contain at most 3 replies',
            ).to.be.below(4);
            expect(
              res.body[0],
              'Response should not contain property reported',
            ).to.not.have.property('reported');
            expect(
              res.body[0],
              'Response should not contain property delete_password',
            ).to.not.have.property('delete_password');
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
            expect(res.status).to.equal(200);
            expect(res.text, 'Response should state "success".').to.equal('success');
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
            expect(res.status).to.equal(200);
            expect(res.text, 'Response should state "incorrect password".').to.equal(
              'incorrect password',
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
            expect(res.status).to.equal(200);
            expect(res.text, 'Response should state "success".').to.equal('success');
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
            expect(res.status).to.equal(200);
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

            expect(res.status).to.equal(200);
            expect(res.body, 'Response should be an object.').to.be.an('Object');
            expect(res.body, 'Response should contain property _id.').to.have.property('_id');
            expect(
              res.body,
              'Response should contain text "this is the text for the replies thread".',
            )
              .to.have.property('text')
              .to.be.a('String')
              .to.equal('this is the text for the replies thread');
            expect(res.body, 'Response should contain created_on as a Date.')
              .to.have.property('created_on')
              .to.be.a('Date');
            expect(res.body, 'Response should contain bumped_on as a Date.')
              .to.have.property('bumped_on')
              .to.be.a('Date');
            expect(res.body, 'Response should contain replies as an Array.')
              .to.have.property('replies')
              .to.be.an('Array');
            expect(
              res.body.replies.length,
              'Replies array should contain at least 1 reply',
            ).to.be.above(0);
            expect(res.body.replies[0], 'First reply should contain text "this is the test reply"')
              .to.be.a('String')
              .to.be.equal('this is the test reply');
            expect(res.body, 'Response should not contain property reported').to.not.have.property(
              'reported',
            );
            expect(
              res.body,
              'Response should not contain property delete_password',
            ).to.not.have.property('delete_password');
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
            expect(res.status).to.equal(200);
            expect(res.text, 'Response should state "success"').to.equal('success');
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
            expect(res.status).to.equal(200);
            expect(res.text, 'Response should state "incorrect password".').to.equal(
              'incorrect password',
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
            expect(res.status).to.equal(200);
            expect(res.text, 'Response should state "success"').to.equal('success');
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
          expect(res.status).to.equal(200);
          expect(res.text, 'Response should state success').to.equal('success');
          done();
        });
    });
  });
});
