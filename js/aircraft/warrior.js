define([], function () {
  var Aircraft = function (props) {
    for (var prop in props) {
      if (props.hasOwnProperty(prop)) {
        this[prop] = props[prop];
      }
    }

    this.constants = {
      weight: {
        oil: 1.75, // lbs/quart
        fuel: 6 // lbs/gal
      }
    };
  };

  Aircraft.prototype.MaxGrossWeight = function () {
    var mgw = 0;
    this.categories.normal.forEach(function (d, i) {
      if (d.y > mgw) {
        mgw = d.y;
      }
    });

    return mgw;
  };

  Aircraft.prototype.WeightAndBalance = function () {
    var points = [],
        section,
        iWeight,
        weight_so_far = 0;
        moment_so_far = 0;
    for (var key in this.sections) {
      if (this.sections.hasOwnProperty(key)) {
        section = this.sections[key];

        if (key === 'fuel' || key === 'oil') {
          iWeight = section.volume * this.constants.weight[key];
        } else {
          iWeight = section.weight;
        }

        if (section.weight === 0) continue;

        weight_so_far += iWeight;
        moment_so_far += iWeight * section.arm;

        points.push({
          x: moment_so_far / weight_so_far,
          y: weight_so_far,
          label: section.name
        });
      }
    }

    return points;
  };

  return Aircraft.bind(undefined, {
    name: "Piper Cherokee Warrior",
    code: "PA28-151",
    categories: {
      normal: [
        {x: 83, y: 1200},
        {x: 83, y: 1950},
        {x: 87, y: 2325},
        {x: 93, y: 2325},
        {x: 93, y: 1200}
      ],
      utility: [
        {x: 83, y: 1200},
        {x: 83, y: 1950},
        {x: 86.5, y: 1950},
        {x: 86.5, y: 1200}
      ],
      acrobatic: null
    },
    sections: {
      empty: {
        name: 'Licensed Empty Weight',
        weight: 1438.11,
        arm: 87.545459,
        moment: 1259000,
        max: 2325
      },
      oil: {
        name: 'Oil',
        volume: 7,
        arm: 27.5,
        moment: null,
        max: 8
      },
      fuel: {
        name: 'Fuel',
        volume: 30,
        arm: 95,
        moment: null,
        max: 48 // gallons
      },
      front: {
        name: 'Front Passengers',
        weight: 260,
        arm: 80.5,
        moment: null,
        max: null
      },
      aft: {
        name: 'Aft Passengers',
        weight: 300,
        arm: 118.1,
        moment: null,
        max: null
      },
      baggage: {
        name: 'Baggage Compartment',
        weight: 0,
        arm: 142.8,
        moment: null,
        max: null
      }
    }
  });
});