
var casper = require('casper').create({
    viewportSize: {width: 1280, height: 1024}
});

var screenshotUrl = 'http://google.com/';
casper.start(screenshotUrl, function() {
  this.echo('Current location is ' + this.getCurrentUrl(), 'info');
});

casper.thenOpen(screenshotUrl, function() {
  this.wait(5000);
});

casper.then(function(){
  var bounds = this.evaluate(function() {
        var limit = [];
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
        getBounds(document,limit);
        return limit;
  });
  console.log("bounds length = ",bounds.length);
  for(var i = 0;i < bounds.length; i++){
    console.log(JSON.stringify(bounds[i]));
    this.capture('images/google_'+bounds[i].name+i+'.png', {
        top: bounds[i].top,
        left: bounds[i].left,
        width: bounds[i].width,
        height: bounds[i].height
    });
  }
});

casper.run();
