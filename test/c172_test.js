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
    var defaultFuel = this.aircraft.getSection.call(this.data, 'fuel').quantity;
    test.strictEqual(this.aircraft.getSection('fuel').quantity, defaultFuel, "The aircraft should have the default amount of fuel.");

    this.aircraft.getSection('fuel').quantity = 20;
    test.strictEqual(this.aircraft.getSection('fuel').quantity, 20, "There should be 20 gallons of fuel.");

    test.strictEqual(this.aircraft.getSection.call(this.data, 'fuel').quantity, defaultFuel, "The data's amount of fuel should not change.");
    test.done();
  },

  testResultsAgreeWithPOH: function (test) {
    this.aircraft.Load({
      oil: 8,
      fuel: 38,
      front: 340,
      aft: 340,
      baggage: 11
    });

    var wab = this.aircraft.WeightAndBalance();

    var expectedCG = (102.9 * 1000 / 2300); // The POH gives the CG result in moment, so convert it to arm.
    var percentError = Math.abs((expectedCG - wab.loading.cg) / expectedCG);

    test.ok(wab.success);
    test.strictEqual(wab.loading.weight, 2300, 'The weight should equal the weight calculated in the POH example problem.');
    test.ok(percentError < 0.001, 'The CG should not be significantly different from the CG calculated in the POH example problem.');

    test.done();
  },

  testOverMaxGrossWeight: function (test) {
    this.aircraft.Load({
      oil: 8,
      fuel: 38,
      front: this.aircraft.getSection('front').max,
      aft: this.aircraft.getSection('aft').max,
      baggage: this.aircraft.getSection('baggage').max
    });
    var wab = this.aircraft.WeightAndBalance();

    test.strictEqual(wab.success, false, "The over-loaded weight and balance should fail.");
    test.ok(wab.loading.weight > this.aircraft.MaxGrossWeight, "The over-loaded weight should be over the aircraft's Maximum GW.");
    test.done();
  },

  testUnderMinimumGrossWeight: function (test) {
    this.aircraft.Load({
      oil: 0,
      fuel: 0,
      front: 0,
      aft: 0,
      baggage: 0
    });
    var wab = this.aircraft.WeightAndBalance();

    test.strictEqual(wab.success, false, "The under-loaded weight and balance should fail.");
    test.ok(wab.loading.weight < this.aircraft.MinGrossWeight, "The under-loaded weight should be under the aircraft's Minimum GW.");
    
    test.done();
  },

  testCGTooFarAft: function (test) {
    this.aircraft.Load({
      fuel: 38,
      aft: this.aircraft.getSection('aft').max,
      baggage: this.aircraft.getSection('baggage').max
    });
    var wab = this.aircraft.WeightAndBalance();

    test.strictEqual(wab.success, false, "The excessively aft CG should fail.");
    test.ok(wab.loading.cg > this.aircraft.AftCGLimit, "The excessively aft CG should be aft of the Aft CG limit.");
    
    test.done();
  },

  testCGTooFarForward: function (test) {
    this.aircraft.getSection('empty').arm = this.aircraft.ForwardCGLimit
    this.aircraft.Load({
      oil: 'max',
      fuel: 0,
      front: 0,
      aft: 0,
      baggage: 0
    });
    var wab = this.aircraft.WeightAndBalance();
    
    test.strictEqual(wab.success, false, "The excessively forward CG should fail.");
    test.ok(wab.loading.cg < this.aircraft.ForwardCGLimit, "The excessively forward CG should be forward of the forward CG limit.");
    
    test.done();
  }
});