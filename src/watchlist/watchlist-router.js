const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const watchListService = require('./watchlist-service');
const watchListRouter = express.Router();
const bodyParser = express.json();

const serializeMovies = (movie) => ({
  id: movie.id,
  userId: xss(movie.user_id),
  movieId: Number(movie.movie_id),
  title: xss(movie.title),
  release_date: xss(movie.release_date),
  runtime: xss(movie.runtime),
  status: xss(movie.status),
  poster_path: xss(movie.poster_path),
  genres: movie.genres,
});

watchListRouter
  .route('/:userId')
  .get((req, res, next) => {
    watchListService
      .getAllFromWatchList(req.app.get('db'), req.params.userId)
      .then((watchList) => {
        res.json(watchList.map(serializeMovies));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const {
      movieId,
      title,
      release_date,
      runtime,
      status,
      poster_path,
      genres,
      userId,
    } = req.body;
    const newMovie = {
      movie_id: movieId,
      title,
      release_date,
      runtime,
      status,
      poster_path,
      genres,
      user_id: userId,
    };
    console.log(newMovie, 'ESTE MMG');

    for (const field of [
      'movie_id',
      'title',
      'release_date',
      'runtime',
      'status',
      'poster_path',
      'genres',
    ]) {
      if (!newMovie[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `'${field}' is required` },
        });
      }
    }

    watchListService
      .insertMovie(req.app.get('db'), newMovie)
      .then((movie) => {
        logger.info(`movie with id ${movie.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${movie.id}`))
          .json(serializeMovies(movie));
      })
      .catch(next);
  });

watchListRouter.route('/:movieId/:userId').delete((req, res, next) => {
  const { movieId, userId } = req.params;
  watchListService
    .deleteMovieFromList(req.app.get('db'), movieId, userId)
    .then((numRowsAffected) => {
      logger.info(`movie with id ${movieId} for userId ${userId} deleted.`);
      res.status(204).end();
    })
    .catch(next);
});

module.exports = watchListRouter;
