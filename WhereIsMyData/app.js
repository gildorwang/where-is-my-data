///<reference path="Scripts/typings/d3/d3.d.ts"/>
///<reference path="Scripts/typings/lodash/lodash.d.ts"/>
var components = [
    {
        "NodeId": "1",
        "NodeName": "Candidate",
        "NodeType": "Source",
        "ParentNodeId": "2002"
    },
    {
        "NodeId": "2",
        "NodeName": "Is Beautiful",
        "NodeType": "Transform",
        "ParentNodeId": "2002"
    },
    {
        "NodeId": "3",
        "NodeName": "Is Smart",
        "NodeType": "Transform",
        "ParentNodeId": "2002"
    },
    {
        "NodeId": "6",
        "NodeName": "Is Beautiful 2",
        "NodeType": "Transform",
        "ParentNodeId": "2002"
    },
    {
        "NodeId": "7",
        "NodeName": "Is Smart 2",
        "NodeType": "Transform",
        "ParentNodeId": "2002"
    },
    {
        "NodeId": "8",
        "NodeName": "Is Smart 3",
        "NodeType": "Transform",
        "ParentNodeId": "2002"
    },
    {
        "NodeId": "4",
        "NodeName": "Weighted Scoring",
        "NodeType": "Transform",
        "ParentNodeId": "2002"
    },
    {
        "NodeId": "5",
        "NodeName": "Winner",
        "NodeType": "Destination",
        "ParentNodeId": "2002"
    }
];
var lineage = [
    {
        "FromNodeId": "1",
        "ToNodeId": "2"
    },
    {
        "FromNodeId": "2",
        "ToNodeId": "3"
    },
    {
        "FromNodeId": "3",
        "ToNodeId": "4"
    },
    {
        "FromNodeId": "1",
        "ToNodeId": "6"
    },
    {
        "FromNodeId": "6",
        "ToNodeId": "7"
    },
    {
        "FromNodeId": "7",
        "ToNodeId": "5"
    },
    {
        "FromNodeId": "1",
        "ToNodeId": "8"
    },
    {
        "FromNodeId": "8",
        "ToNodeId": "7"
    },
    {
        "FromNodeId": "4",
        "ToNodeId": "5"
    }
];
var Greeter = (function () {
    function Greeter(element) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }
    Greeter.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () { return _this.span.innerHTML = new Date().toUTCString(); }, 500);
    };
    Greeter.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Greeter;
})();
var ComponentGraph;
(function (ComponentGraph) {
    var Position = (function () {
        function Position(x, y) {
            this.x = x;
            this.y = y;
        }
        return Position;
    })();
    ComponentGraph.Position = Position;
    var Builder = (function () {
        function Builder(element, nodes, links) {
            var _this = this;
            this.element = element;
            this.onTick = function () {
                _this.circles.each(_this.gravity(.2 * _this.force.alpha())).attr("cx", function (d) { return d.x; }).attr("cy", function (d) { return d.y; });
                _this.lines.attr("x1", function (d) { return d.source.x; }).attr("y1", function (d) { return d.source.y; }).attr("x2", function (d) { return d.target.x; }).attr("y2", function (d) { return d.target.y; });
            };
            // Move nodes toward cluster focus.
            this.gravity = function (alpha) {
                return function (d) {
                    if (d.NodeType === "Source") {
                        d.y += (_this.startPosition.y - d.y) * alpha;
                        d.x += (_this.startPosition.x - d.x) * alpha;
                    }
                    else if (d.NodeType === "Destination") {
                        d.y += (_this.endPosition.y - d.y) * alpha;
                        d.x += (_this.endPosition.x - d.x) * alpha;
                    }
                };
            };
            this.updateMapSize(this.element);
            this.force = d3.layout.force().size([this.mapSize.width, this.mapSize.height]).nodes(nodes).links(links.map(function (l) {
                return {
                    source: _.find(nodes, function (i) { return i.NodeId === l.FromNodeId; }),
                    target: _.find(nodes, function (i) { return i.NodeId === l.ToNodeId; })
                };
            })).linkDistance(100).gravity(0).charge(-2000).on("tick", this.onTick);
            this.svg = d3.select(this.element).append("svg").attr("width", this.mapSize.width).attr("height", this.mapSize.height);
            this.circles = this.svg.selectAll(".node").data(nodes).enter().append("circle").attr("class", "node").attr("r", function (d) { return d.NodeType === "Source" || d.NodeType === "Destination" ? 25 : 15; }).style("fill", "gray").call(this.force.drag);
            this.lines = this.svg.selectAll(".link").data(this.force.links()).enter().append("line").attr("class", "link").style("stroke", "gray");
        }
        Builder.prototype.start = function () {
            this.force.start();
        };
        Builder.prototype.updateMapSize = function (element) {
            this.mapSize = { width: 800, height: 600 };
            this.startPosition = new Position(this.mapSize.width / 6, this.mapSize.height / 2);
            this.endPosition = new Position(this.mapSize.width * 5 / 6, this.mapSize.height / 2);
        };
        return Builder;
    })();
    ComponentGraph.Builder = Builder;
})(ComponentGraph || (ComponentGraph = {}));
window.onload = function () {
    var el = document.getElementById("content");
    var builder = new ComponentGraph.Builder(el, components, lineage);
    builder.start();
};
//# sourceMappingURL=app.js.map