var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  //app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'html');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.bodyParser());

  app.use(app.router);
  app.use('/', express.static(path.join(__dirname)));
  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
