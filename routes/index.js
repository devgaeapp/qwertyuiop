
/*
 * GET home page.
 */

exports.index = function(req, res, cb){
  res.render('index', { title: 'Amarblog' }, cb);
};