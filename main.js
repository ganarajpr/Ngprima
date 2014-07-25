var fs = require('fs');
//var cquery = require("./codequery/cquery");
var selector = require("./codequery/selector");
var stubber = require("./codequery/stubber");
var create = require("./codequery/create");
var escodegen = require("escodegen");

//var code = fs.readFileSync("./codequery/cquery.js");

var code = fs.readFileSync("test.js");
//var code = fs.readFileSync("jquery.js");


function testCode(fileName,code) {
    //var cq = new cquery(code);
    /*var sel = selector.process(code);
    var ctx = sel.getFunctionByName('OverlayController');
    ctx.processExternals();
    console.log(ctx.externals);
    console.log(stubber.stub(ctx.externals));*/

    /*var vnames;
    vnames = ctx.variables.map(function(v){
        return v.name;
    });*/


    var prg = new create.Program();
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



    console.log(escodegen.generate(prg));


    //console.log(vnames);
    //console.log(escodegen.generate(ctx.ast));
    //writeToFile(fileName,sel.context.ast);
}


function writeToFile(outputFilename,data){
    
    fs.writeFile(outputFilename, JSON.stringify(data, null, 4), function writeFileCallBack(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("JSON saved to " + outputFilename);
        }
        
    }); 
    
}

testCode("test.json",code);
