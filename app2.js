var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var api_key = require('./private');
var mm = require('music-metadata');
var app = express();
const util = require('util')

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

//blog home page
// app.get('/', (req, res) => {
//  render `home.ejs` with the list of posts
  // res.render('index', { posts: posts })
// })

const payload = [
  {
    id: 1,
    author: 'John',
    title: 'Templating with EJS',
    body: 'Blog post number 1'
  }]

app.get('/', (req, res) => {
  res.render('index', {payload: payload});
})

// app.get('/', function(request, response){
  // response.sendFile(__dirname + '/index.html');
// });

// Should this whole thing be changed to a get request????

app.post('/', function(req, res){
    var playing_file = JSON.stringify(req.body.file_name).replace(/"/g,"")
    mm.parseFile('./public/' + playing_file, {native: true})
    .then(function (metadata){
        var tags = metadata['common'];
        var url = 'https://api.listenbrainz.org/1/submit-listens'
        var payload = JSON.stringify({
            "listen_type": "single",
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
        })
        console.log('Sending payload to listenbrainz...');
//        console.log(payload);
//        res.send(payload);
	    request.post({
            headers: {
                'content-type' : 'application/json',
                'authorization': 'OAuth ' + api_key['api_key']
            },
            url: url,
            body: payload
        }, function(error, response, body){
            console.log(body);
            res.render('index', {payload: payload});
        });
    });
});		

var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})
