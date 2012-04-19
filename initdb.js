var sys    = require('sys'),
    util = require('util'),
    sqlitedb = require('./sqlitedb');


var db = new sqlitedb();

db.open("storage.db", errCheck(function() {

	var tabledef = {};
	tabledef.__name__ = 'Node';
	tabledef.Type = 'int'; // 0 - post, 1 - status. 2 - author, 3 - image, 4 - comment
	tabledef.Name = 'varchar(512)'; // or Title
	tabledef.Desc = 'text';
	tabledef.Created = 'datetime';
	tabledef.FBId = 'int';

	db.create(tabledef, errCheck(function (){ console.log('created Node'); }));
}));
