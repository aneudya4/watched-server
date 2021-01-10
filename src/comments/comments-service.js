const commentsService = {
  getAllMovieComments(knex, movieId) {
    return knex.from('watchlist').select('*').where('movie_id', movieId);
  },
  insertComment(knex, newComment) {
    return knex
      .insert(newComment)
      .into('watchlist')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },

  deleteCommentFromMovie(knex, id) {
    return knex('watchlist').where('id', id).delete();
  },
};

module.exports = commentsService;
