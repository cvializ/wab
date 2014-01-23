require.config({
  paths: {
    d3: 'vendor/nvd3/lib/d3.v2',
    nv : 'vendor/nvd3/nv.d3',
    text: 'vendor/require/text',
    json: 'vendor/require/json'
  },
  shim: {
    d3: { exports: 'd3' },
    nv: {
      exports: 'nv',
      deps: ['d3']
    }
  }
});

require(['d3', 'nv', 'aircraft/Aircraft', 'json!aircraft/warrior.json'], function (d3, nv, Aircraft, warrior) {
  var chart;

  var N44749 = new Aircraft(warrior);

  function setNewValue() {
    var newSection = N44749.sections[this.name];
    if (newSection.weight !== undefined) {
      newSection.weight = +this.value;
    } else {
      newSection.volume = +this.value;
    }
    redraw();
  }

  function redraw() {
    nv.addGraph(function() {
      chart = nv.models.lineChart();

      chart.tooltipContent(function(key, x, y, e, graph) {
        x = (+x).toFixed(2);
        y = (+y).toFixed(2);
        if (e.point.label !== undefined) {
          return '<h2>' + e.point.label + '</h2>' +
                  'Weight ' + y + 'lbs at Arm ' + x + 'in';

        } else {
          return '<h3>' + key + '</h3>' +
                 '<p>' + y + ' at ' + x + '</p>';
        }
      });

      var xExtent = d3.extent(N44749.categories.normal, function (d) {
        return d.x;
      }),
          yExtent = d3.extent(N44749.categories.normal, function (d) {
        return d.y;
      });

      chart.xAxis
          .axisLabel('Arm (in)')
          .tickValues(d3.range(xExtent[0], xExtent[1]))
          .tickFormat(d3.format(',r'));

      chart.yAxis
          .axisLabel('Weight (lbs)')
          .tickValues(d3.range(yExtent[0], yExtent[1], 200))
          .tickFormat(d3.format('.02f'));

      d3.select('#chart svg')
          .datum(data())
        .transition().duration(500)
          .call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
    });
  }

  d3.select('title').text(N44749.name + ': Weight and Balance');
  d3.select('#aircraft').text(N44749.name + ' ' + N44749.code);
  // create the form
  var wabform = d3.select('#wabform').append('table');
  var header = wabform.append('tr');
  header.append('th').text('Section');
  header.append('th').text('Weight or Volume');
  header.append('th').text('Arm');
  var sections = N44749.sections;
  var section;
  for (var key in sections) {
    if (sections.hasOwnProperty(key)) {
      section = sections[key];
      var row = wabform.append('tr');
      row.append('td')
        .text(section.name);
      row.append('td')
        .append('input')
          .attr('type', 'text')
          .attr('name', key)
          .attr('value', section.weight || section.volume)
          .on('blur', setNewValue);
      row.append('td')
        .text(section.arm);
    }
  }

  function data() {
    return [
      {
        values: N44749.categories.normal,
        key: 'Normal Category',
        color: '#ff7f0e'
      },
      {
        values: N44749.categories.utility,
        key: 'Utility Category',
        color: '#2ca02c'
      },
      {
        values: N44749.WeightAndBalance(),
        key: 'Weight and Balance',
        color: 'red'
      }
    ];
  }

  redraw();
});