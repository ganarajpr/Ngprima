var fs = require('fs');
var cquery = require("./codequery/cquery");


//var code = fs.readFileSync("./codequery/cquery.js");

var code = fs.readFileSync("test.js");
//var code = fs.readFileSync("jquery.js");


function testCode(fileName,code) {
    var cq = new cquery(code);
    //writeToFile(fileName,cq.ast);
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