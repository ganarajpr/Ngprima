var Thin = require('thin');

var proxy = new Thin;

proxy.use(require('fondue-middleware')({
    ignoreMinified: true
}));


proxy.listen(8081, 'localhost', function(err) {
    // .. error handling code ..
});