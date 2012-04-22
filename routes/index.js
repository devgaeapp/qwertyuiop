
/*
 * GET home page.
 */


exports.index = function(req, res, nodes, cb){
  res.render('index', { title: 'Amarblog2', nodes : nodes }, cb);
};