var requirejs = require('requirejs'),
    path = require('path'),
    testCase = require('nodeunit').testCase;

requirejs.config({
	baseUrl: path.join(__dirname, '../js'),
	paths: {
		text: 'vendor/require/text',
		json: 'vendor/require/json'
	},
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

var C172 = requirejs('json!aircraft/C172M.json'),
    Aircraft = requirejs('aircraft/Aircraft');

exports.group = testCase({

    setUp: function (cb) {
        this.data = requirejs('json!aircraft/C172M.json');
        this.aircraft = new Aircraft(this.data);
        cb();
    },

    testDataIntegrity: function (test) {
        test.expect(3);
        var defaultFuel = this.aircraft.getSection.call(this.data, 'fuel').quantity;
        test.strictEqual(this.aircraft.getSection('fuel').quantity, defaultFuel, "The aircraft should have the default amount of fuel.");

        this.aircraft.getSection('fuel').quantity = 20;
        test.strictEqual(this.aircraft.getSection('fuel').quantity, 20, "There should be 20 gallons of fuel.");

        test.strictEqual(this.aircraft.getSection.call(this.data, 'fuel').quantity, defaultFuel, "The data's amount of fuel should not change.");
        test.done();
    },

    testResultsAgreeWithPOH: function (test) {
        this.aircraft.getSection('oil').quantity = 8;
        this.aircraft.getSection('fuel').quantity = 38;
        this.aircraft.getSection('front').quantity = 340;
        this.aircraft.getSection('aft').quantity = 340;
        this.aircraft.getSection('baggage').quantity = 11;

        var wab = this.aircraft.WeightAndBalance();

        var expectedCG = (102.9 * 1000 / 2300); // The POH gives the CG result in moment, so convert it to arm.

        var percentError = Math.abs((expectedCG - wab.loading.cg) / expectedCG);

        test.ok(wab.success);
        test.strictEqual(wab.loading.weight, 2300, 'The weight should equal the weight calculated in the POH example problem.');
        test.ok(percentError < 0.001, 'The CG should not be significantly different from the CG calculated in the POH example problem.');

        test.done();
    },

    testOverMaxGrossWeight: function (test) {
        test.ok(true, "this assertion should pass");

        test.done();
    },

    testUnderMinimumGrossWeight: function (test) {
        test.ok(true, "this assertion should pass");
        test.done();
    },

    testCGTooFarAft: function (test) {
        test.ok(true, "this assertion should pass");
        test.done();
    },

    testCGTooFarForeward: function (test) {
        test.ok(true, "this assertion should pass");
        test.done();
    }
});