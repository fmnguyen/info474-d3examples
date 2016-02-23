
// Width and heigh 
var w = 960;
var h = 500;
var centered;
/*
// Define map projection 
var projection = d3.geo.albersUsa()
                        .translate([w/2, h/2])
                        .scale([1000]);

// Define path generator 
var path = d3.geo.path()
                    .projection(projection);
*/

// Define quantize scale to sort data value into buckets of color 
var color = d3.scale.linear()
                    .range(['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15']);

var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

// Create SVG element 
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

/*svg.append("rect")
    .attr("class", "background")
    .attr("width", w)
    .attr("height", h)
    .on("click", clicked);*/

// Load Washington housing market data 
d3.csv("data.csv", function(data) {

    // Set input domain for color scale 
    color.domain([
        d3.min(data, function(d) { return d.YoY; }),
        d3.max(data, function(d) { return d.YoY; })
    ]);

    // Load in GeoJSON data 
    d3.json("wa_zip.geojson.json", function(json) {
        var center = d3.geo.centroid(json);
        var scale = 5000;

        var projection = d3.geo.mercator().center(center)
                            .scale(scale).rotate([0,0,0]);

        var path = d3.geo.path().projection(projection);

        var rank = data.length;

        // Loop through the data file 
        for (var i = 0; i < data.length; i++) {
            var dataZip = data[i].Zipcode;

            var dataValue = data[i].YoY;

            var dataCity = data[i].City;

            var dataRank = data[i].Rank;

            // Find the corresponding zipcode inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonZip = json.features[j].id;

                if (dataZip == jsonZip) {
                    json.features[j].properties.value = dataValue;
                    json.features[j].properties.name = dataCity;
                    json.features[j].properties.rank = dataRank;
                    break;
                }
            }
        }

        svg.append("rect")
            .attr("class", "background")
            .attr("width", w)
            .attr("height", h)
            .on("click", clicked);

        var g = svg.append("g")
                    .attr("class" , "state")


       g.selectAll("path")
            .data(json.features)
        .enter().append("path")
            .attr("d",path)
            .style("fill", function(d) {
                var value = d.properties.value;
                if (value) {
                    return color(value);
                } else {
                    return "#ccc";
                }
            })
            .on("mouseover", function(d) {
                d3.select(this).transition().duration(300).style("opacity", 1);
                div.transition().duration(300)
                .style("opacity", 0.8)
                div.text(d.properties.name + " " + d.id + " : " + d3.round(d.properties.value*100,1) + "%. Rank " + d.properties.rank + " Out of " + rank)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                .transition().duration(300)
                .style("opacity", 1);
                div.transition().duration(300)
                .style("opacity", 0);
            })
            .on("click", clicked);

            function clicked(d) {
              var x, y, k;

              if (d && centered !== d) {
                var centroid = path.centroid(d);
                x = centroid[0];
                y = centroid[1];
                k = 4;
                centered = d;
              } else {
                x = w / 2;
                y = h / 2;
                k = 1;
                centered = null;
              }

              // changed these to target g not svg
              g.selectAll("path")
                  .classed("active", centered && function(d) { return d === centered; });

              g.transition()
                  .duration(750)
                  .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                  .style("stroke-width", 1.5 / k + "px");
            };
    });
});