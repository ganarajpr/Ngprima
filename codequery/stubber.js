/**
 * Created by ganara.jpermunda on 24/07/2014.
 */
var _ = require("lodash");
var create = require("./create");
var escodegen = require("escodegen");

function isFunction(str) {
    "use strict";
    var index = str.indexOf('()');
    return index !== -1 && index === str.length - 2;
}

function getFuncName(funcStr) {
    "use strict";
    var length = funcStr.length - 2;
    return funcStr.substr(0, length)
}



var prg;


function convertExpression(expr) {
    var parts = expr.split('.');
    var identifier;
    var first = _.first(parts);
    if (isFunction(first)) {
        identifier = getFuncName(first);
        prg.addVariable(identifier);
        if(parts.length > 1){
            prg.addAssignment(new create.Identifier(identifier),new create.FunctionExpression());
        }
        else{
            var funct = new create.FunctionExpression();
            funct.addReturn(new create.Literal(1));
            prg.addAssignment(new create.Identifier(identifier),funct);
        }

    }
    else {
        prg.addVariable(first);
        if(parts.length > 1){
            var obj = new create.ObjectExpression();
            prg.addAssignment(new create.Identifier(first),obj);
            addToObject(obj, _.rest(parts));
        }
        else{
            prg.addAssignment(new create.Identifier(first),new create.Literal(1));
        }
    }
}

function addToObject(obj,parts){
    "use strict";
    var first = _.first(parts);
    var identifier;
    if (isFunction(first)) {
        identifier = getFuncName(first);
        if(parts.length > 1){
            obj.addProperty(new create.Identifier(identifier),getFunction(_.rest(parts)));
        }
        else{
            var funct = new create.FunctionExpression();
            funct.addReturn(new create.Literal(1));
            obj.addProperty(new create.Identifier(identifier),funct);
        }
    }
    else {
        if(parts.length > 1){
            var newObj = new create.ObjectExpression();
            obj.addProperty(new create.Identifier(first),newObj);
            addToObject(newObj,_.rest(parts))
        }
        else{
            obj.addProperty(new create.Identifier(first),new create.Literal(1));
        }
    }
}

function getFunctionOrObject(parts){
    "use strict";
    var first = _.first(parts);
    if(isFunction(first)){
        return getFunction(parts);
    }
    var obj = new create.ObjectExpression();
    addToObject(obj,parts);
    return obj;
}

function getFunction(parts){
    "use strict";
    var funcx = new create.FunctionExpression();
    var first = _.first(parts);
    var identifier;
    if (isFunction(first)) {
        identifier = getFuncName(first);
        if(parts.length > 1){
            var newObj = new create.ObjectExpression();
            newObj.addProperty(new create.Identifier(identifier),getFunction(_.rest(parts)));
            funcx.addReturn( newObj );
        }
        else{
            var newObj = new create.ObjectExpression();
            var anofunc = new create.FunctionExpression();
            anofunc.addReturn(new create.Literal(1));
            newObj.addProperty(new create.Identifier(identifier),anofunc);
            funcx.addReturn( newObj );
        }
    }
    else {
        if(parts.length > 1){
            var newObj = new create.ObjectExpression();
            obj.addProperty(new create.Identifier(first),addToObject(newObj,_.rest(parts)));
        }
        else{
            obj.addProperty(new create.Identifier(first),new create.Literal(1));
        }
    }
    return funcx;
}

module.exports = {
    stub: function (expressions) {

        prg = new create.Program();
        for (var i = 0; i < expressions.length; i++) {
            /*var expr = expressions[i];
             var parts = expr.split('.');
             generated += generate(parts);*/
            convertExpression(expressions[i]);
        }
        return escodegen.generate(prg);
        //return JSON.stringify(parent);
    }
};
