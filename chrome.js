var Chrome = require('chrome-remote-interface');
var esprima = require('esprima');
var types = require("ast-types");
var n = types.namedTypes;
var breakPointToFuncEntry = {};
var breakPointToFuncExit = {};

function setBreakPointsOnSource(source,url,chrome){
    var ast = esprima.parse(source,{loc:true});
    types.visit(ast, {
        visitFunction: function (path) {
            var node = path.node;
            if(n.BlockStatement.check(node.body)){
                var blockBody = node.body.body;
                chrome.Debugger.setBreakpointByUrl({
                    lineNumber : blockBody[0].loc.start.line,
                    columnNumber : blockBody[0].loc.start.column,
                    url : url
                },function(resp){
                    console.log('setbp',blockBody[0].loc.start,resp);
                });
                if(!n.ReturnStatement.check(blockBody[blockBody.length-1])){
                    chrome.Debugger.setBreakpointByUrl({
                        lineNumber : blockBody[blockBody.length-1].loc.start.line,
                        columnNumber : blockBody[blockBody.length-1].loc.start.column,
                        url : url
                    },function(resp){
                        console.log('setbp exit',blockBody[blockBody.length-1].loc.start,resp);
                    });
                }
                breakPointToFuncEntry[url+':'+blockBody[0].loc.start.line+':'+blockBody[0].loc.start.column] = node.id ? node.id.name : '';
                breakPointToFuncExit[url+':'+blockBody[blockBody.length-1].loc.start.line+':'+blockBody[blockBody.length-1].loc.start.column] = node.id ? node.id.name : '';
            }

            this.traverse(path);
        },
        visitReturnStatement : function(path){
            this.traverse(path);
        }
    });
}

function setBreakPointsOnUrl(sourceUrl,chrome){
    var request = require('request');
    if(sourceUrl){
        request.get(sourceUrl, function (error, response, body) {
            if (!error && response.statusCode == 200 && response.headers['content-type'] === 'application/javascript') {
                console.log(sourceUrl);
                setBreakPointsOnSource(body,sourceUrl,chrome);
            }
        });
    }
}

Chrome(function (chrome) {
    with (chrome) {
        Runtime.enable();
        Debugger.enable();

        on('Debugger.scriptParsed',function(resp){
            console.log("script parsed ",resp.url,resp.scriptId);
            setBreakPointsOnUrl(resp.url,chrome);
        });
        Debugger.pause();

        setTimeout(function(){
            chrome.Debugger.resume();
        },3000);
        on('Debugger.paused', function onDebuggerPaused(response) {
            if(response.hitBreakpoints){
                if(breakPointToFuncEntry[response.hitBreakpoints[0]] !== undefined ){
                    console.log('breakpoint hit entry',response.hitBreakpoints[0]);
                }
                else{
                    console.log('breakpoint hit exit',response.hitBreakpoints[0]);
                }

            }
            chrome.Debugger.resume();



        });

        Network.enable();
        Page.enable();
        Page.navigate({'url': 'http://localhost:8080/test.html'});



    }
}).on('error', function () {
    console.error('Cannot connect to Chrome');
});


