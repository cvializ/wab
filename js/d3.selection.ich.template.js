define(['ich', 'd3'], function (ich, d3) {
  d3.selection.prototype.ich = d3.selection.enter.prototype.ich = function(id,d) {
    var thisSelection = (d) ? this.datum(d) : this;
    
    thisSelection.html(function (d) {
      return ich[id](d, true); // the second argument makes it return plain html
    });
  };
});
