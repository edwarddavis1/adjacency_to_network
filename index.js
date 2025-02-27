import { networkPlot } from "./network.js";
import { getColours } from "./colours.js";
import { adjacencyPlot } from "./adjacency.js";

const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Load data from data.json
async function loadGraph() {
    const data = await d3.json("./data/emnity_graph.json");
    return data;
}
async function loadAdjacency() {
    const data = await d3.csv("./data/A.csv");
    return data;
}

// Create div for legend
d3.select("body").append("div").attr("class", "legend");
const legend = d3
    .select(".legend")
    .append("svg")
    .attr("width", width / 5)
    .attr("height", height)
    .style("position", "absolute")
    .style("top", "20")
    .style("right", "0");

// Create a network plot from the data
async function main() {
    let t = 0;

    let goodBadColours = { 1: "#CA054D", 0: "#41b6c4" };
    let houseColours = {
        g: "#ae0001",
        s: "#2a623d",
        r: "#222f5b",
        h: "#f0c75e",
        m: "#372e29",
        n: "#bebebe",
    };
    let topFiveColours = {
        1: "#3B1C32",
        0: "#B96D40",
    };

    let degreeColours = getColours("viridis");

    function continuousColourLegend(colours, range, selection) {
        var grad = selection
            // .append("defs")
            .append("linearGradient")
            .attr("id", "grad")
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%");

        grad.selectAll("stop")
            .data(colours)
            .enter()
            .append("stop")
            .style("stop-color", function (d) {
                return d;
            })
            .attr("offset", function (d, i) {
                return 100 * (i / (colours.length - 1)) + "%";
            });

        // console.log(legend.node().getBoundingClientRect());
        // let legendWidth = legend.node().getBoundingClientRect().width;
        // let legendHeight = legend.node().getBoundingClientRect().height;
        selection
            .append("rect")
            .attr("width", 20)
            .attr("height", height / 2)
            .attr("x", 30)
            .attr("y", height / 4)
            // .attr("top", 0)
            // .attr("translate", `translate(${width / 5}, 20)`)
            .style("fill", "url(#grad)");

        selection
            .append("text")
            .text(range[1])
            .attr("x", 60)
            .attr("y", height / 4 + 10)
            .attr("font-size", "12px")
            .attr("fill", "#000");

        selection
            .append("text")
            .text(range[0])
            .attr("x", 60)
            .attr("y", (height / 4) * 3)
            .attr("font-size", "12px")
            .attr("fill", "#000");
    }

    // console.log(Object.values(goodBadColours));
    // continuousColourLegend(Object.values(goodBadColours), svg);

    const goodBadCategories = ["Good", "Bad"];
    const houseCategories = [
        "Gryffindor",
        "Slytherin",
        "Ravenclaw",
        "Hufflepuff",
        "Muggle",
        "None",
    ];
    const topFiveCategories = ["Not Main Character", "Main Character"];

    function fillLegend(colours, categories, continuous, legendTitle) {
        legend.selectAll("*").remove();

        const legendItems = legend
            .selectAll(".legend-item")
            .data(categories)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(30, ${40 + i * 20})`);

        if (continuous == false) {
            legend
                .append("text")
                .text(legendTitle)
                .attr("x", 30)
                .attr("y", 20)
                .attr("font-size", "16px")
                // .attr("font-weight", "bold")
                .attr("fill", "#000");

            legendItems
                .append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", (d, i) => Object.values(colours)[i]);

            legendItems
                .append("text")
                .text((d) => d)
                .attr("x", 15)
                .attr("y", 10);
        } else {
            legend
                .append("text")
                .text(legendTitle)
                .attr("x", 30)
                .attr("y", height / 4 - 20)
                .attr("font-size", "16px")
                // .attr("font-weight", "bold")
                .attr("fill", "#000");

            continuousColourLegend(colours, categories, legend);
            console.log("continuous legend");
        }
    }

    // get the dimensions of a selection
    // console.log(legend.node().getBoundingClientRect());

    const graphData = await loadGraph();

    console.log(graphData);

    const adjacencyData = await loadAdjacency();

    console.log(adjacencyData);
    // console.log(d3.extent(graphData.links, (d) => d.target));

    const adjPlotTop = 40;
    const adjPlotLeft = width / 2;
    const adjPlotRight = 40;
    const adjPlotBottom = 40;
    const adjPlot = adjacencyPlot()
        .width(width)
        .height(height)
        .data(adjacencyData)
        .margin({
            top: adjPlotTop,
            right: adjPlotRight,
            bottom: adjPlotBottom,
            left: adjPlotLeft,
        })
        // .margin({
        //     top: 40,
        //     right: 40,
        //     bottom: 100,
        //     left: 40,
        // })
        .xValue((d) => +d.source)
        .yValue((d) => +d.target)
        .xDomain([0, 51])
        .yDomain([0, 51])
        // .xDomain(d3.extent(graphData.links, (d) => d.source))
        // .yDomain(d3.extent(graphData.links, (d) => d.target))
        .colours(goodBadColours)
        .colourValue((d) => 0);

    svg.call(adjPlot);

    const network = networkPlot()
        .width((2 * width) / 5)
        .height(height)
        .colourValue((d) => 0)
        .colours(goodBadColours)
        .data(graphData);

    svg.call(network);

    function getNeighbours(node) {
        let neighbours = [];
        graphData.links.forEach((d) => {
            if (d.source.id == node.id) {
                neighbours.push(d.target);
            } else if (d.target.id == node.id) {
                neighbours.push(d.source);
            }
        });
        return neighbours;
    }

    let colours = [
        "#41b6c4",
        "#CA054D",
        "#3B1C32",
        "#B96D40",
        "#F9C846",
        "#6153CC",
    ];

    /////////////////////////////
    //// Interactiveness ////////
    /////////////////////////////

    // Define the tooltip element
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute");

    const squareWidth = Math.abs(width - adjPlotLeft - adjPlotRight) / 51;
    const squareHeight = Math.abs(height - adjPlotTop - adjPlotBottom) / 51;

    function interactivity() {
        // svg.selectAll(".adjPoints, .networkMarks")
        svg.selectAll("circle, rect")
            .on("mouseover", function (event) {
                console.log(this);
                console.log(this.getAttribute("sourceId"));

                // Show the tooltip with the data
                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9)
                    .style("background-color", colours[0]);
                tooltip
                    .html(this.getAttribute("name"))
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px");

                d3.select(this).attr("r", 10);
                // d3.select(this).attr("width", 100);
                // d3.select(this).attr("height", 100);

                d3.selectAll(".adjPoints, .networkMarks")
                    .attr("fill", (d) => {
                        if (
                            d.id == this.id //||
                            // d.id == this.getAttribute("sourceId") ||
                            // d.id == this.getAttribute("targetId")
                        ) {
                            return colours[4];
                        } else if (
                            getNeighbours(d).includes(this.__data__) ||
                            d.id == this.getAttribute("sourceId") ||
                            d.id == this.getAttribute("targetId")
                        ) {
                            return "orchid";
                        } else {
                            return d.colour;
                            // return colours[1];
                        }
                    })
                    .attr("opacity", (d) => {
                        if (
                            d.id == this.id ||
                            d.id == this.getAttribute("sourceId") ||
                            d.id == this.getAttribute("targetId")
                        ) {
                            return 1;
                        } else if (getNeighbours(d).includes(this.__data__)) {
                            return 1;
                        } else {
                            return 0.3;
                            // return colours[1];
                        }
                    })
                    .attr("r", (d) => {
                        if (
                            d.id == this.id //||
                            // d.id == this.getAttribute("sourceId") ||
                            // d.id == this.getAttribute("targetId")
                        ) {
                            return 10;
                        } else {
                            return 5;
                        }
                    });

                d3.selectAll(".networkLinks").attr("stroke", (d) => {
                    if (d.source.id == this.id || d.target.id == this.id) {
                        return "red";
                    } else if (
                        d.source.id == this.getAttribute("sourceId") &&
                        d.target.id == this.getAttribute("targetId")
                    ) {
                        return "red";
                    } else {
                        return d.colour;
                    }
                });
            })
            .on("mouseout", function (d) {
                // Hide the tooltip
                tooltip
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .on("end", function () {
                        // Disable mouse events on the tooltip div when it is hidden
                        tooltip.style("pointer-events", "none");
                    });

                d3.select(this).attr("r", 5).attr("stroke", "none");
                // d3.select(this).attr("width", squareWidth);
                // d3.select(this).attr("height", squareHeight);

                d3.selectAll(".adjPoints, .networkMarks")
                    .attr("fill", (d) => {
                        return d.colour;
                    })
                    .attr("opacity", 1)
                    .attr("r", 5);

                d3.selectAll(".networkLinks").attr("stroke", (d) => {
                    return d.colour;
                });
            });
    }

    interactivity();
    //////////////////////////////
    /////// Animation ////////////
    //////////////////////////////
}

main();
