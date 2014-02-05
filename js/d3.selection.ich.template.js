define(['ich', 'd3'], function (ich, d3) {
  d3.selection.prototype.ich = d3.selection.enter.prototype.ich = function(id, paramObj) {
    this.html(function (data) {

      var context = {},
          d;
      for (d in paramObj) {
        if (paramObj.hasOwnProperty(d)) {
          context[d] = paramObj[d];
          if (context[d] instanceof Array) {
            context[d][context[d].length - 1].last = true;
          }
        }
      }
      for (d in data) {
        if (data.hasOwnProperty(d)) {
          context[d] = data[d];
        }
      }

      return ich[id](context, true); // the second argument makes it return plain html
    });
  };
});
