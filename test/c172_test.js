var requirejs = require('requirejs'),
    path = require('path'),
    testCase = require('nodeunit').testCase;

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

var C172 = requirejs('json!js/aircraft/C172M.json'),
    Aircraft = requirejs('js/aircraft/Aircraft');

function getSection(aircraft, section) {
    return aircraft.sections.filter(function (d) { return d.name === section; });
}

exports.group = testCase({

    setUp: function (cb) {
        this.data = requirejs('json!js/aircraft/C172M.json')
        this.aircraft = new Aircraft(this.data);
        cb();
    },

    testOverMaxGrossWeight: function(test){
        var defaultFuel = getSection(this.data, 'fuel').quantity;
        test.expect(getSection(this.aircraft, 'fuel').quantity, defaultFuel, "The aircraft should have the default amount of fuel.");

        getSection(this.aircraft, 'fuel').quantity = 20;
        test.expect(getSection(this.aircraft, 'fuel').quantity, 20, "There should be 20 gallons of fuel.");

        test.expect(getSection(this.data, 'fuel').quantity, 20, "The data's amount of fuel should not change.");
        test.ok(true, "Pass");
        test.done();
    },

    testUnderMinimumGrossWeight: function(test){
        test.ok(false, "this assertion should fail");
        test.done();
    },

    testCGTooFarAft: function(test){
        test.ok(false, "this assertion should fail");
        test.done();
    },

    testCGTooFarForeward: function(test){
        test.ok(false, "this assertion should fail");
        test.done();
    }
});