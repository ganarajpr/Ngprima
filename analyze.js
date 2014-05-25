var fs = require('fs'),
    esprima = require('esprima');
var VerEx = require("verbal-expressions");
//var cq = require('./codequery/codequery');
var CQ = require('./codequery/cq');
var escodegen = require('escodegen');




function analyzeCode(code, tpl) {
    var options = {
        tokens: true
    };
    var tokens = esprima.parse(code, options).tokens;
    console.log(JSON.stringify(tokens));
    var templateTokens = esprima.parse(tpl, options).tokens;
    console.log(JSON.stringify(templateTokens));
    matchTemplate(tokens, templateTokens);
}

function matchTemplate(code, template) {
    var regex = VerEx().then("$$_")
        .anything()
        .then("_$$");

    var i = 0;
    var patternFound = false;
    var varList = []
    var tvList = [];
    for (var j = 0; j < code.length; j++) {
        if (i === template.length) {
            patternFound = true;
            varList = tvList;
            break;
        }
        //if they match go ahead
        if (code[j].value === template[i].value) {
            i++;
        }
        //else test for a variable
        else if (regex.test(template[i].value)) {
            //start copying the value for variable
            var interest = code[j].value;
            var templateVariable = template[i].value;

            templateVariable = VerEx().find("$$_").replace(templateVariable, "");
            templateVariable = VerEx().find("_$$").replace(templateVariable, "");

            i++;
            j++;
            while ( code[j].value !== template[i].value && j < code.length){
                //until we dont match the next template token
                //if its a variable
                //keep adding the value to the variable
                interest += code[j].value;
                j++;
            }
            i++;
            tvList.push({name: templateVariable, value: interest});
        }
        else{
            tvList = [];
        }
    }

    if (patternFound) {
        console.log("Pattern was found");
        for (var j = 0; j < varList.length; j++) {
            console.log(varList[j].name + " : " + varList[j].value)

        }
        return varList
    }
    return;
}

/*if (process.argv.length < 4) {
    console.log('Usage: analyze.js file.js templatefile.js');
    process.exit(1);
}*/

//var filename = process.argv[2];
//console.log('Reading ' + filename);
var code = fs.readFileSync("test.js");


//var filename1 = process.argv[3];
//console.log('Reading ' + filename1);
//var tpl = fs.readFileSync(filename1);


//analyzeCode(code, tpl);
function testCode(code) {
    var cq = new CQ(code);
    var calls = cq
        .callsToFunction("controller")
        //.caller('angular.module("layout")');
        .caller('$scope');
        //.callsToFunction("log")
        //.caller('tre.abc.log()');
        //.callsToFunction("log")
        //.caller(null);

    var logger = calls.toString();
    console.log(logger);
}

testCode(code);
console.log('Done');

