var cq = require("./cquery");
var _ = require("lodash");
function Selection(context){
    this.context = context;
}

var selector = module.exports.process = function(code){
    var context = cq.process(code);
    var selection = new Selection(context);
    return selection;
}


Selection.prototype.getContextByName = function(name){
    "use strict";
    return getContext(this.context,name);
};


Selection.prototype.getExternals = function(name){
    "use strict";
    var ctx = this.getContextByName(name);
    var externals = [];
    if(ctx){
        var expressions = ctx.expressions;
        var vars = _.pluck(ctx.variables,'name');
        externals = filterExpressions(expressions,vars);
    }
    return externals;
}

function filterExpressions(expr,vars){
    "use strict";
    var externalExpr = _.uniq(expr);
    for (var i = 0; i < expr.length; i++) {
        var splitExpr = expr[i].split(".");
        for (var j = 0; j < vars.length; j++) {
            if(vars[j] === splitExpr[0]){
                externalExpr[i] = undefined;
                break;
            }
        }
    }
    externalExpr = _.compact(externalExpr);
    return _.uniq(externalExpr);
}

function getContext(context,name){
    "use strict";
    for (var i = 0; i < context.childContexts.length; i++) {
        if(context.childContexts[i].name === name){
            return context.childContexts[i];
        }
        else{
            var ctx =  getContext(context.childContexts[i],name);
            if(ctx){
                return ctx;
            }
        }
    }
}

Selection.prototype.select = function(selectExpression){
    var expressions;
    if(_.isString(selectExpression)){
        expressions = selectExpression.split(" ");
    }
    else{
        expressions = selectExpression;
    }
    return processExpressions(expressions,this);
}

function processExpressions(exprs, selection){
    var currentSelection = selection;
    var i = 0;
    var next;
    while( i < exprs.length){
        if(exprs === "function"){
            next = exprs[i+1];
            var pos = getPosition(next);
            var ctx = currentSelection.context.getFunctionByPosition(pos);
            
        }
        i++;
    }
}

function getPosition(index){
    var num = parseInt(next,10);
    num = num === NaN ? 0 : num;
    return num;
}








