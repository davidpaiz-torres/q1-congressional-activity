const margin = { top: 40, right: 120, bottom: 60, left: 60 },
      width = 650,
      height = 400;

//Date format
const parseDate = d3.timeParse("%Y-%m-%d");

d3.json("../q1-congressional-activity/data/all_data.json").then(response => {
  const billsData = response.bills;
  console.log("Bills data:", billsData);

  // Parse the action_date for each bill
  billsData.forEach(d => {
    d.action_date = parseDate(d.action_date);
  });

  // Aggregate the data: count the number of bills for each action_date
  const billsByDate = d3.rollup(billsData, v => v.length, d => d.action_date);
  const aggregatedData = Array.from(billsByDate, ([date, count]) => ({ date, count }));

  // Sort the data by date in ascending order
  aggregatedData.sort((a, b) => a.date - b.date);
  console.log("Aggregated data:", aggregatedData);

  // Create scales 
  const xScale = d3.scaleTime()
    .domain(d3.extent(aggregatedData, d => d.date))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(aggregatedData, d => d.count)])
    .range([height, 0]);

  // append svg to html body
  const svg = d3.select("#container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", "auto")
    .style("margin-right", "auto")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("margin", "auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// tooltip
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "8px")
    .style("pointer-events", "none");

  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.count));

  // Append the line path to the SVG
  svg.append("path")
    .datum(aggregatedData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // tooltip points
  svg.selectAll("circle")
    .data(aggregatedData)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.date))
    .attr("cy", d => yScale(d.count))
    .attr("r", 2.95)
    .attr("fill", "steelblue")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`<strong>Date:</strong> ${d.date.toLocaleDateString()}<br>
                    <strong>Actions Taken:</strong> ${d.count}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 18) + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Add axes
 svg.append("g")
 .attr("transform", `translate(0, ${height})`)
 .call(d3.axisBottom(xScale))
 .call(g => g.selectAll(".tick line").remove())  
 .call(g => g.select(".domain").remove());

svg.append("g")
 .call(d3.axisLeft(yScale))
 .call(g => g.selectAll(".tick line").remove())  
 .call(g => g.select(".domain").remove());

 svg.append("text")
 .attr("x", width / 2)
 .attr("y", height + margin.top - 465)
 .attr("text-anchor", "middle")
 .style("font-size", "18px")
 .text("Daily Congressional Activity on Pending Legislation"); 

svg.append("text")
 .attr("x", width / 2)
 .attr("y", height + margin.bottom - 10)
 .attr("text-anchor", "middle")
 .style("font-size", "14px")
 .text("Credit: David Paiz-Torres | Data Source:Congress.gov");

svg.append("text")
 .attr("transform", "rotate(-90)")
 .attr("y", -margin.left + 35)
 .attr("x", -height / 2)
 .attr("dy", "-1em")
 .attr("text-anchor", "middle")
 .style("font-size", "14px")
 .text("Number of Actions Taken on a Given Day");
});
