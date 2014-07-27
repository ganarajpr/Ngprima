var esprima = require("esprima");
var escodegen = require("escodegen");
var _ = require("lodash");

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
var cq = module.exports.process = function (code) {
    var ast = esprima.parse(code, esprimaOptions);
    var rootContext = new Context(ast,null,ast.type,"__$$PROGRAM$$__");
    return rootContext;
};



function Context(ast,parentContext,type,name){
    this.childContexts = [];
    this.parentContext = parentContext;
    this.ast = ast;
    this.type = type;
    this.name = name;
    this.variables = [];
    this.forLoops = [];
    this.SwitchStatements = [];
    this.expressions = [];
    this.ifs = [];
    this.externals = [];
    //insertion points 
    // each child block statement is an insertion point.
    //we have block statements for For, If, Else, Switch etc. 
    
    if(parentContext){
        parentContext.childContexts.push(this);
    }
    this.init();
    //this.processExternals();
}

Context.prototype.print = function(){
    console.log(this.name);
    var vars = this.variables.map(function(variable){
        return variable.name;
    });
    console.log("Variables");
    console.log(vars);
    console.log("Expressions");
    console.log(this.expressions);
    this.childContexts.forEach(function(context){
        context.print();
    })
}

Context.prototype.processExternals = function(){
    var groupedByFirst = _.groupBy(this.expressions,function(expr){
        var splitExpr = expr.split('.');
        return splitExpr[0];
    });
    for (var i = 0; i < this.variables.length; i++) {
        delete groupedByFirst[this.variables[i].name];
    }
    var externals = _(groupedByFirst)
        .values()
        .flatten()
        .uniq();

    this.externals = externals.value();
};


Context.prototype.toString = function () {
    return escodegen.generate(this.ast, escodegenOptions);
};

Context.prototype.init = function(){
    var body = getBody(this.ast);
    processBodyofStatements(this,body);
};

Context.prototype.getFunctionByPosition = function(position){
    if(this.childContexts.length > position)
        return this.childContexts[position];
    return null;
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
            //console.log(ast.body.type);
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
                case "ForInStatement":
                    processForInStatement(context,expr);
                    break;
                case "WhileStatement":
                    processWhileStatement(context,expr);
                break;
                case "DoWhileStatement":
                    processWhileStatement(context,expr);
                break;
                case "IfStatement":
                    processIfStatement(context,expr);
                break;
                case "SwitchStatement":
                    processSwitchStatement(context,expr);
                break;
                default:
                    console.log("Unprocessed expression : ", expr.type);
            }
        });
    }
}

function processSequenceExpression(context, expr) {
    expr.expressions.forEach(function(expression){
        storeExpression(context,expression);
    });
}
function storeExpression(context,expr){
    if(expr.type === "MemberExpression"){
        context.expressions.push(resolveMemberExpression(expr));
    }
    if(expr.type === "Identifier"){
        context.expressions.push(expr.name);
    }
    if(expr.type === "CallExpression"){
        var callee = getCallee(expr.callee);
        if(callee){
            context.expressions.push(callee);
        }
    }
}



function processIfStatement(context,expr){
    context.ifs.push(expr);
    storeExpression(context,expr.test);
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
    processExpressionStatement(context,expr.discriminant);
    context.SwitchStatements.push(expr);
    if(expr.cases && expr.cases.length){
        expr.cases.forEach(function(eachCase){
            processBodyofStatements(context,eachCase.consequent);
        });
    }
}


function processForStatement(context,expr){
    if(expr.init){
        if(expr.init.type === "VariableDeclaration"){
            processVariableDeclarations(context,expr.init);
        }
        else{
            storeExpression(context,expr.init);
        }
    }
    if(expr.test){
        storeExpression(context,expr.test);
    }
    if(expr.update){
        storeExpression(context,expr.update);
    }
    context.forLoops.push(expr);
    var body = getBody(expr);
    processBodyofStatements(context,body);
}

