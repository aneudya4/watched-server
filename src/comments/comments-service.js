const commentsService = {
  getAllMovieComments(knex, movieId) {
    return knex.from('comments').select('*').where('movie_id', movieId);
  },
  insertComment(knex, newComment) {
    return knex
      .insert(newComment)
      .into('comments')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },

  deleteCommentFromMovie(knex, id, userId) {
    return knex('comments')
      .where('id', id)
      .andWhere('user_id', userId)
      .delete();
  },
};

module.exports = commentsService;
