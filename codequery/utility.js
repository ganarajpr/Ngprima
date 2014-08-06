/**
 * Created by ganara.jpermunda on 06/08/2014.
 */



module.exports = {
    resolveMemberExpression : function resolveMemberExpression(expr){
            var accessor = "";
            if(expr.type === "Identifier"){
                accessor = expr.name;
            }
            if(expr.type === "MemberExpression"){
                if(expr.object.type === "MemberExpression"){
                    accessor += resolveMemberExpression(expr.object) + ".";
                }
                else if (expr.object.type === "Identifier"){
                    accessor = expr.object.name + ".";
                }
                else if( expr.object.type === "ThisExpression"){
                    accessor = "this" + ".";
                }
                else if (expr.object.type === "CallExpression"){
                    accessor += getCallee(expr.object.callee)+".";
                }

                accessor += expr.property.name;
            }
            return accessor;
    },
    fullAccessor : function fullAccessor(expr){
        var str = this.resolveMemberExpression(expr);
        var splitString = str.split(".");
        var capsStrings = splitString.map(this.capitalize);
        return capsStrings.join("");
    },
    capitalize : function capitalize(str){
        str = str.substring(0,1).toUpperCase() + str.substring(1);
        return str;
    }
};