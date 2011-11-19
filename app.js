
/**
 * Module dependencies.
 */

var express = require('express')
  , url = require('url')
  , fs = require('fs')
  , http = require('http');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  //app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'THE LINE MUST BE DRAWN HERE' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var images = fs.readdirSync(__dirname + '/public/user_images/');

// Routes

app.get('/', function(req, res) {
  res.render('index', {images: images});
});

app.post('/upload', function(req, res) {
  var image_url = req.body.url;
  var url_path = url.parse(image_url).path;
  var file_path = url_path.substr(url_path.lastIndexOf('/') + 1);
  images.push(file_path);

  function send_response() {
    res.send("<div id='image'><img src='/user_images/"+file_path+"' /></div>");
  }
  var options = {
    hostname: url.parse(image_url).hostname,
    port: 80,
    path: url_path
  };
  http.get(options, function(res) {
    var fileStream = fs.createWriteStream(__dirname + '/public/user_images/'+file_path);
    res.pipe(fileStream).on('close', send_response);
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
