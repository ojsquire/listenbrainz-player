var express = require('express');
var XMLHttpRequest = require('xhr2');
var jsmediatags = require('jsmediatags');
var api_key = require('./private');
var app = express();

// Need to specify static content to use
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response){
    response.sendFile(__dirname + '/index.html');
});

// It's working just I can't push back to client 
// (need different xhr plan, like http or something)
app.post('/', function(request, response){
	console.log('Message received, sending meta');
	jsmediatags.read("./public/tst.mp3", {
		onSuccess: function(tag) {
			console.log(tag);
			var xhr = new XMLHttpRequest();
			var url = 'https://api.listenbrainz.org/1/submit-listens'
			// This will deliver the minimum required payload
			var payload = JSON.stringify(
			{
				"listen_type": "single",
				"payload": [
				{
					"listened_at": Math.floor(Date.now()/1000),
					"track_metadata": {
					"artist_name": tag.tags.artist,
					"track_name": tag.tags.title,
					"release_name": tag.tags.album
					}
				}
				]
			}
			)
			xhr.open('POST', url, true);
			xhr.setRequestHeader('Content-type', 'application/json');
			xhr.setRequestHeader('Authorization', 'OAuth ' + api_key['api_key']);
			xhr.onload = function () {
				console.log(xhr.responseText);
			};
			xhr.send(payload);  
		},
		onError: function(error) {
			console.log(':(', error.type, error.info);
		}
	});
});

var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})
