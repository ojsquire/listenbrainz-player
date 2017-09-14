var express = require('express');
var XMLHttpRequest = require('xhr2');
var ffmpeg = require('fluent-ffmpeg');
var api_key = require('./private');
var app = express();

ffmpeg.setFfmpegPath('ffmpeg.exe')
ffmpeg.setFfprobePath('ffprobe.exe')

// Need to specify static content to use
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response){
    response.sendFile(__dirname + '/index.html');
});

// It's working just I can't push back to client 
//(need different xhr plan, like http or something)
app.post('/', function(request, response){
	console.log('Message received, sending meta');
	ffmpeg.ffprobe('./public/01_untitled_2.mp3', function(err, metadata) {
		var tags = metadata['format']['tags'];
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
								"release_mbid": tags['MusicBrainz Album Id'],
								"artist_mbids": [
									tags['MusicBrainz Artist Id']
								],
								"recording_mbid": tags['MusicBrainz Release Track Id']
							},
							"artist_name": metadata['format']['tags']['artist'],
							"track_name": metadata['format']['tags']['title'],
							"release_name": metadata['format']['tags']['album']
						}
					}
				]
			}
		)
//		console.log(payload);
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-type', 'application/json');
		xhr.setRequestHeader('Authorization', 'OAuth ' + api_key['api_key']);
		xhr.onload = function () {
				console.log(xhr.responseText);
		};
			xhr.send(payload);  
	});
});		

var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})
