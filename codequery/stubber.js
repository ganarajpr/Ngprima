/**
 * Created by ganara.jpermunda on 24/07/2014.
 */
var _ = require("lodash");

module.exports = {
    stub : function (expressions){
        var groupedExpr = _.groupBy(expressions,function(expr){
            var splitExpr = expr.split('.');
            return splitExpr[0];
        });
        var mapped = _.mapValues(groupedExpr,function(val){
            var removeFirst = _.map(val,function(v){
                var split = v.split('.');
                if(split.length > 1){
                    split.shift();
                    return split.join('.');
                }
                else{
                    return null;
                }
            });

            return removeFirst;
            //return _.compact(removeFirst);
        });

        console.log(groupedExpr);
        console.log(mapped);

    }

};