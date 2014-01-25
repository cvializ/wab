require.config({
  paths: {
    domReady: 'vendor/require/domReady',
    d3: 'vendor/nvd3/lib/d3.v2',
    d3ich: 'd3.selection.ich.template',
    ich: 'vendor/ich/ICanHaz.min',
    nv : 'vendor/nvd3/nv.d3',
    text: 'vendor/require/text',
    json: 'vendor/require/json',
    bootstrap: '//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min',
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min'
  },
  shim: {
    bootstrap: {
      deps: ['jquery'],
      exports: '$.fn.popover'
    },
    d3: {
      exports: 'd3'
    },
    ich: {
      exports: 'ich'
    },
    nv: {
      exports: 'nv',
      deps: ['d3']
    }
  },
  enforceDefine: true
});

define(['bootstrap', 'd3', 'nv', 'aircraft/Aircraft', 'json!aircraft/list.json', 'd3ich', 'domReady!'],
function (bootstrap, d3, nv, Aircraft, list) {
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
    }

    function update(aircraft) {
      aircraft = new Aircraft(aircraft);

      // Set the titles
      d3.select('title').text(aircraft.name + ': Weight and Balance');
      d3.select('#aircraft').text(aircraft.name + ' ' + aircraft.code);

      var inputTable = d3.select('#form');

      // Select the table and apply the data.
      var rowData = inputTable.selectAll('.wabSection').data(aircraft.sections);

      // Create the new elements for the enter selection
      var newRow = rowData.enter()
        .append('div') // TODO: Figure out how to not have to add this.
        .attr('class', 'row wabSection')
        .ich('rowTemplate');

      // Update the values for new and existing elements
      rowData.select('.wabtitle')
        .text(function (section) { return section.title; });
      // TODO: Prepend bootstrap addon
      rowData.select('.wabquantity').select('.input-group')
          .select('input') // TODO: I think this will work
            .attr('name', function (section) {
              return section.name;
            })
            .property('value', function (section) {
              return section.quantity === null ? "" : section.quantity;
            })
            .on('change', function (section) {
              // i hope this is a reference to the actual object
              var newSection = aircraft.sections.filter(function (d) {
                return d.name == section.name;
              }).pop();
              newSection.quantity = +this.value;

              d3.selectAll('.wabquantity .input-group')
                .classed('has-error', function (d) {
                  if (d.quantity > d.max) {
                    return true;
                  } else {
                    return false;
                  }
                });

              redrawChart(aircraft);
            });

      rowData.select('.wabarm')
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
            return '<h3>' + e.point.label + '</h3>' +
                    'Weight ' + y + 'lbs at Arm ' + x + 'in';

          }
        });

        var xExtent = d3.extent(aircraft.categories.normal, function (d) {
          return d.x;
        }),
            yExtent = d3.extent(aircraft.categories.normal, function (d) {
          return d.y;
        });

        chart.xAxis
            .axisLabel('Center of Gravity Arm (in)')
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

    function data(aircraft) {
      var wab = aircraft.WeightAndBalance(),
          color = wab[wab.length-1].y > aircraft.MaxGrossWeight() ? 'red' : 'black';
      return [
        {
          values: aircraft.categories.normal,
          key: 'Normal Category',
          color: 'darkblue'
        },
        {
          values: aircraft.categories.utility,
          key: 'Utility Category',
          color: 'lightblue'
        },
        {
          values: wab,
          key: 'Weight and Balance',
          color: color
        }
      ];
    }
  });
});
