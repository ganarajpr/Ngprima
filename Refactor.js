/**
 * Created by ganara.jpermunda on 29/07/2014.
 */

var esprima = require('esprima');
var escodegen = require('escodegen');
var _ = require('lodash');
var create = require('./codequery/create');
var utility = require('./codequery/utility');

/**
 * We take in the AST for a function and the context in which it lives.
 * Our task is to refactor the code in the function with a bunch of function calls.
 *
 *
 * */



var rootContext;


/**
 * We have to assume that functionAST is the AST of a function.
 *
 * */

module.exports = function (context, toContext) {

    var body;
    if(context.ast){
        body = context.ast.body.body;
    }
    rootContext = toContext;
    _.each(body,onEachExpressionInBody,toContext);
    console.log(escodegen.generate(toContext));




    /*var locations = _.compact(_.map(body,ifLocations));
    var ifSt = body.splice(locations[0],1);
    addFunction('test',toContext,ifSt[0]);
    //console.log(JSON.stringify(toContext));
    console.log(escodegen.generate(toContext));*/
};


function getAccessor(expr){
    var addOn = '';
    switch (expr.type) {
        case esprima.Syntax.MemberExpression :
            addOn += utility.fullAccessor(expr);
        break;
        case esprima.Syntax.Identifier:
            addOn += expr.name;
        break;
        case esprima.Syntax.Literal:
            addOn += expr.value;
        break;
    }
    return addOn;

}


function getOperator(operator) {
    switch (operator){
        case '<':
            return 'LessThan';
        break;
        case '>':
            return 'GreaterThan';
        break;
        case '===':
            return 'isEqualTo';
        break;
        case '!==':
            return 'isNotEqualTo';
        break;
        case '<=':
            return 'lessThanOrEqualTo';
        break;
        case '>=':
            return 'greaterThanOrEqualTo';
        break;
    }
}
function getFunctionNameFromTestExpr(test) {
    var funcName = 'branchOn';
    switch(test.type){
        case "Identifier":
            funcName += 'ExistanceOf' + test.name;
        break;
        case "BinaryExpression":
            funcName += getAccessor(test.left) + getOperator(test.operator) + getAccessor(test.right) ;
        break;
    }
    return funcName;
}
function replaceIfStatementWithBranchFunction(ifexpr, index, body,toContext) {
    var funcName = getFunctionNameFromTestExpr(ifexpr.test);
    addFunction(funcName,toContext,ifexpr);
    body.splice(index,1);

}








function onEachExpressionInBody(expr,index,body){
    //when do you separate out the ifStatement to its own function ?
    if( isIfStatement(expr) ){
        replaceIfStatementWithBranchFunction(expr,index,body,this);
    }
}



function isIfStatement(expr){
    return expr.type === esprima.Syntax.IfStatement;
}

function addFunction(funcName,toContext,ifSt){
    "use strict";
    var func = new create.FunctionExpression(funcName);
    toContext.addAssignment(new create.Identifier(funcName),func);
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
