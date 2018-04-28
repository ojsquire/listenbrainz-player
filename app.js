var express = require('express');
var XMLHttpRequest = require('xhr2');
var bodyParser = require('body-parser');
var api_key = require('./private');
var mm = require('music-metadata');
var app = express();
var path = require('path');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next){
    res.locals.playing_file = null;
	next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/pages'));

// Send basic index page when client first connects
app.get('/', function(req, res){
	res.render('index')
});

// Return track meta to client
app.post('/', function(req, res){
  var playing_file = req.body.file_name
  mm.parseFile('./public/audio/' + playing_file, {native: true})
  .then(function (metadata) {
    var tags = metadata['common'];
    console.log(playing_file);
	res.render('index', {
		playing_file: playing_file, 
	    artist: tags['artist'],
		release_name: tags['album'],
		track_nr: tags['track']['no'],
		track_tot: tags['track']['of'],
		track_name: tags['title'],
		year: tags['year'],
		artist_mbid: tags['musicbrainz_artistid'],
		release_mbid: tags['musicbrainz_albumid'],
		recording_mbid: tags['musicbrainz_recordingid']
	});
  })
  .catch(function (err) {
    console.error(err.message);
  });
});		

// Post meta to Listenbrainz on play (should add timeout in)
app.post('/lb', function(req, res){
    var stringpf = JSON.stringify(req.body.file_name);
    var playing_file = stringpf.substring(stringpf.lastIndexOf("/")+1).replace(/['"]+/g, '');
    console.log('lb: ' + playing_file);
    mm.parseFile('./public/audio/' + playing_file, {native: true})
  .then(function (metadata) {
    var tags = metadata['common'];
    var xhr = new XMLHttpRequest();
    var url = 'https://api.listenbrainz.org/1/submit-listens'
    var payload = JSON.stringify(
      {"listen_type": "single",
        "payload": [{
          "listened_at": Math.floor(Date.now()/1000),
          "track_metadata": {
            "additional_info": {
              "release_mbid": tags['musicbrainz_albumid'],
              "artist_mbids":	tags['musicbrainz_artistid'],
              "recording_mbid": tags['musicbrainz_recordingid']
            },
            "artist_name": tags['artist'],
            "track_name": tags['title'],
            "release_name": tags['album']
          }
        }]
      }
    )
    console.log('Sending payload to listenbrainz...');
    console.log(payload);
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Authorization', 'OAuth ' + api_key['api_key']);
    xhr.onload = function () {
      console.log(xhr.responseText);
    };
    xhr.send(payload);
  })
  .catch(function (err) {
    console.error(err.message);
  });
});

var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})
