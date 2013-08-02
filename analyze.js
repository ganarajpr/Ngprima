var fs = require('fs'),
    esprima = require('esprima');
var VerEx = require("verbal-expressions");




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

        if (code[j].value === template[i].value) {
            i++;
        }
        else if (regex.test(template[i].value)) {
            var templateVariable = template[i].value;
            templateVariable = VerEx().find("$$_").replace(templateVariable, "");
            templateVariable = VerEx().find("_$$").replace(templateVariable, "");
            tvList.push({name: templateVariable, value: code[j].value});
            i++;
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
    }
}

if (process.argv.length < 4) {
    console.log('Usage: analyze.js file.js templatefile.js');
    process.exit(1);
}

var filename = process.argv[2];
console.log('Reading ' + filename);
var code = fs.readFileSync(filename);


var filename1 = process.argv[3];
console.log('Reading ' + filename1);
var tpl = fs.readFileSync(filename1);


analyzeCode(code, tpl);
console.log('Done');
