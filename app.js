
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , ejs = require('ejs');

var redis = require("redis"),
    client = redis.createClient();

var sqlite = require('./lib/sqlite/sqlite');
var http = require('http');
var request = require('request');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.post('/sync', function(req, res){
	// res.end('hi: ' + JSON.stringify(req.body));
    var token = req.body.accessToken;
    sync(token, function (err, r) {
      if (err != null) {
        res.end('error');
      } else {
	     res.end(r);
      }
	});
});

app.get('/', function(req, res){
  routes.index(req, res, function(err, html) {
    res.end(html);
  });
});


app.listen(8000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

function logError(e) {
    console.log(e);
}

function getUser(accessToken, cb) {
    client.hget("at", accessToken, errorCheck(cb, function(r) {
      if (r == null) {
        getUserFromFacebook(accessToken, cb);
      } else {
        console.log('loaded from redis');
        cb(null, r);
      } 
    }));
}

function getUserFromFacebook(accessToken, cb) {
    request('https://graph.facebook.com/me?access_token=' + accessToken, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
		    var resp = JSON.parse(body);
		    client.set("at", accessToken, resp.id, function (err, r) {
		      cb(null, resp.id);
		      });
	    } else {
		    cb(error, null);
	    }
	});
}

function errorCheck(cb, f) {
  return function (e, r) {
    if (e != null) {
      logError(e);
      cb(e, null);
    }
    else f(r);  
  };
}

function sync(accessToken, cb) {
    getUser(accessToken, errorCheck(cb, function(r) {
      console.log(r);
      getUserBlob(r, cb);
    }));
}

function defHGet(key, field, cbHit, cbMiss) {
  client.hget(key, field, errorCheck(function(r) {
    if (r == null) {
      cbMiss(cbHit);
    } else {
      cbHit(r);
    }
  }));
}

function getUserBlob(u, cb) {
  defHGet("u", u, function(cbHit) {
    var blob = {
      m : 4,
      d : 2,
      f : 3
    };

    cbHit(blob);

  }, function(r) {
    cb(null, r);
  });  
}


