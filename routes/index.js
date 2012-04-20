
/*
 * GET home page.
 */

exports.index = function(req, res, nodes, cb){
  res.render('index', { title: 'Amarblog', nodes : nodes }, cb);
};