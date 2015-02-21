var express = require('express');
var app = express();

app.use(express.urlencoded({limit: '10mb'}));

app.get('/test', function(req, res){
    console.log(req.protocol, 'get req.query', req.query);
    res.end('get: hello world');
});

app.post('/test', function(req, res) {
    console.log(req.protocol, 'post req.query', req.query);
    console.log(req.protocol, 'post req.body', req.body);
    res.end('post: hello world');
});

app.all('/foobar', function(req, res) {
    // this route won't be reached because of mitm interceptor
    res.send('original');
});

app.listen(3000, function(err) {
    if (err) console.log('http server', err)
});


var fs = require('fs');
var https = require('https');

https.createServer({
    key: fs.readFileSync('./cert/dummy.key'), // your server keys
    cert: fs.readFileSync('./cert/dummy.crt')
}, app).listen(3001, function(err) {
    if (err) console.log('https server', err)
});