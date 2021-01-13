const watchListService = {
  getAllFromWatchList(knex, userId) {
    const results = knex.from('watchlist').select('*').where('user_id', userId);
    console.log(results, 'aqui mmg');
    return results;
  },
  insertMovie(knex, newMovie) {
    return knex
      .insert(newMovie)
      .into('watchlist')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },

  deleteMovieFromList(knex, movieId, userId) {
    return knex('watchlist')
      .where('movie_id', movieId)
      .andWhere('user_id', userId)
      .delete();
  },
};

module.exports = watchListService;
