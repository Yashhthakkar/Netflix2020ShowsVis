let graph;

const width = 900;
const height = 1200;

const svg = d3.select("#visualization").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("display", "block"); 

d3.json("netflix.txt").then(function(data) {
    graph = data; 

    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.name))
        .force("charge", d3.forceManyBody().strength(-1.35))
        .force("x", d3.forceX(width / 2).strength(0.007))
        .force("y", d3.forceY(height / 2).strength(0.007))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .stop();

    for (let i = 0; i < 300; ++i) simulation.tick();

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", 1)
        .attr("stroke", "#bbb")
        .attr("class", d => `link source-${d.source.index} target-${d.target.index}`);

    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", d => `node node-${d.index}`)
        .attr("r", 5)
        .attr("fill", d => d.type === "TV Show" ? "green" : "blue")
        .on("mouseover", handleMouseOver) 
        .on("mouseout", handleMouseOut);

    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
})
.catch(function(error) {
    console.error('Error loading the data: ' + error);
});


function updateVisualization(searchQuery) {
    d3.selectAll('.node, .link, .labels text').classed('focused', false).classed('dimmed', false);

    const matchedNodes = graph.nodes.filter(node => node.name.toLowerCase() === searchQuery.toLowerCase());
    
    if (matchedNodes.length > 0) {
        matchedNodes.forEach(matchedNode => {
            const nodeSelector = '.node-' + matchedNode.index;
            d3.select(nodeSelector).classed('focused', true);

            d3.selectAll('.link').filter(function(link) {
                return link.source === matchedNode || link.target === matchedNode;
            }).classed('focused', true);
        });

        const connectedNodes = [];
        matchedNodes.forEach(matchedNode => {
            graph.links.forEach(link => {
                if (link.source === matchedNode) {
                    connectedNodes.push(link.target);
                } else if (link.target === matchedNode) {
                    connectedNodes.push(link.source);
                }
            });
        });

        connectedNodes.forEach(connectedNode => {
            const nodeSelector = '.node-' + connectedNode.index;
            d3.select(nodeSelector).classed('focused', true);
        });

        d3.selectAll('.node, .link, .labels text').classed('dimmed', true);

        d3.selectAll('.node.focused, .link.focused').classed('dimmed', false);
        
        d3.select('.labels').selectAll('text').filter(function(label) {
            return matchedNodes.some(matchedNode => label.node === matchedNode || label.neighbors.includes(matchedNode));
        }).classed('focused', true);

        displayNodeInfo(matchedNodes[0]);
    } else {
        hideNodeInfo();
    }
}


function displayNodeInfo(node) {
    const infoDiv = document.getElementById("info");
    infoDiv.style.display = "block";

    const visualizationRect = document.getElementById("visualization").getBoundingClientRect();
    const infoBoxWidth = 300;
    const infoBoxHeight = 200;

    const infoBoxLeft = (visualizationRect.width - infoBoxWidth) / 2 + visualizationRect.left;
    const infoBoxTop = visualizationRect.top - infoBoxHeight - 10;

    infoDiv.style.left = `${infoBoxLeft}px`;
    infoDiv.style.top = `${infoBoxTop}px`;

    infoDiv.innerHTML = "";

    if (node.type === "TV Show") {
        infoDiv.innerHTML += `<strong>Name:</strong> ${node.name}<br>`;
        infoDiv.innerHTML += `<strong>Type:</strong> ${node.type}<br>`;
        infoDiv.innerHTML += `<strong>Release Date:</strong> ${node.release_date}<br>`;
        infoDiv.innerHTML += `<strong>Rating:</strong> ${node.rating}<br>`;
        infoDiv.innerHTML += `<strong>Cast:</strong> ${node.cast}<br>`;
        infoDiv.innerHTML += `<strong>Description:</strong> ${node.description}<br>`;
        infoDiv.innerHTML += `<strong>Genre:</strong> ${node.genre}<br>`;
    } else if (node.type === "Actor") {
        infoDiv.innerHTML += `<strong>Name:</strong> ${node.name}<br>`;
        infoDiv.innerHTML += `<strong>TV Shows:</strong> ${node.tvshows.join(", ")}`;
    }
}


function hideNodeInfo() {
    const infoDiv = document.getElementById("info");
    infoDiv.style.display = "none";
}


