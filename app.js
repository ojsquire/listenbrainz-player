var express = require('express');
var XMLHttpRequest = require('xhr2');
var bodyParser = require('body-parser');
var api_key = require('./private');
var app = express();
var mm = require('music-metadata');
const util = require('util')
 
// Need to specify static content to use
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response){
    response.sendFile(__dirname + '/index.html');
});

// Use body parser to see request
app.use(bodyParser.json());

// It's working just I can't push back to client 
//(need different xhr plan, like http or something)
app.post('/', function(request, response){
	//console.log('Message received, sending meta');
	var playing_file = JSON.stringify(request.body.file_name).replace(/"/g,"")
	console.log('Request received. Reading meta for ' + playing_file);
	mm.parseFile('./public/' + playing_file, {native: true})
    .then(function (metadata) {
        var tags = metadata['common'];
		console.log(tags);
		var xhr = new XMLHttpRequest();
		var url = 'https://api.listenbrainz.org/1/submit-listens'
		var payload = JSON.stringify(
			{"listen_type": "single",
				"payload": [
					{
						"listened_at": Math.floor(Date.now()/1000),
						"track_metadata": {
							"additional_info": {
								"release_mbid": tags['musicbrainz_albumid'],
								"artist_mbids": [
									tags['musicbrainz_artistid']
								],
								"recording_mbid": tags['musicbrainz_recordingid']
							},
							"artist_name": tags['artist'],
							"track_name": tags['title'],
							"release_name": tags['album']
						}
					}
				]
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
