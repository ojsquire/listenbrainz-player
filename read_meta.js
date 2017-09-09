// Read audio metadata from file
var http = require('http');
var jsmediatags = require("jsmediatags")

var server = http.createServer(function(req, res) {
	
  // Here we want the request to be playing the file
  // rather than landing on the page
	
  res.writeHead(200, {'Content-Type': 'text/html'});
  
  res.write('<!DOCTYPE html>');
  res.write('<html>');
  res.write('<body>');
  res.write('<audio controls id="player">');
  res.write('<source src="tst.mp3">');
  res.write('</audio>');
  res.write('<p>');
  jsmediatags.read("./tst.mp3", {
    onSuccess: function(tags) {
	// Here instead we want the POST request to be triggered
	  res.write('Artist = ' + tags.tags.artist);
	  res.write('<br>');
	  res.write('Track = ' + tags.tags.title)
	  res.end();
    },
    onError: function(error) {
      console.log(error);
	  res.end();
    }
  });
  res.write("</p>");
  res.write("</body>");
  res.write("</html>");

});
server.listen(8080);
