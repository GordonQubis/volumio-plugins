 function buildOptions(path) {
	return {
		host: '10.10.30.16',
		port: '9999',
		path: path
	  };
}

var m3u8p = require('m3u8-parser')
var m3u = require('m3u8-reader')
var options = buildOptions('/get_all_playlists');

var manifest = '';
var parser = new m3u8p.Parser();

parser.addParser({
    expression: /^#EXTINF:?(-?[0-9\.]*)?,?(.*)?$/,
    customType: 'extinfo',
    dataParser: function(line) {
        var extInf = {}
        var match = (/^#EXTINF:?(-?[0-9\.]*)?,?(.*)?$/).exec(line)
        if (match[1]) {
            extInf.duration = match[1];
        }
        if (match[2]) {
            extInf.title = match[2]
        }
      return extInf;
    }
  });

var m3uOut = null;
http.get(options, function(res) {
		res.on('data', function(chunk) {
		  manifest += chunk;
		});
		res.on('end', function() {
            // GMusic Proxy doesn't follow the spec for playlists and returns -1 for duration. 
            // Replace those cases with 0
            // var cleanManifest = manifest.replace(/EXTINF:-1/g,'EXTINF:0')
            parser.push(manifest);
            parser.end();
            m3uOut = m3u(manifest)
		  console.info('Completed M3U Processing');
		});
	  }).on('error', function(e) {
		console.info("Got error: " + e.message);
      }); 
      

 
function parseM3U(data) {
    var m3uLines = data.split('\n')
            .filter(function (str) {
                return str.length > 0;
            }).map(function (str) { return str.trim();});

    if (m3uLines.shift() !== '#EXTM3U') {
        throw new Error('Invalid M3U playlist');
    }

    var playlist = [];
    var entry = {};
    while (m3uLines.length > 0) {
        var line = m3uLines.shift();
        if (line.startsWith('#EXTINF')) {
            var result = /^#EXTINF:(-?[0-9\.]+),(.*)$/.exec(line);
            if (!result) {
                throw new Error('Invalid M3U playlist');
            }
            entry.duration = result[1];
            entry.title = result[2].trim();
        } else {
            entry.uri = line;
            playlist.push(entry);
            entry = {};
        }
    }
    return playlist;
}