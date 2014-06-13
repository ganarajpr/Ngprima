var esprima = require("esprima");
var escodegen = require("escodegen");
var traverse = require("traverse");
var _ = require("underscore");
var jsel = require("JSONSelect");

var esprimaOptions = {
    comment: true,
    range: true,
    loc: false,
    tokens: true,
    raw: false
};

var escodegenOptions = {
    comment: true,
    format: {
        indent: {
            adjustMultilineComment: true
        }
    }
};

var contexts = [];
var cq = module.exports = function (code) {
    this.ast = esprima.parse(code, esprimaOptions);
    this.code = code;
    cq.rootContext = new Context(this.ast,null,this.ast.type,"__$$PROGRAM$$__");
    cq.rootContext.print();
};

Context.prototype.print = function(){
    console.log(this.name);
    console.log(this.variables,this.functions);
    this.childContexts.forEach(function(context){
        context.print();
    })
}


Context.prototype.toString = function () {
    return escodegen.generate(this.ast, escodegenOptions);
};


function Context(ast,parentContext,type,name){
    this.childContexts = [];
    this.parentContext = parentContext;
    this.ast = ast;
    this.type = type;
    this.name = name;
    this.variables = [];
    this.functions = [];
    if(parentContext){
        parentContext.childContexts.push(this);
    }
    this.init();
}

Context.prototype.init = function(){
    process(this);
};


function getBody(context){
    var body;
    var ast = context.ast;
    if(_.isArray(ast.body)){
        body = ast.body;
    }
    else{
        if( ast.body.type === "BlockStatement" && _.isArray(ast.body.body) ){
            body = ast.body.body;
        }
        else{
            console.log(ast.body.type);
        }
    }
    return body;
}

function process(context){
    var body = getBody(context);
    if( body && body.length){
        body.forEach(function(expr){
            switch (expr.type){
                case "VariableDeclaration" :
                    if(expr.declarations.length){
                        processVariableDeclarations(context,expr);        
                    }
                break;
                case "FunctionDeclaration":
                    processFunctionDeclaration(context,expr);
                break;
                case "ExpressionStatement":
                    processExpressionStatement(context,expr);
                break;
                default:
                    //console.log("Unprocessed expression : ", expr.type);
            }
        });
    }
}


function processExpressionStatement(context,expr){
    var expression = expr.expression;
    switch (expression.type){
        case "AssignmentExpression" :
            processAssignment(context,expr);
        break;
        case "CallExpression":
            processFunctionCall(context,expr);
        break;
        default:
            //console.log("Unprocessed expression : ", expr.type);
    }
}

function processAssignment(context,expr){
    
    var expression = expr.expression;
    if(expression.right.type === "FunctionExpression"){
        console.log(escodegen.generate(expr));
        processFunctionDeclaration(context,expression.right,getAssignmentLeft(expression));
    }
}
                                   
function getAssignmentLeft(expr){
    var left = "";
    if(expr.left.type === "Identifier"){
        left = expr.left.name;
    }
    else if(expr.left.type === "MemberExpression"){
        left = expr.left.property.name;
    }
    return left;
}                               

function processFunctionCall(context,expr){
    
}



function processVariableDeclarations(context,expr){
    var declarations = expr.declarations;
    declarations.forEach(function(decl){
        if(decl.type === "VariableDeclarator"){
            context.variables.push(decl.id.name);
        }
    });
}

function processFunctionDeclaration(context,expr, name){
    var funcName = expr.id ? expr.id.name : name;
    context.functions.push(funcName);
    new Context(expr,context,expr.type,funcName);
}

Context.prototype.get = function(type){
    
};

Context.prototype.create = function(type){
    
};

