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

exports.getAllAssignments = function(ast){
    var funcExpressions = [];
    traverse(ast, function(node) {
        if(node.type === "AssignmentExpression" && node.operator === "=") {
            //if (node.right.type === "FunctionExpression") {
                console.log(escodegen.generate(node));
                funcExpressions.push(node);
            //}
        }
    });
};
