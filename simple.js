var http = require('http');
var fs = require('fs');


http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

	fs.readFile('/tmp/test', function(err,data){
    if(err) {
    console.error("Could not open file: %s", err);
    }
    // res.setEncoding('utf8');
    var str = '\u09a4\u09b7';
    res.end(str);
    });



	//	res.end('Hello World\n');
    }).listen(8000);
console.log('Server running at http://127.0.0.1:1337/');