// set margins and width/height of parent chart
var margin = {top: 20, right: 15, bottom: 60, left: 60}
	, width = 960 - margin.left - margin.right
	, height = 500 - margin.top - margin.bottom;

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

// setting our main chart containers width.height
d3.select("#main")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom);

// asynchronously loads csv file, 
// passes in the type() function which transforms a column of our data to an integer
d3.csv("a1-burtin.csv", type, function(error, dataset) {

	var barWidth = (width - 50) / dataset.length;

	// this maps each of our bacteria names to each of our columns
	x.domain(dataset.map(function(d) { return nameShorten(d.Bacteria); }));

	// maps our minimum y value for penicilin and max values to our bar heights
	y.domain([
		d3.min(dataset, function(d) { return d.Penicilin }) / 10, // Since we're using a log scale 
		d3.max(dataset, function(d) { return d.Penicilin })
	]);

	// colors each bar depending on the ordinal value of staining (positive/negative)
	staining.domain(dataset.map(function(d){return d['Gram Staining']}));

	// Appending the x-axis to the chart
	d3.select('#main')
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', "translate(0," + (height + margin.top) + ")")
		.call(xAxis);

	// Appending the y-axis to the chart
	d3.select('#main')
		.append('g')
		.attr('class', 'y axis')
		.attr('transform', "translate("  + (margin.left) + "," + margin.top + ")")
		.call(yAxis);

	var bar = d3.select('#main').selectAll('.bar') //select all bars
		.data(dataset) //append the data
	.enter().append('rect') // for each bar, add a rectangle svg with class "bar"
		.attr('class', 'bar')
		.attr('y', function(d) {return y(d.Penicilin);})
		.attr('x', function(d) {return x(nameShorten(d.Bacteria));}) // maps our data to each bin
		.attr('height', function(d){ 
			return height - y(d.Penicilin); // d3 calculates the height from the *top* of the chart
		}) 																// therefore we need to take the height - bar height to flip the chart
		.attr('width', x.rangeBand()) // since we defined an ordinal scale above, this automatically sets width to each column width
		.attr('transform', 'translate(0 ,'+ margin.top +')')
		.attr('fill', function(d) {return staining(d['Gram Staining'])}); // changes the color based on gram staining
});

function type(d) {
  d.Penicilin = +d.Penicilin; // coerce to number
  return d;
}

// function to shorten bacteria names
function nameShorten(bacteria) {
	var str = bacteria.split(" "); 
	return str[0].substring(0,1).toUpperCase() + ". " + str[1];
}