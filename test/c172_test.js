var requirejs = require('requirejs');
var path = require('path');
requirejs.config({
	baseUrl: path.join(__dirname, '../'),
	paths: {
		text: 'js/vendor/require/text',
		json: 'js/vendor/require/json'
	},
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

var C172 = requirejs('json!js/aircraft/C172M.json');
var Aircraft = requirejs('js/aircraft/Aircraft');

var myC172 = new Aircraft(C172);

exports.testOverMaxGrossWeight = function(test){
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

exports.testUnderMinimumGrossWeight = function(test){
    test.ok(false, "this assertion should fail");
    test.done();
};

exports.testCGTooFarAft = function(test){
    test.ok(false, "this assertion should fail");
    test.done();
};

exports.testCGTooFarForeward = function(test){
    test.ok(false, "this assertion should fail");
    test.done();
};