function handleMouseOver(d) {
    d3.selectAll('.node, .link, .labels text').classed('dimmed', true);

    d3.select(this).classed('focused', true);
    d3.selectAll('.link').filter(function(link) {
        return link.source === d || link.target === d;
    }).classed('focused', true)
      .each(function(link) {
        d3.select('.node-' + link.source.index).classed('dimmed', false).classed('focused', true);
        d3.select('.node-' + link.target.index).classed('dimmed', false).classed('focused', true);
    });

    d3.select('.labels').selectAll('text').filter(function(label) {
        return label.node === d || label.neighbors.includes(d);
    }).classed('focused', true);

    const infoDiv = document.getElementById("info");
    infoDiv.style.display = "block";

    const infoBoxRight = "10px";
    const infoBoxTop = "10px";

    const visualizationRect = document.getElementById("visualization").getBoundingClientRect();
    infoDiv.style.right = infoBoxRight;
    infoDiv.style.top = `${visualizationRect.top + parseInt(infoBoxTop, 10)}px`;

    infoDiv.innerHTML = "";

    if (d.type === "TV Show") {
        infoDiv.innerHTML += `<strong>Name:</strong> ${d.name}<br>`;
        infoDiv.innerHTML += `<strong>Type:</strong> ${d.type}<br>`;
        infoDiv.innerHTML += `<strong>Release Date:</strong> ${d.release_date}<br>`;
        infoDiv.innerHTML += `<strong>Rating:</strong> ${d.rating}<br>`;
        infoDiv.innerHTML += `<strong>Cast:</strong> ${d.cast}<br>`;
        infoDiv.innerHTML += `<strong>Description:</strong> ${d.description}<br>`;
        infoDiv.innerHTML += `<strong>Genre:</strong> ${d.genre}<br>`;
    } else if (d.type === "Actor") {
       infoDiv.innerHTML += `<strong>Name:</strong> ${d.name}<br>`;
       infoDiv.innerHTML += `<strong>TV Shows:</strong> ${d.tvshows.join(", ")}`;
    }
    }


function handleMouseOut() {
    d3.selectAll('.node, .link').classed('dimmed', false).classed('focused', false);

    const infoDiv = document.getElementById("info");
    infoDiv.style.display = "none";
}


function updateDropdown(searchQuery) {
    const lowerCaseQuery = searchQuery.toLowerCase();

    const filteredList = combinedSearchList.filter(d => d.toLowerCase().includes(lowerCaseQuery));

    const searchBox = d3.select("#search-box").node();
    const searchBoxRect = searchBox.getBoundingClientRect();
    const dropdown = d3.select("#search-container")
                      .selectAll("ul")
                      .data([null]);

    const dropdownEnter = dropdown.enter()
                        .append("ul")
                        .attr("class", "dropdown")
                        .style("left", `${searchBoxRect.left}px`)
                        .style("top", `${searchBoxRect.bottom}px`);

    const items = dropdown.merge(dropdownEnter).selectAll("li")
                          .data(filteredList, d => d);

    items.enter()
         .append("li")
         .merge(items)
         .text(d => d)
         .on("click", function(d) {
             d3.select("#search-box").property("value", d); 
             updateVisualization(d); 
             hideDropdown();
         });

    items.exit().remove();
}



    const header = document.querySelector('.header');
        header.style.textAlign = 'center';
        header.style.margin = '20px auto';

    const legend = document.querySelector('.legend');
        legend.style.textAlign = 'center';
        legend.style.margin = '20px auto';

    const visualization = document.querySelector('#visualization');
        visualization.style.textAlign = 'center';
        visualization.style.margin = 'auto';

    const searchContainer = document.querySelector('#search-container');
        searchContainer.style.textAlign = 'center';
        searchContainer.style.margin = '20px auto';



function hideDropdown() {
    d3.select("#search-container").selectAll("ul").remove();
}

let combinedSearchList = [];

d3.json("netflix.txt").then(function(graph) {

    combinedSearchList = graph.nodes.map(d => d.name).sort();

d3.select("#search-box").on("input", function() {
    updateDropdown(this.value);
    updateVisualization(this.value);
});

d3.select("#search-box").on("click", function() {
    updateDropdown(this.value);
});

d3.select("body").on("click", function() {
    if (!d3.select("#search-box").node().contains(d3.event.target)) {
        hideDropdown();
    }
});

}).catch(function(error) {
    console.error('Error loading the data: ' + error);
});

