var esprima = require("esprima");
var escodegen = require("escodegen");
var traverse = require("traverse");
var _ = require("underscore");
var jsel = require("JSONSelect");

var esprimaOptions = {
    comment: true,
    range: true,
    loc: false,
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

function Context(ast,parentContext,type,name){
    this.childContexts = [];
    this.parentContext = parentContext;
    this.ast = ast;
    this.type = type;
    this.name = name;
    this.variables = [];
    
    //insertion points 
    // each child block statement is an insertion point.
    //we have block statements for For, If, Else, Switch etc. 
    
    if(parentContext){
        parentContext.childContexts.push(this);
    }
    this.init();
}

Context.prototype.print = function(){
    console.log(this.name);
    var vars = this.variables.map(function(variable){
        return variable.name;
    })
    console.log(vars);
    this.childContexts.forEach(function(context){
        context.print();
    })
}


Context.prototype.toString = function () {
    return escodegen.generate(this.ast, escodegenOptions);
};

Context.prototype.init = function(){
    var body = getBody(this.ast);
    processBodyofStatements(this,body);
};

Context.prototype.get = function(type){
    
};

Context.prototype.create = function(type){
    
};


function getBody(ast){
    var body;
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

function processBodyofStatements(context,body){
    if( body && body.length){
        body.forEach(function(expr){
            switch (expr.type){
                case "VariableDeclaration" :
                    if(expr.declarations.length){
                        processVariableDeclarations(context,expr);        
                    }
                break;
                case "FunctionDeclaration":
                    processFunctionDeclaration(context,expr,"",expr.params);
                break;
                case "ExpressionStatement":
                    processExpressionStatement(context,expr);
                break;
                case "ForStatement":
                    processForStatement(context,expr);
                break;
                case "IfStatement":
                    processIfStatement(context,expr);
                break;
                case "SwitchStatement":
                    processSwitchStatement(context,expr);
                break;
                default:
                    //console.log("Unprocessed expression : ", expr.type);
            }
        });
    }
}

function processIfStatement(context,expr){
    if(expr.consequent && expr.consequent.type === "BlockStatement"){
        var body = getBody(expr.consequent);
        processBodyofStatements(context,body);
    }
    if(expr.alternate && expr.alternate.type === "BlockStatement"){
        var body = getBody(expr.alternate);
        processBodyofStatements(context,body);
    }
}


function processSwitchStatement(context,expr){
    if(expr.cases && expr.cases.length){
        expr.cases.forEach(function(eachCase){
            processBodyofStatements(context,eachCase.consequent);
        });
    }
}


function processForStatement(context,expr){
    if(expr.init && expr.init.type === "VariableDeclaration"){
        processVariableDeclarations(context,expr.init);
    }
    var body = getBody(expr);
    processBodyofStatements(context,body);
}


function processExpressionStatement(context,expr){
    var expression = expr.expression;
    switch (expression.type){
        case "AssignmentExpression" :
            processAssignment(context,expr);
        break;
        case "CallExpression":
            processFunctionCall(context,expression);
        break;
        case "ArrayExpression":
            processArray(context,expression);
        break;
        default:
            //console.log("Unprocessed expression : ", expr.type);
    }
}

function processAssignment(context,expr){
    var expression = expr.expression ? expr.expression : expr;
    if(expression.right.type === "FunctionExpression"){
        processFunctionDeclaration(context,expression.right,getAssignmentLeft(expression),expression.right.params);
    }
    else if(expression.right.type === "ArrayExpression"){
        processArray(context,expression.right);
    }
}


function processArray(context,expr){
    expr.elements.forEach(function(element){
        if(element.type === "FunctionExpression"){
            processFunctionDeclaration(context,element,"",element.params);
        }
    })
}

function resolveMemberExpression(expr){
    var accessor = "";
    if(expr.type === "Identifier"){
        accessor = expr.name;
    }
    if(expr.type === "MemberExpression"){
        if(expr.object.type === "MemberExpression"){
            accessor += resolveMemberExpression(expr.object) + ".";
        }
        else if (expr.object.type === "Identifier"){
            accessor = expr.object.name + ".";
        }
        
        accessor += expr.property.name;
    }
    return accessor;
}

function fullAccessor(expr){
    var str = resolveMemberExpression(expr);
    var splitString = str.split(".");
    var capsStrings = splitString.map(function(str){
        return capitalize(str);
    });
    return capsStrings.join("");
}

function capitalize(str){
    str = str.substring(0,1).toUpperCase() + str.substring(1);
    return str;
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
    if(expr.callee.type === "FunctionExpression"){
        processFunctionDeclaration(context,expr.callee,"",expr.callee.params);
    }
    else if ( expr.arguments.length){
        expr.arguments.forEach(function(arg){
            if(arg.type === "FunctionExpression"){
                processFunctionDeclaration(context,arg,fullAccessor(expr.callee),arg.params);
            }
            if(arg.type === "ArrayExpression"){
                processArray(context,arg);
            }
        });
    }
}

function addParams(context,params){
    for(var i=0;i<params.length;i++){
        if(params[i].type === "Identifier"){
            context.variables.push(new Variable(params[i].name,context.ast,context));
        }
    }
}

function processVariableDeclarations(context,expr){
    var declarations = expr.declarations;
    declarations.forEach(function(decl){
        if(decl.type === "VariableDeclarator"){
            context.variables.push(new Variable(decl.id.name,expr,context));
            if(decl.init ) {
                if(decl.init.type === "FunctionExpression"){
                    processFunctionDeclaration(context,decl.init,decl.id.name,decl.init.params);
                }
                if(decl.init.type === "AssignmentExpression"){
                    processAssignment(context,decl.init);
                }
            }
        }
    });
}

function processFunctionDeclaration(context,expr, name,params){
    var funcName = expr.id ? expr.id.name : name;
    var ctx = new Context(expr,context,expr.type,funcName);
    addParams(ctx,params);
}


function Variable(name,ast,context){
    this.name = name;
    this.ast = ast;
    this.context = context;
}



