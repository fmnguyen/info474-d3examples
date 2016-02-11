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
  
  svg.append("path")
        .datum(topojson.feature(iowa, iowa.objects.subunits))
        .attr("d", path)
        .attr("class", "state");

  svg.selectAll(".subunit")
    .data(topojson.feature(iowa, iowa.objects.subunits).features)
    .enter().append("path")
      .attr("class", function(d) { return "subunit county-boundary " + d.id; })
      .attr("d", path);



});

d3.select(self.frameElement).style("height", height + "px");
