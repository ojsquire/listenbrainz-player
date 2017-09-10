var express = require('express');
var app = express();

// Need to specify static content to use
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response){
    response.sendFile(__dirname + '/index.html');
});

app.post('/', function(request, response){
	console.log('Message received, sending meta');
	response.send({'message':'sending meta'});
});

// Here is the server-side stuff we need to pass back up
  // jsmediatags.read("./tst.mp3", {
    // onSuccess: function(tags) {
//	Here instead we want the POST request to be triggered
	  // res.write('Artist = ' + tags.tags.artist);
	  // res.write('<br>');
	  // res.write('Track = ' + tags.tags.title)
	  // res.end();
    // },
    // onError: function(error) {
      // console.log(error);
	  // res.end();
    // }
  // });

var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})
