var fs = require('fs');
//var cquery = require("./codequery/cquery");
var selector = require("./codequery/selector");
var stubber = require("./codequery/stubber");
var create = require("./codequery/create");

var Refactor = require("./Refactor");
var escodegen = require("escodegen");
var _ = require('lodash');

var codegraph = require('./codegraph');

var code = fs.readFileSync("./codequery/stubber.js");

//var code = fs.readFileSync("test.js");
//var code = fs.readFileSync("jquery.js");


function testCode(fileName,code) {
    //var cq = new cquery(code);
    var sel = selector.process(code);
    var ctx = sel.getFunctionByName('convertExpression');
    //var funcMap = sel.getFunctionContextMap();
    /*var g = codegraph.createGraph(code);
    console.log(g.edges());*/
    //ctx.processExternals();
    //console.log(ctx.externals);

    //var st = stubber.stub(ctx);
    //writeToFile('generated.js',st);
    var prg = new create.Program();

    Refactor(ctx,prg);


    /*var vnames;
    vnames = ctx.variables.map(function(v){
        return v.name;
    });*/


    /*var prg = new create.Program();
    prg.addVariable('x');
    prg.addVariable('y');

    var idX = new create.Identifier('x');
    var lit12 = new create.Literal('12');
    var funcx = new create.FunctionExpression('b');
    var funcaddNode = new create.FunctionExpression('addNode');

    funcaddNode.addVariableArgument('y');
    funcaddNode.addVariable('n');
    var obj = new create.ArrayExpression();
    obj.addItem(new create.Identifier('a'));
    //obj.addProperty(new create.Identifier('a'),new create.ObjectExpression());
    funcaddNode.addReturn(obj);

    prg.addAssignment(idX,funcaddNode);



    console.log(escodegen.generate(prg));*/



    //console.log(vnames);
    //console.log(escodegen.generate(ctx.ast));
    //writeToFile(fileName,sel.context.ast);
}


function writeToFile(outputFilename,data){
    
    fs.writeFile(outputFilename, data, function writeFileCallBack(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("JSON saved to " + outputFilename);
        }
        
    }); 
    
}

testCode("test.json",code);


//if multiple pieces in parts
//is there already an existing assignment
//if not
// then create a new function expression
// add a new assignment with the identifier and the new function
// call add to new function the rest
//if there is an already existing assignment
// if the assignment is a function expression
// then add to this function the rest

// if its only one function
//create function
// return whatever is assigned
// add an assignment with identifier and this new function.
