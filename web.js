var express = require('express');
var fs = require('fs');
var index = fs.readFileSync('index.html');

var app = express.createServer();

// configure Express
app.configure(function() {
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/static'));
});

app.get('/', function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end(index);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});