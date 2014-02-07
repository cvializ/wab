define([], function () {
  // Use this method so we don't overwrite any
  // json data we loaded.
  function cloneProps(props) {
    var newObj = (props instanceof Array) ? [] : {},
        i;
    for (i in props) {
      if (props[i] && typeof props[i] === 'object') {
        newObj[i] = cloneProps(props[i]);
      } else {
        newObj[i] = props[i];
      }
    }
    return newObj;
  }

  var Aircraft = function (props) {
    props = cloneProps(props);

    for (var prop in props) {
      if (props.hasOwnProperty(prop)) {
        this[prop] = props[prop];
      }
    }

    this.constants = {
      weight: {
        oil: 1.875, // lbs/quart
        fuel: 6 // lbs/gal
      }
    };
  };

  function getLimit(comparator, values, map) {
    if (map !== 'undefined') {
      values = values.map(map);
    }
    return comparator.apply(null, values);
  }

  Aircraft.prototype.getSection = function (section) {
    if (this.sections) {
      return this.sections.filter(function (d) { return d.name === section; }).pop();
    }
  };

  Aircraft.prototype.MaxGrossWeight = function () {
    return getLimit(Math.max, this.categories.normal, function (d) { return d.y; });
  };

  Aircraft.prototype.MinGrossWeight = function () {
    return getLimit(Math.min, this.categories.normal, function (d) { return d.y; });
  };

  Aircraft.prototype.AftCGLimit = function () {
    return getLimit(Math.max, this.categories.normal, function (d) { return d.x; });
  };

  Aircraft.prototype.ForwardCGLimit = function () {
    return getLimit(Math.min, this.categories.normal, function (d) { return d.x; });
  };

  Aircraft.prototype.WeightAndBalance = function () {
    var points = [],
        section,
        iWeight,
        iArm,
        weight_so_far = 0,
        moment_so_far = 0;
    for (var i in this.sections) {
      section = this.sections[i];

      if (section.name === 'fuel' || section.name === 'oil') {
        iWeight = section.quantity * this.constants.weight[section.name];
      } else {
        iWeight = section.quantity;
      }

      if (section.quantity === 0) continue;

      if (typeof section.arm === 'number') {
        iArm = section.arm;
      } else if (section.arm !== null) {
        iArm = section.arm.value;
      } else {
        iArm = 0; // TODO: Useful value?
      }

      weight_so_far += iWeight;
      moment_so_far += iWeight * iArm;

      points.push({
        x: moment_so_far / weight_so_far,
        y: weight_so_far,
        label: section.title
      });
    }

    var loading = points[points.length-1];
        loading = { weight: loading.y, cg: loading.x };

    var success = loading.weight <= this.MaxGrossWeight() &&
                  loading.weight >= this.MinGrossWeight() &&
                  loading.cg >= this.ForwardCGLimit() &&
                  loading.cg <= this.AftCGLimit();

    return {
      success: success,
      points: points,
      loading: loading
    };
  };

  return Aircraft;
});
