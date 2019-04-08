const rad0 = r => 1 + 3 * r;
const rad = r => 15 + 5 * r;

var width = 1500,
    height = 700;

var nodes = data.map(d =>
        Object.assign(d, { radius: d.name ? rad(d.marbles) : rad0(d.marbles) })
    ),
    root = nodes[0],
    color = d3.scale.category10(),
    padding = 10;

root.radius = 0;
root.fixed = true;

var force = d3.layout
    .force()
    .gravity(0.05)
    .charge((d, i) => (i ? 0 : -2000))
    .nodes(nodes)
    .size([width, height]);

force.start();

var svg = d3
    .select("#root")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("display", "block")
    .style("margin", "auto");

var node = svg
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr({ class: "node" });

node.append("circle")
    .attr("r", d => d.radius)
    // .style("fill", (d, i) => color(i % 3))
    .style("fill", "orange");
// .style("stroke", "orange")
// .style("stroke-width", d => (d.name ? padding : 0));

var defs = node.append("defs").attr("id", "imgdefs");

var clipPath = defs
    .append("clipPath")
    .attr("id", d => `clip-circle-${d.image.slice(1)}`)
    .append("circle")
    .attr("r", d => (d.name ? d.radius - padding / 2 : d.radius))
    .attr("cy", 0)
    .attr("cx", 0);

node.append("image")
    .attr("x", d => -(d.name ? d.radius - padding / 2 : d.radius))
    .attr("y", d => -(d.name ? d.radius - padding / 2 : d.radius))
    .attr("width", d => (d.name ? 2 * d.radius - padding : 2 * d.radius))
    .attr("height", d => (d.name ? undefined : 2 * d.radius))
    .attr("xlink:href", d => d.image)
    .attr("clip-path", d => `url(#clip-circle-${d.image.slice(1)})`);

// node.append("text")
//       .text(d => `${d.marbles ? d.marbles : ''}`)
//       .attr('x', 6)
//       .attr('y', 3);

force.on("tick", e => {
    var q = d3.geom.quadtree(nodes),
        i = 0,
        n = nodes.length;

    while (++i < n) q.visit(collide(nodes[i]));

    node.attr("transform", d => "translate(" + d.x + "," + d.y + ")");
});

svg.on("mousemove", function() {
    var p1 = d3.mouse(this);
    root.px = p1[0];
    root.py = p1[1];
    force.resume();
});

function collide(node) {
    var r = 2 * node.radius,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        if (quad.point && quad.point !== node) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.radius + quad.point.radius;
            if (l < r) {
                l = ((l - r) / l) * 0.5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
}
