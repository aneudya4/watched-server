const app = require('../src/app');
const knex = require('knex');
const { makeWatchlistArray } = require('./watched.fixtures');
describe('App', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.DATABASE_URL,
    });
    app.set('db', db);
  });
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(200, 'Hello, world!');
  });

  describe('GET /api/watchlist/', () => {
    it('GET /api/watchlist/:userId', () => {
      const demoWatchlist = makeWatchlistArray();
      return supertest(app)
        .get('/api/watchlist/123456')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, JSON.stringify(demoWatchlist));
    });
  });

  it(`responds with 200 and an empty list`, () => {
    return supertest(app)
      .get('/api/watchlist/12999999')
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(200, []);
  });

  describe('DELETE /:movieId/:userId', () => {
    context(`Given  movies on watchlist`, () => {
      it(`responds 204 when movie was deleted`, () => {
        return supertest(app)
          .delete(`/api/watchlist/987777/123456`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204);
      });
    });

    it(`responds 204 no content when user doesnt exist `, () => {
      return supertest(app)
        .delete(`/api/watchlist/577922/1255456'`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(204);
    });
  });
});
