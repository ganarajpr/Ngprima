var cq = require("./cquery");
var _ = require("lodash");
function Selection(){
    
}

module.exports.process = function(code){
    var selection = new Selection();
    selection.context = cq.process(code);
    return selection;
};

Selection.prototype.select = function(selectExpression){
    var expressions;
    if(_.isString(selectExpression)){
        expressions = selectExpression.split(" ");
    }
    else{
        expressions = selectExpression;
    }
    return processExpressions(expressions,this);
};

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

Selection.prototype.getFunctionByName = function(name){
    return getFunctionByName(name,this.context);
};


function getFunctionByName(name,context){
    for (var i = 0; i < context.childContexts.length; i++) {
        if(context.childContexts[i].name === name){
            return context.childContexts[i];
        }
        else{
            var ctx = getFunctionByName(name,context.childContexts[i]);
            if(ctx){
                return ctx;
            }
        }

    }
};









