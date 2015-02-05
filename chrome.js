var Chrome = require('chrome-remote-interface');
var esprima = require('esprima');
var types = require("ast-types");

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
function setBreakPointsOnSource(source,url,chrome,sid){
    var ast = esprima.parse(source,{loc:true});
    types.visit(ast, {
        /*visitFunction: function (path) {
            var node = path.node;
            if(n.BlockStatement.check(node.body)){
                var blockBody = node.body.body;
                chrome.Debugger.setBreakpointByUrl({
                    lineNumber : blockBody[0].loc.start.line-1,
                    columnNumber : blockBody[0].loc.start.column,
                    url : url
                },function(resp){
                    console.log('setbp',blockBody[0].loc.start,resp);
                });
                if(!n.ReturnStatement.check(blockBody[blockBody.length-1])){
                    chrome.Debugger.setBreakpointByUrl({
                        lineNumber : blockBody[blockBody.length-1].loc.start.line-1,
                        columnNumber : blockBody[blockBody.length-1].loc.start.column,
                        url : url
                    },function(resp){
                        console.log('setbp exit',blockBody[blockBody.length-1].loc.start,resp);
                    });
                }
                breakPointToFuncEntry[url+':'+(blockBody[0].loc.start.line-1)+':'+blockBody[0].loc.start.column] = node.id ? node.id.name : '';
                breakPointToFuncExit[url+':'+(blockBody[blockBody.length-1].loc.start.line-1)+':'+blockBody[blockBody.length-1].loc.start.column] = node.id ? node.id.name : '';
            }

            this.traverse(path);
        },
        visitReturnStatement : function(path){
            this.traverse(path);
        },*/
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


        }
    });
    var changedSource = esc.generate(ast);
    chrome.Debugger.setScriptSource({
        scriptId : sid,
        scriptSource : changedSource
    },function(res){
        console.log('changed source', arguments);
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

Chrome(function (chrome) {
    with (chrome) {
        Console.enable();
        Network.enable();
        Inspector.enable();
        Page.enable();
        Runtime.enable();
        Debugger.enable();
        Debugger.pause();

        Page.navigate({'url': 'http://localhost:8080'},function(){
            on('Debugger.scriptParsed',function(resp){
                console.log("script parsed ",resp.url,resp.scriptId);
                //setBreakPointsOnUrl(resp.url,chrome,resp.scriptId);
                //chrome.Debugger.getScriptSource({scriptId:resp.scriptId},console.log);
            });
            Page.getResourceTree(null,function(response,obj){
                for (var i = 0; i < obj.frameTree.resources.length; i++) {
                    if(obj.frameTree.resources[i].mimeType === "application/javascript"){
                        Page.getResourceContent({frameId : obj.frameTree.frame.id,
                            url : obj.frameTree.resources[i].url},console.log);
                    }

                }
            });
        });




        /*setTimeout(function(){
            chrome.Debugger.resume();
        },1000);*/

        /*on('Debugger.paused', function onDebuggerPaused(response) {
            if(response.hitBreakpoints){
                if(breakPointToFuncEntry[response.hitBreakpoints[0]] !== undefined ){
                    console.log('breakpoint hit entry',response.hitBreakpoints[0]);
                }
                else{
                    console.log('breakpoint hit exit',response.hitBreakpoints[0]);
                }

            }
            chrome.Debugger.resume();



        });*/

    }
}).on('error', function () {
    console.error('Cannot connect to Chrome');
});


