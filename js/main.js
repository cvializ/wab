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

require(['d3', 'nv', 'aircraft/Aircraft', 'json!aircraft/list.json'],
function (d3, nv, Aircraft, list) {
  function pluginify(d) {
    return 'json!aircraft/' + d + '.json';
  }
  list = list.map(pluginify);

  //=========================================================
  require(list, function () {
    var aircraftList = Array.prototype.slice.call(arguments);

    function init() {
      var picker = d3.select('#aircraftPicker');
      picker.selectAll('.opt')
        .data(aircraftList)
        .enter()
          .append('option')
          .classed('opt', true)
          .attr('value', function (aircraft) { return aircraftList.indexOf(aircraft); })
          .text(function (aircraft) {
            return aircraft.code;
          });
      picker.on('change', function () {
        update(aircraftList[this.value]);
      });

      var inputTable = d3.select('#wabform').append('table');
      inputTable.append('thead')
        .append('tr').selectAll('th')
          .data(['Section', 'Weight or Volume', 'Arm'])
          .enter()
          .append('th')
            .text(function (d) { return d; });
      inputTable.append('tbody');
    }

    function update(aircraft) {
      aircraft = new Aircraft(aircraft);

      // Set the titles
      d3.select('title').text(aircraft.name + ': Weight and Balance');
      d3.select('#aircraft').text(aircraft.name + ' ' + aircraft.code);

      var inputTable = d3.select('#wabform tbody');

      // Select the table and apply the data.
      var rowData = inputTable.selectAll('.sectionRow').data(aircraft.sections);

      // Create the new elements for the enter selection
      var newRow = rowData.enter()
        .append('tr')
        .classed('sectionRow', true);
      newRow.append('td').classed('title', true);
      newRow.append('td').classed('weightvolume', true)
        .append('input')
        .attr('type', 'text');
      newRow.append('td').classed('arm', true);

      // Update the values for new and existing elements
      rowData.select('td.title')
        .text(function (section) { return section.title; });
      rowData.select('td.weightvolume')
        .select('input') // TODO: I think this will work
          .attr('name', function (section) {
            return section.name;
          })
          .attr('value', function (section) {
            return section.weight || section.volume;
          })
          .on('change', function (section) {
            // i hope this is a reference to the actual object
            var newSection = aircraft.sections.filter(function (d) {
              return d.name == section.name;
            }).pop();

            if (newSection.weight !== undefined) {
              newSection.weight = +this.value;
            } else {
              newSection.volume = +this.value;
            }
            redrawChart(aircraft);
          });
      rowData.select('td.arm')
        .text(function (section) {
          return section.arm;
        });

      // Remove the old elements
      rowData.exit().remove();

      redrawChart(aircraft);
    }

    function redrawChart(aircraft) {
      nv.addGraph(function() {
        var chart = nv.models.lineChart();

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

        var xExtent = d3.extent(aircraft.categories.normal, function (d) {
          return d.x;
        }),
            yExtent = d3.extent(aircraft.categories.normal, function (d) {
          return d.y;
        });

        chart.xAxis
            .axisLabel('Arm (in)')
            .tickValues(d3.range(xExtent[0], xExtent[1]))
            .tickFormat(d3.format(',r'));

        chart.yAxis
            .axisLabel('Weight (lbs)')
            //.tickValues(d3.range(yExtent[0], yExtent[1], 200))
            .tickFormat(d3.format('.02f'));

        d3.select('#chart svg')
            .datum(data(aircraft))
          .transition().duration(500)
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      });
    }

    var N44749 = new Aircraft(aircraftList[0]);
    init();
    update(N44749);
/*
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
*/
    function data(aircraft) {
      return [
        {
          values: aircraft.categories.normal,
          key: 'Normal Category',
          color: '#ff7f0e'
        },
        {
          values: aircraft.categories.utility,
          key: 'Utility Category',
          color: '#2ca02c'
        },
        {
          values: aircraft.WeightAndBalance(),
          key: 'Weight and Balance',
          color: 'red'
        }
      ];
    }
  });
});