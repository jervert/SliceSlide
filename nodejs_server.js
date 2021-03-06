var http = require('http');
var fs = require('fs');
var path = require('path');
var port = 6543;
 
http.createServer(function (request, response) {
 
    console.log('request starting...');
     
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './slice_slide_example.html';
         
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.jpg':
            contentType = 'image/jpeg';
            break;
				case '.gif':
            contentType = 'image/gif';
            break;
				case '.png':
            contentType = 'image/png';
            break;
				case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
     
    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
     
}).listen(port);
 
console.log('Server running at http://localhost:'+port+'/');