(function(exports) {
/**
 * Renders a graph for a given test in browserscope
 *
 */

/**
 * @param {string} id The browserscope ID of the test
 */
function Chart(testId) {
  this.testId = testId;
  this.chart = null;
}

Chart.URL_FORMAT = 'http://www.browserscope.org/user/tests/table/{ID}?o=json&v=top&callback=?';
Chart.MODERN = /Firefox [4-9]|Chrome 1[0-9]|IE 9|IE 10|Safari [5-9]/;
Chart.MOBILE = /iPhone|iPad|Android|Chrome Mobile/

/**
 * Renders a graph for the corresponding test
 * @param {string} id ID of the element to render the graph in
 */
Chart.prototype.render = function(id) {
  var url = Chart.URL_FORMAT.replace('{ID}', this.testId);
  var that = this;
  $.getJSON(url, function(data) {
    var chartInfo = parseChart_(data);
    that.chart = renderChart_(chartInfo, id, 'column');
  });
};

/**
 * Shows only series that match the regex
 * @param {object} regex Regular expression that slices in twain
 */
Chart.prototype.filter = function(regex) {
  for (var i = 0; i < this.chart.series.length; i++) {
    var s = this.chart.series[i];
    if (s.name.match(regex)) {
      s.show();
    } else {
      s.hide();
    }
  }
}

function parseChart_(response) {
  var didComputeTestNames = false;
  var testNames = [];
  var platforms = [];
  var series = [];
  for (var platform in response.results) {
    platforms.push(platform);
    var data = [];
    var platformResults = response.results[platform].results;
    for (var testName in platformResults) {
      // If we haven't computed all testNames yet, compute them
      if (!didComputeTestNames) {
        testNames.push(testName);
      }
      // Compute series data
      var result = parseInt(platformResults[testName].result, 10);
      if (result && !isNaN(result)) {
        data.push(result);
      }
    }
    didComputeTestNames = true;
    // Add platform to the series only if there's data
    if (data.length) {
      series.push({
        name: platform,
        data: data
      });
    }
  }
  return {
    title: {
      text: response.category_name
    },
    xAxis: {
      categories: testNames
    },
    series: series
  }
}

function renderChart_(chartInfo, id, type) {
  chartInfo.chart = {
    renderTo: id,
    type: type
  };
  chartInfo.yAxis = {
    title: {
      text: "Iterations/s"
    }
  };
  var chart = new Highcharts.Chart(chartInfo);
  return chart;
}

exports.Chart = Chart;
})(window);
