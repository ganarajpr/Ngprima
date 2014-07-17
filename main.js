var fs = require('fs');
//var cquery = require("./codequery/cquery");
var selector = require("./codequery/selector");


var code = fs.readFileSync("./codequery/cquery.js");

//var code = fs.readFileSync("test.js");
//var code = fs.readFileSync("jquery.js");


function testCode(fileName,code) {
    //var cq = new cquery(code);
    var sel = selector.process(code);
    sel.context.print();
    writeToFile(fileName,sel.context.ast);
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

testCode("cquery.json",code);
