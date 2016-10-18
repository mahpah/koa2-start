import 'babel-polyfill';
import request from 'supertest';
import app from '../../app';
import { User } from '../../app/models/user.js';
import { expect } from 'chai';

let server = app.listen();

/**
 * Assume user models is completed.
 */

describe('Api authenticaion', () => {
  let userId;
  let username = 'kristin';
  let password = 'secret';

  before(async () => {
    let user = new User({ username, password });
    await user.save();
    userId = user.id;
  });

  after(async () => {
    await User.remove(userId);
  });

  describe('Generate access token', () => {
    it('should provide user access token', async () => {
      await request.agent(server)
        .post('/authenticate')
        .set('Accept', 'application/json')
        .send({
          username,
          password,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.access_token).to.exist;
          expect(body.username).to.exist;
          expect(body.username).to.equal(username);
          expect(body.id).to.exist;
        });
    });

    it('should not authenticate user with wrong password', async () => {
      await request.agent(server)
        .post('/authenticate')
        .set('Accept', 'application/json')
        .send({
          username,
          // eslint-disable-next-line
          password: password + 'asrts',
        })
        .expect({
          message: 'Wrong username or password',
        });
    });
  });

  describe('Using access token', () => {
    let token;
    let returnUserId;

    before(async () => {
      await request.agent(server)
        .post('/authenticate')
        .set('Accept', 'application/json')
        .send({
          username,
          password,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.access_token).to.exist;
          token = body.access_token;
          returnUserId = body.id;
        });
    });

    it('should verify access token', async () => {
      await request.agent(server)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect(({ body }) => {
          expect(body.username).to.equal(username);
          expect(body.id).to.equal(returnUserId);
        });
    });

    it('should refresh access token', async () => {
      await request.agent(server)
        .get(`/refresh_token?access_token=${token}`)
        .set('Content-type', 'application/json')
        .expect(200)
        .expect(({ body }) => {
          expect(body.access_token).to.exist;
          expect(body.username).to.equal(username);
          expect(body.id).to.equal(returnUserId);
        });
    });
  });
});
