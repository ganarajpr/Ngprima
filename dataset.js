var Nightmare = require('nightmare');
var fs = require('fs');
var request = require('request');
var _ = require('lodash');
var path = require('path');

function writeToFile(fileName,content){
  fs.writeFile(fileName, content, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
}
function capture(url,fileName) {
  new Nightmare()
    .goto(url)
    .evaluate(function(){
      function getBounds(node,bounds){
          if(node.nodeType === 1){
              var cr = node.getClientRects();
              if(cr[0]){
                  var rect = cr[0];
                  bounds.push({
                      name : node.tagName,
                      top : rect.top,
                      left : rect.left,
                      width : rect.width,
                      height : rect.height
                  })
              }
          }

          if(node.childNodes && node.childNodes.length){
              for( var i =0;i<node.childNodes.length;i++){
                  getBounds(node.childNodes[i],bounds);
              }
          }
      }
      var b = [];
      getBounds(document,b);
      return b;

    },function (result) {
        writeToFile(path.join(__dirname, 'data', fileName+'.json'),JSON.stringify({content : result}));
    })
    .screenshot('data/'+fileName + '.jpg')
    .run();
}


// var filePath = path.join(__dirname, 'startups.json');
// var startups = fs.readFileSync(filePath,{ encoding: 'utf8' });
// console.log(JSON.parse(startups).startups.length);

var urls = [];
var requestUrl = 'https://api.angel.co/1/startups?filter=raising&page=';

var page = 1;
var maxPage = 2;
var index = 1;
for ( var page = 1; page <= maxPage; page++){
  request(requestUrl+page, function (error, response, body) {
    if (!error && response.statusCode == 200) {

      var startups = JSON.parse(body).startups;
      var i =0;
      while(i < startups.length){
        capture(startups[i].company_url,index++);
        i++;
      }
    }
  });
}

//capture('http://www.google.com','1');
