/**
 * Created with IntelliJ IDEA.
 * User: Ganaraj
 * Date: 24/07/14
 * Time: 23:00
 * To change this template use File | Settings | File Templates.
 */

var _ = require('lodash');

function Program() {
    "use strict";
    this.type = 'Program';
    this.body = [];
};


function addVariable(body,variable){
    var index = _.findIndex(body,function(exp){
        "use strict";
        return exp instanceof VariableDeclaration;
    });
    if(index < 0){
        body.push(new VariableDeclaration());
        index = body.length -1;
    }
    var vardecl = body[index];
    vardecl.addVariable(variable);
}

Program.prototype.addVariable = function (variable) {
    addVariable(this.body,variable);
};

Program.prototype.addAssignment = function(left,right){
    var assign = new Assignment(left,right);
    var expr = new ExpressionStatement(assign);
    this.body.push(expr);
};


function VariableDeclaration(){
    "use strict";
    this.type = "VariableDeclaration";
    this.declarations = [];
    this.kind = "var";
}

VariableDeclaration.prototype.addVariable = function(name){
    "use strict";
    this.declarations.push(new VariableDeclarator(name));
};

function VariableDeclarator(name){
    "use strict";
    this.type = "VariableDeclarator";
    this.id = new Identifier(name);
    this.init = null;
}

function Identifier(name){
    "use strict";
    this.type = "Identifier";
    this.name = name;
}


function Literal(name){
    this.type = 'Literal';
    this.value = name;
    //this.raw = JSON.stringify(name);
}


function Assignment(left,right){
    this.type = 'AssignmentExpression';
    this.operator = '=';
    this.left = left;
    this.right = right;
}

function ExpressionStatement(expression){
    this.type = 'ExpressionStatement';
    this.expression = expression;
}

function BlockStatement(){
    this.type = 'BlockStatement';
    this.body = [];
}


FunctionExpression.prototype.addVariable = function(name){
    addVariable(this.body.body,name);
};


function FunctionExpression(name){
    this.type = 'FunctionExpression';
    if(name){
        this.id = new Identifier(name);
    }
    else{
        this.id = null;
    }
    this.params = [];
    this.defaults = [];
    this.body = new BlockStatement();
    this.rest = null;
    this.generator = false;
    this.expression = false;
}


FunctionExpression.prototype.addReturn = function(returnValue){
    //return value should either be a literal or an Identifier or an expression ( array or object expression )
    var ret = new ReturnStatement(returnValue);
    this.body.body.push(ret);
};

FunctionExpression.prototype.addVariableArgument = function(name){
    this.params.push(new Identifier(name));
};


function ReturnStatement(arg){
    this.type = 'ReturnStatement';
    this.argument = arg;
}

function ObjectExpression(){
    this.type = 'ObjectExpression';
    this.properties = [];
}

ObjectExpression.prototype.addProperty = function(key,value){
    var prop = {
        type : 'Property',
        key : key,
        value : value,
        kind : 'init'
    };
    this.properties.push(prop);
};


function ArrayExpression(){
    this.type = 'ArrayExpression';
    this.elements = [];
}

ArrayExpression.prototype.addItem = function(item){
    this.elements.push(item);
};

/*FunctionExpression.prototype.addLiteralArgument = function(val){
    this.params.push(new Literal(val));
};*/


module.exports = {
    Program: Program,
    VariableDeclaration: VariableDeclaration,
    Assignment : Assignment,
    Identifier : Identifier,
    Literal : Literal,
    FunctionExpression : FunctionExpression,
    ObjectExpression : ObjectExpression,
    ArrayExpression : ArrayExpression

};
