var sys    = require('sys'),
    util = require('util'),
    sqlite = require('./lib/sqlite/sqlite');

var sqlitedb = exports.sqlitedb = function () {
    var self = this;

    console.log('hello');
    var db = new sqlite.Database();
    db.__proto__ = sqlitedb.prototype;

    return db;
};

sqlitedb.prototype = {
    __proto__: sqlite.Database.prototype,
    constructor: sqlitedb,
};

sqlitedb.prototype.createTable = function(tableName, tableDef, cb) {
    var sql = 'CREATE TABLE ' + tableName + '(';
    var first = true;

    for(var prop in tableDef) {
	if(tableDef.hasOwnProperty(prop)) {
	    console.log(util.inspect(prop) + '=' + util.inspect(tableDef[prop]));
	    
	    if (first) first = false;
            else sql += ', ';

	    var val = tableDef[prop];
	    if (typeof(val) == 'object') {
		sql += prop + ' ' + val.type;
	    } else {
		sql += prop + ' ' + val;
	    }
	}	    
    }

    sql = sql + ');';
    console.log(sql);
    this.executeScript(sql, cb);
};

sqlitedb.prototype.create = function (def, cb) {
    var sql = 'CREATE TABLE ' + def.__name__ + ' (';

    var first = true;

    for(var prop in def) {
	if (prop == '__name__') continue;

        if(def.hasOwnProperty(prop)) {
            console.log(util.inspect(prop) + '=' + util.inspect(def[prop]));

            if (first) first = false;
            else sql += ', ';

            var val = def[prop];
            if (typeof(val) == 'object') {
                sql += prop + ' ' + val.type;
            } else {
                sql += prop + ' ' + val;
            }
        }
    }

    sql = sql + ');';
    console.log(sql);
    
    this.executeScript(sql, cb);

};

sqlitedb.prototype.addRow = function (row, cb) {
    var sql = 'INSERT INTO ' + row.__table__;

    var cols = '';
    var values = '';
    var first = true;

    for(var prop in row) {
        if (prop == '__table__') continue;

        if(row.hasOwnProperty(prop)) {
            console.log(util.inspect(prop) + '=' + util.inspect(row[prop]));

            if (first) first = false;
            else {
		cols += ', ';
		values += ', ';
	    }

            var val = row[prop];
            cols += prop;
	    values += "'" + val + "'";
        }
    }

    sql = sql + '(' + cols + ') VALUES (' + values + ');';
    console.log(sql);

    this.executeScript(sql, cb);

};

