 var width = 960,
    height = 500;

var projection = d3.geo.albersUsa()
    .scale(1200 * 5)
    .translate([width / 4, height + height * 0.25]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("/iowa.json", function(error, iowa) {
  if (error) throw error;
  
  // this is appending the entire state svg defined in iowa.json
  svg.append("path")
        .datum(topojson.feature(iowa, iowa.objects.subunits))
        .attr("d", path)
        .attr("class", "state");

  // goes through each country and draws each 
  svg.selectAll(".subunit")
    .data(topojson.feature(iowa, iowa.objects.subunits).features)
    .enter().append("path")
      .attr("class", function(d) { return "subunit county-boundary " + d.id; })
      .attr("d", path)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

});

function handleMouseOver(d, i) {
  d3.select(this).style({
    fill: "orange"
  });

  svg.append('text')
  .attr("y", 60)    // this will have to be a function 
  .attr("id", d.id) // returning your mouse coordinates to set the x/y
  .text(function() {
    return d.id; // make sure to parse spaces and replace them with '-' in your json
  })

/*
 * Add html tooltip and move it to be over where the mouse coordinates are
 *
.on("mouseover", function(d) {

//Get this bar's x/y values, then augment for the tooltip
var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.rangeBand() / 2;
var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

//Update the tooltip position and value
d3.select("#tooltip")
  .style("left", xPosition + "px")
  .style("top", yPosition + "px")
  .select("#value")
  .text(d);

//Show the tooltip
d3.select("#tooltip").classed("hidden", false);

})

*/

};

function handleMouseOut(d) {

  d3.select(this).style({ // use style instead of attr here to change style sheet
    fill: "white"
  });
  d3.select("#" + d.id).remove(); // could add transition to make this fade out
};

d3.select(self.frameElement).style("height", height + "px");
