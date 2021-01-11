const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const commentsService = require('./comments-service');
const commentsRouter = express.Router();
const bodyParser = express.json();

const serializeComment = (comment) => ({
  id: comment.id,
  userId: Number(comment.user_id),
  movieId: Number(comment.movie_id),
  display_name: xss(comment.display_name),
  comment: xss(comment.comment),
});

commentsRouter
  .route('/:movieId')
  .get((req, res, next) => {
    commentsService
      .getAllMovieComments(req.app.get('db'), req.params.movieId)
      .then((comments) => {
        console.log(comments);
        res.json(comments.map(serializeComment));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { displayName, comment, userId, movieId } = req.body;
    const newComment = {
      movie_id: movieId,
      display_name: displayName,
      comment,
      user_id: userId,
    };

    for (const field of ['movie_id', 'display_name', 'comment', 'user_id']) {
      if (!newComment[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `'${field}' is required` },
        });
      }
    }

    commentsService
      .insertComment(req.app.get('db'), newComment)
      .then((comment) => {
        logger.info(`movie with id ${comment.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${comment.id}`))
          .json(serializeComment(comment));
      })
      .catch(next);
  });

commentsRouter.route('/:id/:userId').delete((req, res, next) => {
  const { id, userId } = req.params;
  commentsService
    .deleteCommentFromMovie(req.app.get('db'), id, userId)
    .then((numRowsAffected) => {
      logger.info(`movie with id ${id} deleted.`);
      res.status(204).end();
    })
    .catch(next);
});

module.exports = commentsRouter;
