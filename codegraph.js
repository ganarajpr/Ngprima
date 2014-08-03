/**
 * Created with IntelliJ IDEA.
 * User: Ganaraj
 * Date: 03/08/14
 * Time: 12:03
 * To change this template use File | Settings | File Templates.
 */


var Digraph = require("graphlib").Digraph;
var selector = require('./codequery/selector');
var _ = require("lodash");


var codegraph = {};


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

codegraph.createGraph = function(code){
    "use strict";
    var selection = selector.process(code);
    var g = new Digraph();
    var contextMap = selection.getFunctionContextMap();
    //does not contain anonymous functions
    var contexts = _.keys(contextMap);
    _.each(contexts, function(f){
        if(!g.hasNode(f)){
            g.addNode(f);
        }
    });


    _.forIn(contextMap,function(value,key){
        console.log(value.externals);
        var externalCalls = _.filter(value.externals,function(ext){
            return isFunction(ext);
        })
        _.each(externalCalls,function(e){
            var splitCall = e.split('.');
            var lastCall = _.last(splitCall);
            var lastCallName = getFuncName(lastCall);

            if(!g.hasNode(lastCallName)){
                g.addNode(lastCallName);
            }
            g.addEdge(null,key,lastCallName);
        });

    });







    //console.log(g.nodes());
    return g;
}





module.exports = codegraph;
