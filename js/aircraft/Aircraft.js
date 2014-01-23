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

  return Aircraft;
});