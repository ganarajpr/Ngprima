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
    toContext.body.push(context.ast);
    console.log(escodegen.generate(toContext));

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
        case '<==':
            return 'lessThanOrEqualTo';
        break;
        case '>=':
        case '>==':
            return 'greaterThanOrEqualTo';
        break;
        case '!':
            return 'not';
        break;
        case '&&':
            return '_and_';
        break;
        case '||':
            return '_or_';
        break;
    }
}

function getArguments(args){
    var argSt = '';
    _.each(args,function(arg,index){
        if(index > 0){
            argSt += '_and_';
        }
        argSt += getAccessor(arg);
    });
    return argSt;
}

function getFunctionNameFromTestExpr(test) {
    var funcName = 'branchOn';
    switch(test.type){
        case esprima.Syntax.Identifier:
            funcName += 'ExistanceOf' + test.name;
        break;
        case esprima.Syntax.Literal:
            funcName += test.value;
        break;
        case esprima.Syntax.BinaryExpression:
            funcName += getAccessor(test.left) + getOperator(test.operator) + getAccessor(test.right) ;
        break;
        case esprima.Syntax.UnaryExpression:
            funcName += getOperator(test.operator) + 'ExistanceOf' + getAccessor(test.argument);
        break;
        case esprima.Syntax.LogicalExpression:
            funcName += getAccessor(test.left) + getOperator(test.operator) + getAccessor(test.right);
        break;
        case esprima.Syntax.CallExpression:
            funcName += getArguments(test.arguments) + getAccessor(test.callee);
        break;
    }
    return funcName;
}
function replaceIfStatementWithBranchFunction(ifexpr, index, body,toContext) {
    var funcName = getFunctionNameFromTestExpr(ifexpr.test);
    addFunction(funcName,toContext,ifexpr,true);
    _.each(ifexpr.consequent.body,onEachExpressionInBody,toContext);
    if(ifexpr.alternate){
        _.each(ifexpr.alternate.body,onEachExpressionInBody,toContext);
    }
    var funcCall = create.getCallStatement(funcName);
    body.splice(index,1, funcCall);
    //get externals from funcCall and variables from body's function context
    // externals which match the vars can be passed as arguments
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


/*
* Where to put these additionally created functions!
* */
function addFunction(funcName,toContext,ifSt,isDecl){
    "use strict";
    var func = new create.FunctionExpression(funcName);
    if(isDecl){
        func.type = esprima.Syntax.FunctionDeclaration;
        toContext.body.push(func);
    }
    else{
        toContext.addAssignment(new create.Identifier(funcName),func);
    }
    func.body.body.push(ifSt);
}

