
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , ejs = require('ejs');

var redis = require("redis"),
    client = redis.createClient();

var sqlitedb = require('./sqlitedb');
var http = require('http');
var request = require('request');

var sys = require('sys'),
    util = require('util');


var db = new sqlitedb.Database();
db.open("storage.db", function(err) {
    if (err) console.log(err);
  });

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

app.post('/postdata', function(req, res){
  
    var token = req.body.accessToken;
    
    getUser(token, errorCheckRespond(res, function(userId) {
      var nodeType = 0;
      var name = '';
      var desc = '';
      var fbId = userId;

      var type = req.body.type;

      if (type == 'status') {
        nodeType = 1;
        name = req.body.statusText;
        desc = '';
      } else if (type == 'blog') {
        nodeType = 0;
        name = req.body.title;
        desc = req.body.content;
      }

      saveNewNode(nodeType, name, desc, fbId, errorCheckRespond(res, function(resBlob) {
        res.end(resBlob);
      }));
    }));
});

app.get('/', function(req, res){
  routes.index(req, res, 'amarblog', function(err, html) {
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
    defHGet("at", accessToken, function (cbHit) {
      getUserFromFacebook(accessToken, cbHit);
    }, errorCheck(cb, function(r) {
      cb(null, parseInt(r));
    }));
}

function getUserFromFacebook(accessToken, cb) {
    request('https://graph.facebook.com/me?access_token=' + accessToken, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
		    var resp = JSON.parse(body);
		    defHSet("at", accessToken, resp.id, errorCheck(cb, function(r) {
          cb(null, parseInt(resp.id);
        }));
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

function errorCheckRespond(res, f) {
  return function (e, r) {
    if (e != null) {
      logError(e);
      res.end('error');
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

function defHSet(key, field, value, cb) {
  client.set(key + '_' + field, value, cb);
}

function defHGet(key, field, cbMiss, cbHit) {
    client.get(key + '_' + field, errorCheck(cbHit, function(r) {
	  if (r == null) {
      cbMiss(cbHit);
    } else {
      cbHit(null, r);
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

    cbHit(null, blob);

  }, errorCheck(cb, function(r) {
	  cb(null, JSON.stringify(r));
  }));  
}

function addDBNode(type, name, desc, fbId, cb) {
  var row = {
    __table__ : "Node",
    Type : type,
    Name : name,
    Desc : desc,
    Created : new Date().getTime(),
    FBId : fbId,
    Temperature : new Date().getTime(),
    ChildCount : 0,
    UniqueVisitCount : 0 
  }

  db.addRow(row, cb);
}

function saveNewNode(type, name, desc, fbId, cb) {
  addDBNode(type, name, desc, fbId, function(err) {
    console.log('status saved.');
    cb(err, 'saved');
  });
}
