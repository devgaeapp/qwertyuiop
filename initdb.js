var sys    = require('sys'),
    util = require('util'),
    sqlitedb = require('./sqlitedb');


var db = new sqlitedb.Database();

db.open("storage.db", function(err) {

	var tabledef = {};
	tabledef.__name__ = 'Node';
	tabledef.Type = 'int'; // 0 - post, 1 - status. 2 - author, 3 - image, 4 - comment
	tabledef.Name = 'varchar(512)'; // or Title
	tabledef.Desc = 'text';
	tabledef.Created = 'datetime';
	tabledef.FBId = 'int';
	tabledef.Temperature = 'int';
	tabledef.ChildCount = 'int';
	tabledef.UniqueVisitCount = 'int';

	db.create(tabledef, function (err){ console.log('created Node'); });

	var item = {};
	item.__table__ = 'Node';
	item.Name = 'Hi';
	item.Desc = 'OK';

	// db.addRow(item, function (err) { console.log('added');});
});

// TODO:
// Fix fbId as int
// Fix type as int
