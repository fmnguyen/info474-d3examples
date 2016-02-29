/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {
  // constants to define the size
  // and margins of the vis area.

  var margin = {top: 15, right: 20, bottom: 50, left: 20}
	var width = 700;
	var height = 520;

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  var squareSize = 6;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

	// set margins and width/height of parent chart
	// Makes a log scale of our data (as we know is slightly skewed)
	// Maps our data values -> bar height
	var y = d3.scale.log()
				.range([height, margin.top + margin.bottom]);

	// Allows us to map each ordinal value to a particular column
	// Maps our ordinal bacteria names -> column
	var x = d3.scale.ordinal()
				.rangeBands([margin.left, width], 0.225);

	// Quantifies colors for different types of gram staining
	var staining = d3.scale.category10();

	// Initializes our x-axis and adds it to the bottom of the chart
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	// Initializes our y-axis and adds it to the left of the chart
	// Adds tick marks for our values in increments of 10x
	var yAxis = d3.svg.axis()
		.scale(y)
		.ticks(10, " ")
		.orient('left');

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(rawData) {

      // create svg and give it a width and height
      svg = d3.select(this).selectAll("svg").data(rawData);
      svg.enter().append("svg").append("g");

      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);


      // this group element will be used to contain all
      // other elements.
      g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var barWidth = (width - 50) / rawData.length;

      // this maps each of our bacteria names to each of our columns
      x.domain(rawData.map(function(d) { return nameShorten(d.Bacteria); }));

      // maps our minimum y value for penicilin and max values to our bar heights
      y.domain([
        d3.min(rawData, function(d) { return d.Penicilin }) / 10, // Since we're using a log scale 
        d3.max(rawData, function(d) { return d.Penicilin })
      ]);

      // colors each bar depending on the ordinal value of staining (positive/negative)
      staining.domain(rawData.map(function(d){return d['Gram Staining']}));

      setupVis(rawData);

      setupSections();

    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  setupVis = function(bacteria) {

  	d3.select('g')
  		.append('text')
  		.attr('class', 'bacteria-title')
  		.attr('x', width / 10)
  		.attr('y', height / 2)
  		.text('Introduction to Scrollytelling') 
  		.attr('opacity', 1)

		// Appending the x-axis to the chart
		d3.select('g')
			.append('g')
			.attr('class', 'x axis')
			.attr('transform', "translate(0," + (height + margin.top) + ")")
			.attr('opacity', 0)
			.call(xAxis)

		// Appending the y-axis to the chart
		d3.select('g')
			.append('g')
			.attr('class', 'y axis')
			.attr('transform', "translate("  + (margin.left) + "," + margin.top + ")")
			.attr('opacity', 0)
			.call(yAxis)

		var bar = d3.select('g').selectAll('.bar') //select all bars
			.data(bacteria) //append the data
		.enter().append('rect') // for each bar, add a rectangle svg with class "bar"
			.attr('class', 'bar')
			.attr('opacity', 0)
			.attr('y', function(d) {return y(d.Penicilin);})
			.attr('x', function(d) {return x(nameShorten(d.Bacteria));}) // maps our data to each bin
			.attr('height', function(d) { 
				return height - y(d.Penicilin); // d3 calculates the height from the *top* of the chart
			}) 																// therefore we need to take the height - bar height to flip the chart
			.attr('width', x.rangeBand()) // since we defined an ordinal scale above, this automatically sets width to each column width
			.attr('transform', 'translate(0 ,'+ margin.top +')')
			.attr('fill', function(d) {return staining(d['Gram Staining'])}) // changes the color based on gram staining

	  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  setupSections = function() {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showTitle;
		activateFunctions[1] = showPenicilin;
    //activateFunctions[2] = showStreptomycin;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 2; i++) {
      updateFunctions[i] = function() {};
    }
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */
  
  function showTitle() {
    g.selectAll(".bacteria-title")
      .transition()
      .duration(600)
      .attr("opacity", 1);
  }

  function showPenicilin() {
    g.selectAll(".bacteria-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll('.axis')
      .transition()
      .duration(600)
      .attr("opacity", 1.0);

    g.selectAll(".bar")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }



  function showPenicilin() {
    g.selectAll(".bacteria-title")
      .transition()
      .duration(0)
      .attr("opacity", 1);

    g.selectAll('axis')
      .transition()
      .duration(600)
      .attr("opacity", 1.0);

    g.selectAll(".bar")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }

  function showFillerTitle() {

  }

  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */

  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function(i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};

/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  // create a new plot and
  // display it
  console.log(data);
  var plot = scrollVis();
  d3.select("#vis")
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function(index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function(index, progress){
    plot.update(index, progress);
  });
}

// load data and display
d3.csv("a1-burtin.csv", display);

// asynchronously loads csv file, 
// passes in the type() function which transforms a column of our data to an integer
d3.csv("a1-burtin.csv", type, function(error, dataset) {

});

function type(d) {
  d.Penicilin = +d.Penicilin; // coerces the string to number
  return d;
}

// function to shorten bacteria names
function nameShorten(bacteria) {
	var str = bacteria.split(" "); 
	return str[0].substring(0,1).toUpperCase() + ". " + str[1];
}