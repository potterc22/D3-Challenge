// Items to compare:
//     poverty vs obesity
//     income vs smokes
//     healthcare vs age
// set svg width, height and margin
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
  
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }
  
// function used for updating xAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    
    return yAxis;
}
  
// function used for updating circles group with a transition to
// new circles
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
  
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xLabel;
    var yLabel;
  
    if (chosenXAxis === "poverty") {
      xLabel = "Poverty(%):";
    }
    else {
      xLabel = "Income(Avg):";
    }

    if (chosenYAxis === "obesity") {
        yLabel = "Obese(%):";
    }
    else {
        yLabel = "Smokes(%):";
    }    
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;
  
    // parse data
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.obesity = +data.obesity;
      data.income = +data.income;
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d.obesity)])
      .range([height, 0]);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.obesity))
      .attr("r", 15)
      .attr("fill", "#06D6A0")
      .attr("opacity", ".5")
  
    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    // append x axis for poverty
    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .classed("axis-text", true)
      .text("In Poverty (%)");
  
    // append x axis for income
    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .classed("axis-text", true)
      .text("Household Income (Median)");
  
    // append y axis for obesity
    var obesityLabel = chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (margin.left/2))
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Obese (%)");

    // append y axis for smokes
    var smokesLabel = chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (margin.left/1.30))
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Smokes (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text for X axis
            if (chosenXAxis === "income") {
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });

    // y axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;

            // updates y scale for new data
            yLinearScale = yScale(censusData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text for Y axis
            if (chosenYAxis === "obesity") {
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });        
}).catch(function(error) {
    console.log(error);
});