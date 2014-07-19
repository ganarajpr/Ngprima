var fs = require('fs');
//var cquery = require("./codequery/cquery");
var selector = require("./codequery/selector");
var escodegen = require('escodegen');


//var code = fs.readFileSync("./codequery/cquery.js");

var code = fs.readFileSync("test.js");
//var code = fs.readFileSync("jquery.js");


function testCode(fileName,code) {
    //var cq = new cquery(code);
    var sel = selector.process(code);
    sel.context.print();


    var ctx = sel.getContextByName("onAdd");
    console.log(escodegen.generate(ctx.ast));
    console.log(ctx.expressions);
    console.log(sel.getExternals("onAdd"));

    //sel.context.print();
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
