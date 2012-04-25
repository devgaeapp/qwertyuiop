var sys    = require('sys'),
    util = require('util'),
    sqlitedb = require('./sqlitedb');


var db = new sqlitedb.Database();

db.open("storage.db", function(err) {

	var tabledef = {};
	tabledef.__name__ = 'Node';
	tabledef.Type = 'int'; // 0 - post, 1 - status. 2 - author, 3 - image, 4 - comment
	tabledef.Name = 'varchar(512)'; // or Title
	tabledef.Desc = 'varchar(512)'; // Summary
	tabledef.Created = 'int8';
	tabledef.FBId = 'int8';
	tabledef.Temperature = 'int8';
	tabledef.ChildCount = 'int';
	tabledef.UniqueVisitCount = 'int';
	tabledef.AuthorName = 'varchar(128)'

	db.create(tabledef, function (err){ console.log('created Node'); });

	var node2def = {};
	node2def.__name__ = 'Node2';
	node2def.NodeId = 'int';
	node2def.Content = 'text';

	db.create(node2def, function(err) { console.log('created Node2')});
});

// TODO:
// Fix fbId as int
// Fix type as int
