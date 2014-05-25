var esprima = require('esprima');
var escodegen = require('escodegen');


function traverse(node, func) {
    func(node);
    for (var key in node) {
        if (node.hasOwnProperty(key)) {
            var child = node[key];
            if (typeof child === 'object' && child !== null) {

                if (Array.isArray(child)) {
                    child.forEach(function(node) {
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func);
                }
            }
        }
    }
}


exports.parse = function(code){
    var ast = esprima.parse(code);
    return ast;
};

exports.getAllFunctions = function(ast){
    var funcs = [];
    function onFunc(node) {
        if(node.type === "FunctionExpression" || node.type === "FunctionDeclaration") {
            funcs.push(node);
        }
    }
    if(Array.isArray(ast)){
        ast.forEach(function(ast1){
            traverse(ast1, onFunc);
        });
    }
    else{
        traverse(ast, onFunc);
    }

    return funcs;
};


exports.getAllAssignments = function(ast){
    var assignments = [];
    function onNode(node) {
        if(node.type === "AssignmentExpression" && node.operator === "=") {
            assignments.push(node);
        }
    }
    if(Array.isArray(ast)){
       ast.forEach(function(ast1){
           traverse(ast1, onNode);
       });
    }
    else{
        traverse(ast, onNode);
    }

    return assignments;
};

exports.whereObject = function(ast,objectName){
    var matchFound = false;
    traverse(ast, function(node) {
        if(node.type === "MemberExpression" && node.object.name === objectName) {
            matchFound = true;
        }
    });
    return matchFound;
}
