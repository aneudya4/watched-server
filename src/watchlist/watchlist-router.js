const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const WatchListService = require('./watchlist-service');
const watchListRouter = express.Router();
const bodyParser = express.json();

const serializeMovies = (movie) => ({
  id: movie.id,
  userId: Number(movie.user_id),
  movieId: Number(movie.movie_id),
  title: xss(movie.title),
  release_date: xss(movie.release_date),
  runtime: xss(movie.runtime),
  status: xss(movie.status),
  poster_path: xss(movie.poster_path),
  genres: movie.genres,
});

watchListRouter.route('/:userId').get((req, res, next) => {
  WatchListService.getAllFromWatchList(req.app.get('db'), req.params.userId)
    .then((watchList) => {
      res.json(watchList.map(serializeMovies));
    })
    .catch(next);
});

watchListRouter.route('/').post(bodyParser, (req, res, next) => {
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
    movieId,
    title,
    release_date,
    runtime,
    status,
    poster_path,
    genres,
    userId,
  };

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

  WatchListService.insertMovie(req.app.get('db'), req.body.userId, newMovie)
    .then((movie) => {
      logger.info(`movie with id ${movie.id} created.`);
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `${movie.id}`))
        .json(serializeMovies(movie));
    })
    .catch(next);
});
watchListRouter.route('/:id').delete((req, res, next) => {
  const { id } = req.params;
  WatchListService.deleteMovieFromList(req.app.get('db'), id)
    .then((numRowsAffected) => {
      logger.info(`movie with id ${id} deleted.`);
      res.status(204).end();
    })
    .catch(next);
});

module.exports = watchListRouter;
