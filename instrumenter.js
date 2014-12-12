var types = require("ast-types");
var b = types.builders;

var _ = require('lodash');
var esc = require('escodegen');

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


var filestoast = require('filestoast');

var dir = '**/codegrap*.js';


function onProcessingComplete(files) {
    var ast = instrument(files[0].ast);
    console.log(esc.generate(ast));
}


filestoast
    .process(dir)
    .then(onProcessingComplete);


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
    return body.path.value[body.position].type;
}

function instrument(ast) {
    types.visit(ast, {
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
    return ast;
}