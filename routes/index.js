
/*
 * GET home page.
 */

function strencode( data ) {
  return unescape( encodeURIComponent( JSON.stringify( data ) ) );
}

function strdecode( data ) {
  return JSON.parse( decodeURIComponent( escape ( data ) ) );
}

exports.index = function(req, res, nodes, cb){
  console.log('encoding');
  var eNodes = strencode(nodes);
  console.log(eNodes);
  res.render('index', { title: 'Amarblog2', nodes : JSON.parse(eNodes) }, cb);
};