/**
 * Created by ganara.jpermunda on 24/07/2014.
 */
var _ = require("lodash");

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

module.exports = {
    stub : function (expressions){
        var parent = {};
        for (var i = 0; i < expressions.length; i++) {
            namespace(expressions[i],parent);
        }
        return JSON.stringify(parent);
    }
};
