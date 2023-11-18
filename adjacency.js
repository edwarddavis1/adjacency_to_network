// We make this function /reusable/ such that it can be used for any dataset

export const adjacencyPlot = () => {
    let width;
    let height;
    let data;
    let margin;
    let xValue;
    let yValue;
    let colourValue;
    let xDomain;
    let yDomain;
    let colours;

    const my = (selection) => {
        const x = d3
            .scaleLinear()
            .domain(xDomain)
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain(yDomain)
            .range([height - margin.bottom, margin.top]);

        const colourScale = d3
            .scaleSequential()
            .domain(d3.extent(data, colourValue))
            .interpolator(d3.interpolateViridis);

        const colourScaleDisc = d3
            .scaleOrdinal()
            .domain(Object.keys(colours))
            .range(Object.values(colours));

        // Add grid: vertical part
        selection
            .selectAll("g.grid_x")
            .data([null])
            .join("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(d3.max(xDomain))
                    .tickSize(-(height - margin.top - margin.bottom))
                    .tickFormat("")
            )
            .attr("opacity", 0.2);

        // Horizontal grid part
        selection
            .selectAll("g.grid_y")
            .data([null])
            .join("g")
            .attr("class", "grid")
            .attr("transform", `translate(${margin.left},0)`)
            .call(
                d3
                    .axisLeft(y)
                    .ticks(d3.max(yDomain))
                    .tickSize(-(width - margin.left - margin.right))
                    .tickFormat("")
            )
            .attr("opacity", 0.2);

        // Diagonal part
        selection
            .selectAll("g.grid_diag")
            .data([[d3.max(xDomain), d3.max(yDomain)]])
            .join("line")
            .attr("class", "grid")
            .attr("x1", x(0))
            .attr("y1", y(0))
            .attr("x2", (d) => x(d[0]))
            .attr("y2", (d) => y(d[1]))
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", 0.5);

        const marks = data.map((d) => ({
            x: x(xValue(d)),
            y: y(yValue(d) + 1), // The squares a placed below the x-axis at y=0. The +1 shifts this above
            weight: d.weight,
            source: d.source,
            target: d.target,
            id: `${d.source}-${d.target}`,
            // if string, use colourScaleDisc
            // if number, use colourScale
            colour:
                typeof colourValue(d) === "string"
                    ? colourScaleDisc(colourValue(d))
                    : colourScale(colourValue(d)),
        }));

        const myTransition = d3.transition().duration(200);

        // const squareWidth = width / (d3.max(xDomain) + 5);
        const squareWidth =
            Math.abs(width - margin.left - margin.right) / d3.max(xDomain);
        const squareHeight =
            Math.abs(height - margin.top - margin.bottom) / d3.max(yDomain);

        const nodes = selection
            .selectAll(".adjPoints")
            .data(marks)
            .join(
                (enter) =>
                    enter
                        .append("rect")
                        // .attr("width", 0)
                        // .attr("height", 0)
                        .style("opacity", 0)
                        .attr("x", (3 * width) / 4)
                        .attr("y", height / 2)
                        .call((enter) =>
                            enter
                                .transition(myTransition)
                                .delay((d, i) => i * 5)
                        ),
                (update) =>
                    update.call((update) =>
                        update.transition(myTransition).delay((d, i) => i * 0)
                    )
            )
            .transition(myTransition)
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("sourceId", (d) => d.source)
            .attr("targetId", (d) => d.target)
            .attr("id", (d) => d.id)
            .style("opacity", (d) => d.weight)
            .attr("class", "adjPoints")
            .attr("width", squareWidth)
            .attr("height", squareHeight)
            .attr("name", (d) => d.name)
            .attr("weight", (d) => d.weight)
            .attr("house", (d) => d.house)
            .attr("good_bad", (d) => d.good_bad)
            .attr("fill", (d) => d.colour);

        // // Add x and y axes
        // selection
        //     .selectAll("g.x-axis")
        //     .data([null]) // just a single data point so that only one axis is created
        //     .join("g")
        //     .attr("class", "x-axis")
        //     .attr("transform", `translate(0,${height - margin.bottom})`)
        //     .call(d3.axisBottom(x).tickFormat("").ticks(d3.max(xDomain)));
        // // Remove ticks and tick labels by setting tickSize to 0 and tickFormat to an empty string

        // selection
        //     .selectAll("g.y-axis") // need to use class as we don't want the y-axis to erase the x-axis
        //     .data([null]) // just a single data point
        //     .join("g")
        //     .attr("class", "y-axis")
        //     .attr("transform", `translate(${margin.left},0)`)
        //     .call(d3.axisLeft(y).tickFormat(""));
        // Remove ticks and tick labels by setting tickSize to 0 and tickFormat to an empty string

        // Add tick labels
    };

    my.width = function (_) {
        return arguments.length ? ((width = +_), my) : width;
    };
    my.height = function (_) {
        return arguments.length ? ((height = +_), my) : height;
    };
    my.data = function (_) {
        return arguments.length ? ((data = _), my) : data;
    };
    my.margin = function (_) {
        return arguments.length ? ((margin = _), my) : margin;
    };
    my.size = function (_) {
        return arguments.length ? ((size = +_), my) : size;
    };
    my.xValue = function (_) {
        return arguments.length ? ((xValue = _), my) : xValue;
    };
    my.yValue = function (_) {
        return arguments.length ? ((yValue = _), my) : yValue;
    };
    my.colourValue = function (_) {
        return arguments.length ? ((colourValue = _), my) : colourValue;
    };
    my.xDomain = function (_) {
        return arguments.length ? ((xDomain = _), my) : xDomain;
    };
    my.yDomain = function (_) {
        return arguments.length ? ((yDomain = _), my) : yDomain;
    };
    my.colours = function (_) {
        return arguments.length ? ((colours = _), my) : colours;
    };

    return my;
};
