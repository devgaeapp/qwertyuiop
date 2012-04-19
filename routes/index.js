
/*
 * GET home page.
 */

exports.index = function(req, res, title, cb){
  res.render('index', { title: title }, cb);
};