function processForInStatement(context,expr){
    if(expr.left){
        if(expr.left.type === "VariableDeclaration"){
            processVariableDeclarations(context,expr.left);
        }
        else{
            storeExpression(context,expr.left);
        }
    }
    if(expr.right){
        storeExpression(context,expr.right);
    }
    context.forLoops.push(expr);
    var body = getBody(expr);
    processBodyofStatements(context,body);
}

function processWhileStatement(context,expr){
    if(expr.test){
        storeExpression(context,expr.test);
    }
    var body = getBody(expr);
    processBodyofStatements(context,body);
}


function processConditionalExpression(context, expression) {
    processExpressionStatement(context,expression.test);
    processExpressionStatement(context,expression.consequent);
    processExpressionStatement(context,expression.alternate);
}
function processNewExpression(context, expression) {
    processExpressionStatement(context,expression.callee);
    expression.arguments.forEach(function(arg){
        processExpressionStatement(context,arg);
    });
}

function processExpressionStatement(context,expr){
    var expression = expr.expression ? expr.expression : expr;
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
        case "Literal":
        case "ObjectExpression":
        case "ThisExpression":
        break;

        case "NewExpression":
            processNewExpression(context,expression);
        break;

        case "MemberExpression":
        case "Identifier":
            storeExpression(context,expression);
        break;

        case "ExpressionStatement":
            processExpressionStatement(context,expression);
        break;
        case "ConditionalExpression":
            processConditionalExpression(context,expression);
        break;
        case "FunctionExpression":

        break;
        case "UpdateExpression":
        case "UnaryExpression":
            processExpressionStatement(context,expression.argument);
        break;
        case "BinaryExpression":
        case "LogicalExpression":
            processExpressionStatement(context,expression.left);
            processExpressionStatement(context,expression.right);
        break;
        default:
            console.log("Unprocessed expression : ", expression);

    }
    //storeExpression(context,expression);
}

function processAssignment(context,expr){
    var expression = expr.expression ? expr.expression : expr;
    if(expression.right.type === "FunctionExpression"){
        processFunctionDeclaration(context,expression.right,getAssignmentLeft(expression),expression.right.params);
    }
    else{
        processExpressionStatement(context,expression.right);

    }
    processExpressionStatement(context,expression.left);
}


function processArray(context,expr){
    expr.elements.forEach(function(element){
        if(element.type === "FunctionExpression"){
            processFunctionDeclaration(context,element,"",element.params);
        }
        else{
            processExpressionStatement(context,element);
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
        else if( expr.object.type === "ThisExpression"){
            accessor = "this" + ".";
        }
        else if (expr.object.type === "CallExpression"){
            accessor += getCallee(expr.object.callee)+".";
        }
        
        accessor += expr.property.name;
    }
    return accessor;
}

function fullAccessor(expr){
    var str = resolveMemberExpression(expr);
    var splitString = str.split(".");
    var capsStrings = splitString.map(capitalize);
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

function getCallee(callee){
    if(callee.type === "MemberExpression"){
        return resolveMemberExpression(callee)+"()";
    }
    if(callee.type === "Identifier"){
        return callee.name+"()";
    }
    if(callee.type === "CallExpression"){
        return getCallee(callee.callee)+"()";
    }
}

function processFunctionCall(context,expr){
    if(expr.callee.type === "FunctionExpression"){
        processFunctionDeclaration(context,expr.callee,"",expr.callee.params);
    }
    storeExpression(context,expr);
    if ( expr.arguments.length){
        expr.arguments.forEach(function(arg){
            if(arg.type === "FunctionExpression"){
                processFunctionDeclaration(context,arg,fullAccessor(expr.callee),arg.params);
            }
            processExpressionStatement(context,arg);
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
            if(decl.init) {
                if(decl.init.type === "FunctionExpression"){
                    processFunctionDeclaration(context,decl.init,decl.id.name,decl.init.params);
                }
                processExpressionStatement(context,decl.init);
                storeExpression(context,decl.init);
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



