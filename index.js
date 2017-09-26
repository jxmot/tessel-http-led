/*
    This project code is modified from the same files found at - 
    
    https://github.com/HipsterBrown/tessel-router.git
    
    Modifications Made:

        a) Added ability to use POST rather than GET to 
        toggle the LEDs. 
        
        b) Added _toggleLED() to toggle the LED for POST 
        requests.

        c) Kept the ability to use GET (for demonstration)
        to toggle the LEDs.
        
        d) renamed some variables - 
            request - req
            response - res
        
        e) removed the arg `url` from showIndex(), it was 
        unused.
        
        f) added calls to console.log() to output additional
        run-time info.
        
        g) added comments
        
        h) removed the unused `req` arg in the following - 
        
            showFavicon(req, res)       ->  showFavicon(res)
            showIndex (req, res)        ->  showIndex (res)
            toggleLED (url, req, res)   ->  toggleLED (url, res)
*/
// Import the interface to Tessel hardware
var tessel = require('tessel');

// Node modules - 
var http = require('http');
var fs = require('fs');
var url = require('url');

/*
    Create the server, and wait for a connection....
*/
var server = http.createServer(function (req, res) {
    console.log('method = ' + req.method);
    
    // GET
    if(req.method == 'GET') {
        var urlParts = url.parse(req.url, true);        
        console.log('path = ' + urlParts.pathname);
        
        switch(urlParts.pathname) {
            case '/':
                showIndex(res);
                break;
                
            case '/leds/2':
            case '/leds/3':
                toggleLED(urlParts.pathname, res);
                break;
                
            case '/favicon.ico':
                /*
                    If not using a favicon then uncomment this block of
                    code and comment out "showFavicon(req, res);" below.
                    
                    console.log('received a favicon.ico request, responding with 204');
                    res.writeHead(204);
                    res.end('/favicon.ico does not exist');
                    
                    The favicon in this project was created with - 
                    
                    http://www.favicon-generator.org/
                */
                showFavicon(res);
                break;
        }
    // POST
    } else if(req.method == 'POST') {
        var body = '';
        // obtain the `application/json` encoded data from
        // the request
        req.on('data', function (data) {
            body += data;
            console.log("Partial body: " + body);
        });
        // all data has been collected, toggle the desired
        // LED...
        req.on('end', function () {
            console.log("Body: " + body);
            _toggleLED(JSON.parse(body), res);
        });
    }
}).listen(8080);

/*
    Toggle a single LED when using the POST method
*/
function _toggleLED(_led, res) {

    console.log('ledidx = ' + _led.ledidx);
    
    var led = tessel.led[_led.ledidx];
    
    led.toggle(function (err) {
        if (err) {
            console.log(err);
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({error: err}));
        } else {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({on: led.isOn}));
        }
    });
}

function showFavicon(res) {
    res.writeHead(200, {"Content-Type": "image/x-icon"});
    fs.readFile(__dirname + '/favicon.ico', function (err, content) {
        if (err) throw err;
        res.end(content);
    });
}

/*
    Respond with index.html
*/
function showIndex(res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    fs.readFile(__dirname + '/index.html', function (err, content) {
        if (err) throw err;
        res.end(content);
    });
}

/*
    Toggle a single LED when using the GET method
*/
function toggleLED(url, res) {
    var indexRegex = /(\d)$/;
    var result = indexRegex.exec(url);
    var index = +result[1];
    
    var led = tessel.led[index];
    
    led.toggle(function (err) {
        if (err) {
            console.log(err);
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({error: err}));
        } else {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({on: led.isOn}));
        }
    });
}
