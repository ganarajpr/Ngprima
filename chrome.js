var Chrome = require('chrome-remote-interface');
var esprima = require('esprima');
var types = require("ast-types");

function setBreakPoints(url){
    types.visit(ast, {
        visitFunction: function (path) {
            this.traverse(path);
            var body = getStatementOf(path);
            if (getStatementType(body) === 'ReturnStatement') {
                path.replace(getIIFE(path.node));
            }
            else {
                body.path.get(body.position).insertBefore(getConsoleLog('start'));
                body.path.get(body.position + 1).insertAfter(getConsoleLog('end'));
            }


        }
    });
}

function getSource(sourceUrl){
    var http = require('http');
    var https = require('https');
    var url = require('url');
    if(sourceUrl){
        var urlDef = url.parse(sourceUrl);

        if(urlDef.protocol === 'https:'){
            https.get(sourceUrl, function(res) {
                console.log("Got response: " + res);
                res.on('data', function(d) {
                    console.log("Got response data: ",sourceUrl);
                });

            });
        }
        else if(urlDef.protocol === 'http:'){
            http.get(sourceUrl, function(res) {
                console.log("Got response: " + res);
                res.on('data', function(d) {
                    console.log("Got response data: ",sourceUrl + d);
                });
            });
        }
    }



}

Chrome(function (chrome) {
    with (chrome) {
        Runtime.enable();
        /*on('Runtime.executionContextCreated',function(){
            console.log(JSON.stringify(arguments));
        });*/
        var previousCallFrameId;
        Debugger.enable();
        Debugger.setBreakpointByUrl({
            lineNumber : 15,
            columnNumber : 0,
            url : 'http://localhost:8080/js/app.js'
        },function(resp){
            console.log('setbp115',resp);
        });
        Debugger.setBreakpointByUrl({
            lineNumber : 40,
            columnNumber : 0,
            url : 'http://localhost:8080/js/app.js'
        },function(resp){
            console.log('setbp40',resp);
        });
        on('Debugger.scriptParsed',function(resp){
            console.log("script parsed ",resp.url,resp.scriptId);
            //setBreakPoints(resp.url);
            getSource(resp.url);
        });
        on('Debugger.breakpointResolved', function onDebuggerPaused(response) {

            /*chrome.Debugger.getBacktrace(null,function(a){
             console.log(arguments);

             });*/
            console.log('breakpoint hit',response.location);
            //console.log(JSON.stringify(response));
            chrome.Debugger.resume();
            /*if(response.callFrames[0].callFrameId !== previousCallFrameId){
                previousCallFrameId = response.callFrames[0].callFrameId;
                console.log(response.callFrames[0].functionName);

                if(response.callFrames[0].scopeChain[0].object.className !== 'Window'){
                    chrome.Runtime.getProperties({'objectId':response.callFrames[0].scopeChain[0].object.objectId},function(err,resp){
                        resp.result.forEach(function(res){
                            console.log(res.name);
                        });
                        chrome.Debugger.stepOver(null,function(){
                            console.log(arguments);
                        });
                    });
                }
                else{
                    //chrome.Debugger.resume();
                    chrome.Debugger.stepOver(null,function(){
                        console.log(arguments);
                    });
                }
            }
            else{
                chrome.Debugger.stepOver(null,function(){
                    console.log(arguments);
                });
            }*/



            /*response.callFrames.forEach(function(callFrame){
                callFrame.scopeChain.forEach(function(scope){
                    chrome.Runtime.getProperties({'objectId':scope.object.objectId},function(err,resp){
                        resp.result.forEach(function(res){
                            console.log(res.name,'=',res.value);
                        });
                    });
                });
            });*/


        });

        Network.enable();
        Page.enable();
        Page.navigate({'url': 'http://localhost:8080/test.html'});




    }
}).on('error', function () {
    console.error('Cannot connect to Chrome');
});


