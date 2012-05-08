
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

var fs = require('fs');
var async = require('async');

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
	  var token = req.body.accessToken;
    sync(token, function (err, r) {
      if (err != null) {
        res.end('error');
      } else {
	     res.end(r);
      }
	});
});

app.post('/gettopics', function(req, res){
    res.end("{ 't' : ['xyz', 'jkl', 'pqr']}");
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

      savePost(nodeType, name, desc, fbId, errorCheckRespond(res, function(resBlob) {
        res.end(resBlob);
      }));
    }));
});

app.get('/', function(req, res){  
	getPageCached(res, 'page', 'main', 10, function(cb) {
    db.execute('select * from Node where type = 0 order by Temperature desc', function(err, rows) {
      routes.index(req, res, rows, cb);
    });
  });
});


app.get('/post/:id', function(req, res) {
  getPageCached(res, 'content', req.params.id, 30 * 60, function(cb) {
    db.execute('select * from Node2 where NodeId = "' + req.params.id + '"', errorCheck(cb, function(rows) {
      if (rows.length > 0) {
        var row = rows[0];
        cb(null, row.Content);
      } else {
        cb(null, 'cant load details.');
      }
    }));
  });
});

app.post('/post/:id', function(req, res) {
  getPageCached(res, 'content', req.params.id, 30 * 60, function(cb) {
    db.execute('select * from Node2 where NodeId = "' + req.params.id + '"', errorCheck(cb, function(rows) {
      if (rows.length > 0) {
        var row = rows[0];
        cb(null, row.Content);
      } else {
        cb(null, 'cant load details.');
      }
    }));
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
      cb(null, r);
    }));
}

function getUserFromDB(userId, cb) {
    console.log('getuserfromdb');
    db.execute('select * from Node where type = 2 and FBId = ' + userId, errorCheck(cb, function (rows) {
    if (rows.length <= 0) cb (null, null);
    else {
     
      var row = rows[0];
      u = {
	  Name: row.Name
      }

      cb(null, u);
    }  
	    }));
}

function saveUserIntoDB(fbUserBlob, cb) {
    console.log('saveuserfromdb');

    addDBNode(2, fbUserBlob.name, fbUserBlob.link, fbUserBlob.id, '',  function(err) {
    cb(err, fbUserBlob.id);
  });  
}

function getUserInfo(userId, cb) {
  defHGet("u", userId, function (cbHit) {
    getUserFromDB(userId, function(err, u) {
        cbHit(err, u);
      });
    }, errorCheck(cb, function(u) {
      if (u != null) {
        user = {
	    Id: userId,
          Name: u.Name
        };

        cb(null, user);
      } else {
        cb('user not found', null);
      }
    }));
}

function getUserFromFacebook(accessToken, cb) {
    request('https://graph.facebook.com/me?access_token=' + accessToken, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
		    var resp = JSON.parse(body);
		    defHGet("u", resp.id, function (cbHit) {
          getUserFromDB(resp.id, errorCheck(cb, function(u) {
            var save = false;
            if (u == null) {
              u = {
		            Name: resp.name
              };

              save = true;
	           console.log('user not found in db');
            }

            defHSet("u", resp.Id, u, 30 * 60, errorCheck(cb, function(r) {  
              if (save) saveUserIntoDB(resp, cbHit);
              else cbHit(null, u);
            }));
          }));
        }, errorCheck(cb, function(r) {
          defHSet("at", accessToken, resp.id, 30 * 60, errorCheck(cb, function(r) {
            cb(null, resp.id);
          }));
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
      getUserBlob(r, cb);
    }));
}

function defHSet(key, field, value, expire, cb) {
  var hkey = key + '_' + field;
  client.set(hkey, value, function(err, r) {
    if (expire > 0) {
      client.expire(hkey, expire, cb);
    } else {
      cb(err, r);
    }
  });
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

function addDBNode(type, name, desc, fbId, authorName, cb) {

  var time = new Date().getTime().toString();
  var id = fbId.toString() + "_" + time;

  var row = {
    __table__ : "Node",
    Id: id,
    Type : type,
    Name : name,
    Desc : desc,
    Created : time,
    FBId : fbId.toString(),
    Temperature : time,
    ChildCount : 0,
    UniqueVisitCount : 0,
    AuthorName : authorName
  };

  db.addRow(row, errorCheck(cb, function(r) {
    cb(null, id);
	  }));
}

function savePost(type, title, content, fbId, cb) {
  getUserInfo(fbId, errorCheck(cb, function(u) {
    var summary;
    var createNode2 = false;
    if (content.length > 510) {
      summary = content.substring(0, 510);
      createNode2 = true;  
    } 
    else summary = content;  

    if (u.Name == null) {
	cb('Must have author name, bug somewhere!', null);
	return;
    }

    addDBNode(type, title, summary, fbId, u.Name, errorCheck(cb, function(id) {
      if (createNode2) {
        var node2 = {
          __table__ : "Node2",
          NodeId : id,
          Content : content
        };

        db.addRow(node2, errorCheck(cb, function(r) {
          cb (null, id);
        }));
      } else {
        cb (null, id);
      }
    }));
  }));
}

function getPageCached(res, key, value, expiry, cbPageCreate) {
  defHGet(key, value, function(cbHit) {
    console.log(key + '_' + value + ' cache missed');
    
    cbPageCreate(function(err, html) {
      console.log('page created, err = ' + err);
      if (err != null) cbHit(err, null);
      else {
        defHSet(key, value, html, expiry, function(err, r) {
          console.log('page saved');
          cbHit(err, html);  
        });
      }  
    });
  }, function (err, html) {
      console.log(key + '_' + value + ' cache hit');
      if (err != null) {
    	  console.log(err);
        res.end('Site is probably down, it should come back at some time, if not call this guy admin@amarblog.com');
      } else {
	    res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);  
    }
  });
}