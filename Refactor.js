/**
 * Created by ganara.jpermunda on 29/07/2014.
 */

var esprima = require('esprima');
var _ = require('lodash');
/**
 * We take in the AST for a function and the context in which it lives.
 * Our task is to refactor the code in the function with a bunch of function calls.
 *
 *
 * */
module.exports = function(functionAST,context){

    var body = functionAST.ast.body.body;

    var ifs = getIfStatements(body);

};


function getIfStatements(expressions){
    return _.filter(expressions,function(expression){
        return expression.type === esprima.Syntax.IfStatement;
    });
}