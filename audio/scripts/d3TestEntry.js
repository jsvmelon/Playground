define(["d3","d3fc"], function(d3,fc) {
    console.log("entered d3TestEntry.js");

    var data = [],
        radius = 2;

    var svg = d3.select("body").append("svg")
        .attr("width", 500)
        .attr("height", 300);

    svg.selectAll(".dot")
        .data(data, function(d, i) { return d.key; })
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", radius)
        .attr("cx", function(d) { return d.xPos; })
        .attr("cy", function(d) { return d.yPos; })
        .style("fill", "#000000");

    var lastAddition = Date.now();

    requestAnimationFrame(draw);

    function draw() {
        requestAnimationFrame(draw);
        // move x-position of existing data points
        data = data.map(function(d) {
            d.xPos = d.xPos - 1;
            return d;
        });

        // filter those that are too far to the left
        data = data.filter(function(d){ return d.xPos > 10; });

        var select = svg.selectAll(".dot")
        .data(data, function(d, i) { return d.key; });

        // udpate
        select.attr("cx", function(d) { return d.xPos; });

        // remove
        select.exit().remove();

        // add
        if( (Date.now()-lastAddition) > 10) {
            // add new data points
            var newKey;
            if (data.length === 0) newKey = 0;
            else newKey = data[data.length-1].key+1;
            data.push({xPos: 500, yPos: Math.round(Math.random()*250)+10, key: newKey})

            // add new data point to visualisation
            var dots = svg.selectAll(".dot")
            .data(data, function(d, i) { return d.key; })
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", radius)
            .attr("cx", function(d) { return d.xPos; })
            .attr("cy", function(d) { return d.yPos; })
            .style("fill", "#000000");

            lastAddition = Date.now();
        }
    }
});