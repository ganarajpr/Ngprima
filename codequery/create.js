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

Program.prototype.addVariable = function (variable) {
    var index = _.findIndex(this.body,function(exp){
        "use strict";
        return exp instanceof VariableDeclaration;
    });
    if(index < 0){
        this.body.push(new VariableDeclaration());
        index = this.body.length -1;
    }
    var vardecl = this.body[index];
    vardecl.addVariable(variable);
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


module.exports = {
    Program: Program,
    VariableDeclaration: VariableDeclaration,
    Assignment : Assignment,
    Identifier : Identifier,
    Literal : Literal

};
