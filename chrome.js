var Chrome = require('chrome-remote-interface');
var esprima = require('esprima');
var types = require("ast-types");
var Q = require('q');

var _ = require('lodash');
var b = types.builders;
var n = types.namedTypes;
var breakPointToFuncEntry = {};
var breakPointToFuncExit = {};

var consoleLog = b.memberExpression(
    b.identifier("console"),
    b.identifier("log"),
    false
);


function getConsoleLog(msg){
    return b.expressionStatement(
        b.callExpression(
            consoleLog,
            [b.literal(msg)]
        )
    );
}

function getStatementOf(path) {
    var curr = path;
    var lastNumber = 0;
    while (curr.name !== 'body') {
        if (_.isNumber(curr.name)) {
            lastNumber = curr.name;
        }
        curr = curr.parentPath;
    }
    return {
        path: curr,
        position: lastNumber
    }
}

function getStatementType(body) {
    return body.path.value === 'BlockStatement' ? body.path.value[body.position].type : body.path.value.type;
}

function getIIFE(actualCall) {
    return b.callExpression(
        b.functionExpression(
            null,
            [],
            b.blockStatement(
                [
                    getConsoleLog("start"),
                    b.variableDeclaration(
                        "var",
                        [
                            b.variableDeclarator(
                                b.identifier('ret'),
                                actualCall
                            )
                        ]
                    ),
                    getConsoleLog("end"),
                    b.returnStatement(
                        b.identifier('ret')
                    )
                ]
            )
        ),
        []
    );
}
//google-chrome --remote-debugging-port=9222 --user-data-dir=remote-profile




var esc = require('escodegen');
var breakPoints = [];
function setBreakPointsOnSource(source,url,chrome,sid){

    var ast = esprima.parse(source,{loc:true});
    types.visit(ast, {
        visitFunction: function (path) {
            var node = path.node;
            if(n.BlockStatement.check(node.body)){
                var blockBody = node.body.body;
                if( blockBody.length) {
                    breakPoints.push({
                        lineNumber : blockBody[0].loc.start.line-1,
                        columnNumber : blockBody[0].loc.start.column,
                        url : url
                    });
                    /*if(!n.ReturnStatement.check(blockBody[blockBody.length-1])){
                        breakPoints.push({
                            lineNumber : blockBody[blockBody.length-1].loc.start.line-1,
                            columnNumber : blockBody[blockBody.length-1].loc.start.column,
                            url : url
                        });
                    }*/
                }
            }

            this.traverse(path);
        }/*,
        visitReturnStatement : function(path){
            this.traverse(path);
        },
        visitCallExpression: function (path) {
            this.traverse(path);
            var body = getStatementOf(path);
            if (getStatementType(body) === 'ReturnStatement') {
                path.replace(getIIFE(path.node));
            }
            else {
                body.path.get(body.position).insertBefore(getConsoleLog('start'));
                body.path.get(body.position + 1).insertAfter(getConsoleLog('end'));
            }
        }*/
    });
}

function setBreakPointsOnUrl(sourceUrl,chrome,sid){
    var request = require('request');
    if(sourceUrl){
        request.get(sourceUrl, function (error, response, body) {
            if (!error && response.statusCode == 200 && response.headers['content-type'] === 'application/javascript') {
                var res = sourceUrl.match(/app/g);
                if(res && res.length){
                    setBreakPointsOnSource(body,sourceUrl,chrome,sid);
                }

            }
        });
    }
}
var request = require('request');

var urlToScriptID = {};

Chrome(function (chrome) {
    with (chrome) {
        Console.enable();
        Network.enable();
        Inspector.enable();
        Page.enable();
        Runtime.enable();
        Debugger.enable();
        Debugger.pause();

        var allPromisesResolved = false;

        /*on('Debugger.scriptParsed',function(resp){
            //console.log("script parsed ",resp.url,resp.scriptId);
            //setBreakPointsOnUrl(resp.url,chrome,resp.scriptId);
            //chrome.Debugger.getScriptSource({scriptId:resp.scriptId},console.log);
        });*/
        on('Debugger.breakpointResolved',function(resp){
            console.log("breakpoint resolved  ",resp.breakpointId);
            chrome.Debugger.resume();
            //setBreakPointsOnUrl(resp.url,chrome,resp.scriptId);
            //chrome.Debugger.getScriptSource({scriptId:resp.scriptId},console.log);
        });

        on('Debugger.paused',function(resp){
            console.log("paused ",resp.hitBreakpoints[0]);
            chrome.Debugger.resume();
         //setBreakPointsOnUrl(resp.url,chrome,resp.scriptId);
         //chrome.Debugger.getScriptSource({scriptId:resp.scriptId},console.log);
         });

        Page.navigate({'url': 'http://localhost:8080'},function(){




            Page.getResourceTree(null,function(response,obj){
                var promises = [];
                var i = 0;
                for (; i < obj.frameTree.resources.length; i++) {
                    if(obj.frameTree.resources[i].mimeType === "application/javascript"){
                        var promise = Q.Promise(function(resolve) {
                            var index = i;

                            request(obj.frameTree.resources[index].url, function (error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    //console.log(body); // Show the HTML for the Google homepage.
                                    var res = obj.frameTree.resources[index].url.match(/app/g);
                                    if(res && res.length){
                                        setBreakPointsOnSource(body,obj.frameTree.resources[index].url,chrome);
                                    }
                                    resolve();
                                }
                            });
                            /*Page.getResourceContent({frameId : obj.frameTree.frame.id,
                                url : obj.frameTree.resources[index].url},function (e,resp){
                                setBreakPointsOnSource(resp,obj.frameTree.resources[index].url,chrome);
                                //console.log(obj.frameTree.resources[index].url);
                                resolve();
                            });*/
                        });
                        promises.push(promise);
                    }

                }
                Q.all(promises).then(function(){
                    allPromisesResolved = true;
                    console.log('all sources parsed', breakPoints.length);
                    setBreakPoints(chrome);
                });

            });
        });


    }
}).on('error', function () {
    console.error('Cannot connect to Chrome');
});

var bpPointer = 0;
function setBreakPoints(chrome){
    var promises = [];
    var maxNow = bpPointer+50;
    while(bpPointer < maxNow && bpPointer < breakPoints.length){
        var pm = Q.Promise(function(resolve){
            chrome.Debugger.setBreakpointByUrl(breakPoints[bpPointer],function(){
                resolve();
            });
        });
        promises.push(pm);
        bpPointer++;
    }
    Q.all(promises).then(function(){
        if(bpPointer < breakPoints.length){
            setBreakPoints(chrome);
        }
        else{
            console.log('All breakpoints set');
            chrome.Debugger.resume();
        }
    });
}
