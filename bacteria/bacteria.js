var width = 500,
	height = 500;

var y = d3.scale.linear()
			.range([height, 0]);

d3.select("#main")
	.attr("width", width)
	.attr("height", height);

d3.csv("a1-burtin.csv", type, function(error, dataset) {
	var barWidth = width / dataset.length;

	y.domain([0, d3.max(dataset, function(d) { return d.Penicilin })]);

	var bar = d3.select('#main').selectAll('g')
		.data(dataset)
		.attr('width', barWidth)
	.enter().append('g')
	.attr("transform", function(d, i) { 
		return "translate(" + i * barWidth + ", 0)"; 
	}); 

	bar.append('rect')
		.attr('y', function(d) {return y(d.Penicilin)})
		.attr('height', function(d){ 
			return height - y(d.Penicilin)
		})
		.attr('width', barWidth - 2)
});

function type(d) {
  d.Penicilin = +d.Penicilin; // coerce to number
  return d;
}