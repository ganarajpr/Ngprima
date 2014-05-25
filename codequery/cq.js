var esprima = require("esprima");
var escodegen = require("escodegen");
var traverse = require("traverse");
var _ = require("underscore");

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
var cq = module.exports = function (code) {
    this.program = esprima.parse(code, esprimaOptions);
    this.code = code;
};


cq.prototype.toString = function () {
    return escodegen.generate(this.program, escodegenOptions);
};


cq.prototype.callsToFunction = function (functionName) {
    var calls = [];
    traverse(this.program).forEach(function (x) {
        if (x && x.type === "CallExpression") {
            var callee = x.callee;

            if (callee &&
                callee.type === "Identifier" &&
                callee.name === functionName) {
                calls.push(new FunctionCall(x, false));
            }
            if (callee &&
                callee.property &&
                callee.property.name === functionName
                ) {
                calls.push(new FunctionCall(x, false));
            }
        }
    });
    return new FunctionCall(calls, true);
};

function FunctionCall(code, isArray) {
    this.isArray = isArray;
    this.code = code;
}

FunctionCall.prototype.toString = function () {
    if (this.isArray) {
        var returnString = this.code.map(function (code) {
            return code.toString();
        });
        return returnString;
    }
    return escodegen.generate(this.code, escodegenOptions);
};

FunctionCall.prototype.caller = function (caller) {
    if( caller ){
        caller = caller.replace('\"',"'")
    }
    if (this.isArray) {
        var callers = this.code.map(function(code){
            return code.caller(caller);
        });

        callers = _.compact(callers);
        return new FunctionCall(callers,true);
    }
    var callee = this.code.callee;
    if (callee &&
        callee.type === "MemberExpression" &&
        caller) {
        var clone = traverse(this.code).clone();
        clone.type = "ExpressionStatement";
        clone.expression = clone.callee;
        clone.callee.property.name = "$$$$____$$$$";
        delete clone.callee;
        var expr = escodegen.generate(clone);
        expr = expr.replace(".$$$$____$$$$;","");

        if( expr === caller){
            return new FunctionCall(this.code,false);
        }
    }

    if( callee &&
        callee.type === "Identifier" &&
        !caller){
        return new FunctionCall(this.code,false);
    }
    return null;
};

