/**
 * Created by ganara.jpermunda on 24/07/2014.
 */
var _ = require("lodash");
var create = require("./create");
var escodegen = require("escodegen");

var coreobject = "$_coreobject_$";

function isFunction(str) {
    "use strict";
    var index = str.indexOf('()');
    return index !== -1 && index === str.length - 2;
}

function getFuncName(funcStr) {
    "use strict";
    var length = funcStr.length - 2;
    return funcStr.substr(0, length)
}



var prg;

function handleFirstFunction(parts){
    "use strict";
    var identifier;
    var first = _.first(parts);
    identifier = getFuncName(first);
    prg.addVariable(identifier);
    if(parts.length > 1){
        var idassign = prg.getAssignment(identifier);
        if(!idassign){
            var newfe = new create.FunctionExpression();
            prg.addAssignment(new create.Identifier(identifier),newfe);
            addToFunction(newfe, _.rest(parts));
        }
        else{
            if(idassign.right.type === "FunctionExpression"){
                //use the already existing function expression.
                addToFunction(idassign.right, _.rest(parts));
            }
        }

    }
    else{
        var funct = new create.FunctionExpression();
        funct.addReturn(new create.Literal(1));
        prg.addAssignment(new create.Identifier(identifier),funct);
    }
}

function handleFirstObject(parts){
    "use strict";
    var first = _.first(parts);
    prg.addVariable(first);
    var idassign = prg.getAssignment(first);
    if(parts.length > 1){
        //check if something is already assigned to that variable name.
        if(!idassign){
            //if not create the assignment
            var obj = new create.ObjectExpression();
            prg.addAssignment(new create.Identifier(first),obj);
            //add the rest of to the created object.
            addToObject(obj, _.rest(parts));
        }
        else{
            //if assignment already exists add to
            addToObject(idassign.right, _.rest(parts));
        }
    }
    else{
        //overwrites the existing... this should not happen!
        console.log("overwriting the existing assignment!!!!!! WARNING");
        prg.addAssignment(new create.Identifier(first),new create.Literal(1));
    }
}


function getCoreObject() {
    return prg.getAssignment(coreobject);
}
function handleThis(parts) {
    var co = getCoreObject();
    if(!co){
        prg.addVariable(coreobject)
        var core = new create.ObjectExpression();
        addToObject(core, _.rest(parts));
        prg.addAssignment(new create.Identifier(coreobject),core);
    }
    else{
        addToObject(co.right, _.rest(parts));
    }

}
function convertExpression(expr) {
    var parts = expr.split('.');
    var first = _.first(parts);
    if (isFunction(first)) {
        handleFirstFunction(parts);
    }
    else if(first === 'this'){
            handleThis(parts);
    }
    else{
        handleFirstObject(parts);
    }
}

function addToObject(obj,parts){

    "use strict";

    var first = _.first( parts );
    var identifier;
    var newObj,funcx;
    var currentProp;

    if ( isFunction(first) ) {
        identifier = getFuncName(first);
        if(parts.length > 1){
            currentProp = obj.getProperty(identifier);
            if(!currentProp){
                funcx = new create.FunctionExpression();
                obj.addProperty(new create.Identifier(identifier),addToFunction(funcx,_.rest(parts)));
            }
            else{
                addToFunction(currentProp,_.rest(parts));
            }
        }
        else{
            funcx = new create.FunctionExpression();
            funcx.addReturn(new create.Literal(1));
            obj.addProperty(new create.Identifier(identifier),funcx);
        }
    }
    else {
        if( parts.length > 1 ){
            currentProp = obj.getProperty(first);
            if(!currentProp){
                newObj = new create.ObjectExpression();
                obj.addProperty(new create.Identifier(first),newObj);
                addToObject(newObj,_.rest(parts))
            }
            else{
                addToObject(currentProp, _.rest(parts));
            }
        }
        else {
            currentProp = obj.getProperty(first);
            if(!currentProp){
                newObj = new create.ObjectExpression();
                obj.addProperty(new create.Identifier(first),new create.Literal(1));
            }
        }
    }
}

function getFunctionOrObject(parts){
    "use strict";
    var first = _.first(parts);
    if(isFunction(first)){
        return getFunction(parts);
    }
    var obj = new create.ObjectExpression();
    addToObject(obj,parts);
    return obj;
}

function addToFunction(funcx,parts){
    "use strict";
    var first = _.first(parts);
    var retVal = funcx.getReturnValue();
    var identifier;
    var newObj;
    if (isFunction(first)) {
        identifier = getFuncName(first);
        if(parts.length > 1){
            if(retVal){
                if(retVal.argument.type === "ObjectExpression"){
                    var newFunc = new create.FunctionExpression();
                    retVal.addProperty(new create.Identifier(identifier),addToFunction(newFunc,_.rest(parts)));
                }
                else if(retVal.argument.type === "Literal"){
                    newObj = new create.ObjectExpression();
                    newFunc = new create.FunctionExpression();
                    newObj.addProperty(new create.Identifier(identifier),addToFunction(newFunc,_.rest(parts)));
                    retVal.argument = newObj;
                }
            }
            else{
                newObj = new create.ObjectExpression();
                newFunc = new create.FunctionExpression();
                newObj.addProperty(new create.Identifier(identifier),addToFunction(newFunc,_.rest(parts)));
                funcx.addReturn( newObj );
            }
        }
        else{
                newObj = new create.ObjectExpression();
                newFunc = new create.FunctionExpression();
                newFunc.addReturn(new create.Literal(1));
                newObj.addProperty(new create.Identifier(identifier),newFunc);
                funcx.addReturn( newObj );
        }
    }
    else {
        if(parts.length > 1){
            if(retVal){
                if(retVal.argument.type === "ObjectExpression"){
                    var anoObject = new create.ObjectExpression();
                    retVal.addProperty(new create.Identifier(first),anoObject);
                    addToObject(anoObject, _.rest(parts));
                }
                else if(retVal.argument.type === "Literal"){
                    var anoObject = new create.ObjectExpression();
                    newObj = new create.ObjectExpression();
                    newObj.addProperty(new create.Identifier(first),anoObject);
                    addToObject(anoObject, _.rest(parts));
                    retVal.argument = newObj;
                }
            }
            else{
                newObj = new create.ObjectExpression();
                var anoObject = new create.ObjectExpression();
                newObj.addProperty(new create.Identifier(first),anoObject);
                addToObject(anoObject, _.rest(parts));
                funcx.addReturn( newObj );
            }
        }
        else{
            if(retVal){
                if(retVal.argument.type === "ObjectExpression"){
                    retVal.argument.addProperty(new create.Identifier(first),new create.Literal(1));
                }
                else if(retVal.argument.type === "Literal"){
                    newObj = new create.ObjectExpression();
                    newObj.addProperty(new create.Identifier(first),new create.Literal(1));
                    retVal.argument = newObj;
                }
            }
            else{
                newObj = new create.ObjectExpression();
                newObj.addProperty(new create.Identifier(first),new create.Literal(1));
                funcx.addReturn( newObj );
            }
        }
    }
    return funcx;
}

module.exports = {
    stub: function (expressions) {

        prg = new create.Program();
        for (var i = 0; i < expressions.length; i++) {
            /*var expr = expressions[i];
             var parts = expr.split('.');
             generated += generate(parts);*/
            convertExpression(expressions[i]);
        }
        //console.log(JSON.stringify(prg));
        return escodegen.generate(prg);
        //return JSON.stringify(parent);
    }
};
