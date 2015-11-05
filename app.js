var express = require('express');
var marklogic = require('marklogic');
var app = express();
var router = express.Router();

var host = 'localhost';
var port = 5002;
var user = 'admin';
var password = 'admin';

var connection = {
  host: host,
  port: port,
  user: user,
  password: password
};

var db = marklogic.createDatabaseClient(connection);
var qb = marklogic.queryBuilder;

var mmm = require('mmmagic');
var Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE);

var displayImage = function(req, res) {
  if (req.url !== '/favicon.ico') {
    var uri = '/' + req.params['0'];
    var chunkedData = [];
    var buf = [];
    db.documents.read(uri).stream('chunked')
    .on('data', function(chunk) {
      chunkedData.push(chunk);
    })
    .on('error', function(error) {
      console.log(error);
    })
    .on('end', function() {
      buf = Buffer.concat(chunkedData);
      magic.detect(buf, function(error, result) {
        if (error) {
          console.log(error);
        }
        res.writeHead(200, { 'Content-type': 'image/jpeg' });
        res.end(buf);
      });
    });
  }
};

router.route('/*').get(displayImage);
app.use('/', router);
app.set('port', 3000);

app.listen(app.get('port'));
console.log('Magic happens on port ' + app.get('port'));
