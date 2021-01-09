const watchListService = {
  getAllFromWatchList(knex, userId) {
    return knex.from('watchlist').select('*').where('user_id', userId);
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

  deleteMovieFromList(knex, id) {
    console.log(id, 'here mmg');
    return knex('watchlist').where('id', id).delete();
  },
};

module.exports = watchListService;
