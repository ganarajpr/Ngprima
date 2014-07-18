/**
 * Created with IntelliJ IDEA.
 * User: Ganaraj
 * Date: 18/07/14
 * Time: 20:35
 * To change this template use File | Settings | File Templates.
 */
//# spec/cquery-spec.js
var selector = require("../codequery/selector");


var code = "var selector = require(\"../codequery/selector\");"


describe("Code Query", function () {
    var sel;
    beforeEach(function(){
        "use strict";
        var code = "var selector = require(\"../codequery/selector\");"
        sel = selector.process(code);
    });
    it("should have a non empty variable", function () {
        expect(sel.context.variables).not.toBe(0);
    });

    it("should have a variable called selector", function () {
        expect(sel.context.variables[0].name).toBe("selector");
    });
});
