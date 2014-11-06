var jade = require('jade');

var fs = require('fs');

var fn = jade.compileFile('main.jade', { pretty : true });

fs.readFile('cquery.json', function (err, data) {
    var fileContents = data.toString();
    var json = JSON.parse(fileContents);
    //console.log();
    var html = fn(json);
    console.log(html);
    fs.writeFile('a.html',html,function(err){
        if (err) throw err;
        console.log('It\'s saved!');
    });


});

