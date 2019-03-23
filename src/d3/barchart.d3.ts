import { select, selectAll } from "d3-selection";
import 'd3-transition';
import { scaleBand, scaleLinear, scaleTime, scaleOrdinal } from "d3-scale";
import { schemeAccent, schemeCategory10 } from "d3-scale-chromatic";
import { extent } from "d3-array";
import { line } from "d3-shape"
import {axisBottom, axisLeft} from "d3-axis";
import { malagaStats } from "./barchart.data";
import {max} from "d3-array"

const d3 = {
  select, 
  selectAll, 
  scaleBand, 
  scaleLinear, 
  extent,
  line,
  scaleOrdinal,
  scaleTime,
  schemeAccent,
  schemeCategory10,
  axisBottom,
  axisLeft,
  max
};

// Internal coordinate system
const width = 500;
const height = 300;
const padding = 50;

// Creating the card to enclose the chart.
const card = select("#root")
  .append("div")
    .attr("class", "card");

// Creating svg entry inside the card
const svg = card
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `${-padding} ${-padding} ${width + 2*padding} ${height + 2*padding}`);

// X scale mapping months (0..11) to pixels
const dateMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const scaleXPos = d3.scaleBand()
  //.domain([new Date(2018, 0), new Date(2018, 11)]) //data input, months, 0..11
  .domain(dateMonths)
  .range([0, width]) // pixels
  .paddingInner(0.17) // space between bars

const xAxisG = d3.scaleBand()
  .padding(0.04)
  .domain(["min","avg","max"])
  .rangeRound([0, scaleXPos.bandwidth()])

// Y scale mapping temperatures to pixels
const scaleYPos = d3.scaleLinear()
  .domain([0, d3.max(malagaStats.reduce((acc, s) => acc.concat(s.values), []))]) // axis limits: from 0 to max temperature
  //.domain(d3.extent(malagaStats.reduce((acc,s) => acc.concat(s.values), []))) // axis limits: from min to max temperature
  .rangeRound([height, 0]);

  // color scale (blue: min; green: avg; red: max)
const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  .domain(['min', '', 'avg', 'max']);
;

// Creating bar group
const barGroup = svg
  .append("g");

// append new bars
barGroup
  .selectAll('g')
  .data(malagaStats)
  .enter()
  .append("g") // appending group of x axis first (avg, min, max)
    .attr("transform", (d,i) => "translate(" + xAxisG(d.id) + ",0)")
    .attr("fill", d => colorScale(d.id)) // colors
    .selectAll("rect")
    .data(d => d.values)
    .enter()
    .append("rect") // data for each component of the group, that is avg, min and max
    .attr("x", (d,i) => scaleXPos(dateMonths[i]))
    .attr("y", d => scaleYPos(d))
    .attr("width", xAxisG.bandwidth()) // Note it's width not of scalexpos but of the group x
    .attr("height", d => height - scaleYPos(d));


// add X and Y axis. 
svg.append("g")
  .call(d3.axisLeft(scaleYPos))
  .append("g")
      .attr("transform",`translate(0, ${height})`)
      .call(d3.axisBottom(scaleXPos))

// X axis title
svg.append('text')
    .attr('x', -height/2)
    .attr('y', -padding/1.5)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Temperature (ºC)')

// Y axis title
svg.append('text')
    .attr('x', width/2)
    .attr('y', height+padding/1.3)
    .attr('text-anchor', 'end')
    .text('Month')

// Legend group
const legend = svg.append("g")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(malagaStats)
    .enter()
    .append("g")
    .attr("transform", (d,i) => "translate(" + i*-25 + ",0)") // adjust for separation between rectangles

// Rectangles to represent each color
legend
    .append("rect")
    .attr("x", width - 20)
    .attr("width", 20)
    .attr("height", 15)
    .attr("fill", d => colorScale(d.id))

// Add text explaining each color
legend
    .append("text")
    .attr("x", width)
    .attr("y", 30)
    .text((d,i) => d.id)