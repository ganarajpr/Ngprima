var cq = require("./cquery");
var _ = require("lodash");
function Selection(){
    
}

var selector = module.exports.process = function(code){
    var selection = new Selection();
    selection.context = cq.process(code);
    return selection;
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








