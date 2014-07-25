/**
 * Created by ganara.jpermunda on 24/07/2014.
 */
var _ = require("lodash");
var create = require("./create");
var escodegen = require("escodegen");

function isFunction(str){
    "use strict";
    var index = str.indexOf('()');
    return index !== -1 && index === str.length - 2;
}

function getFuncName(funcStr){
    "use strict";
    var length = funcStr.length -2;
    return funcStr.substr(0,length)
}


function namespace(namespaceString,parent) {
    var parts = namespaceString.split('.'),
        currentPart = '';
    var i = 0;
    var toBeAppended = '';

    while(i < parts.length){
        currentPart = parts[i];
        if(isFunction(currentPart)){

            toBeAppended += 'function(){';
            toBeAppended += addReturnValue(parts,i+1);
            toBeAppended += '}';
            parent[getFuncName(currentPart)] = toBeAppended;
            break;
        }
        else{
            parent[currentPart] = parent[currentPart] || {};
            parent = parent[currentPart];
        }
        i++;
    }
    return parent;
}


function generate(parts){
    "use strict";
    var returnString = '';
    if(parts.length > 1){
        if(isFunction(_.first(parts))){
            returnString += getFuncName(_.first(parts)) + ':function(){ return {' + generate(_.rest(parts)) + '}; }';
        }
        else{
            returnString += _.first(parts) +': {'+ generate(_.rest(parts)) + '}';
        }
    }
    else{
        if(isFunction(_.first(parts))){
            returnString += getFuncName(_.first(parts)) + ':function(){ return; ' + '}';
        }
        else{
            returnString += _.first(parts) +': {'+ '}';
        }
    }
    return returnString;
}

function addReturnValue(parts,currentIndex){
    "use strict";
    var str = '';
    if(currentIndex < parts.length){
        var currentPart = parts[currentIndex];
        if(isFunction(currentPart)){
            str += 'return {';
            str += getFuncName(currentPart) + ': ';
            str += 'function(){';
            str += 'return '
            str += addReturnValue(parts,currentIndex+1);
            str += '}';
            str += '}';
        }
        else{
            str += 'return ';
            str += '{';
            str += currentPart;
            str += ' : ';
            str += addReturnValue(parts,currentIndex+1);
            str += '};';
        }
    }
    return str;
}

function convertExpression(expr){
    var parts = expr.split('.');
    var funcName;
    if( isFunction( _.first(parts) ) ){
        funcName = getFuncName(parts[0]);
        prg.addVariable(funcName);
    }
    else{

    }

}

var prg;

    module.exports = {
    stub : function (expressions){
        var generated = ''

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
