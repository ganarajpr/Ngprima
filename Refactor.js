/**
 * Created by ganara.jpermunda on 29/07/2014.
 */

var esprima = require('esprima');
var escodegen = require('escodegen');
var _ = require('lodash');
var create = require('./codequery/create');

/**
 * We take in the AST for a function and the context in which it lives.
 * Our task is to refactor the code in the function with a bunch of function calls.
 *
 *
 * */



var rootContext;


module.exports = function (functionAST, toContext) {

    rootContext = toContext;
    var body = functionAST.ast.body.body;
    //var ifs = getIfStatements(body);
    var locations = _.compact(_.map(body,ifLocations));

    var ifSt = body.splice(locations[0],1);
    addFunction('test',toContext,ifSt[0]);
    console.log(JSON.stringify(toContext));
    console.log(escodegen.generate(toContext));
};

function addFunction(funcName,toContext,ifSt){
    "use strict";
    var func = new create.FunctionExpression('test');
    toContext.addAssignment(new create.Identifier('test'),func);
    func.body.body.push(ifSt);
}


function ifLocations(expr,index){
    "use strict";
    if(expr.type === esprima.Syntax.IfStatement){
        return index;
    }
    return null;
}

function getIfStatements(expressions) {
    return _.filter(expressions, function (expression) {
        return expression.type === esprima.Syntax.IfStatement;
    });
}

function processIf(ifStatement) {

}
