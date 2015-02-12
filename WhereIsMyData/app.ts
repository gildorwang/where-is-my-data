///<reference path="Scripts/typings/d3/d3.d.ts"/>
///<reference path="Scripts/typings/lodash/lodash.d.ts"/>

interface Component extends D3.Layout.GraphNodeForce {
    NodeId: string;
    NodeName: string;
    NodeType: string;
    ParentNodeId: string;
}

interface Lineage {
    FromNodeId: string;
    ToNodeId: string;
}

var components: Component[] =
    [
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

var lineage: Lineage[] =
    [
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


class Greeter {
    element: HTMLElement;
    span: HTMLElement;
    timerToken: number;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }

    start() {
        this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
    }

    stop() {
        clearTimeout(this.timerToken);
    }

}

module ComponentGraph {
    export interface ISize {
        width: number;
        height: number;
    }

    export class Position {
        constructor(public x: number, public y: number) {
        }
    }

    export class Builder {
        mapSize: ISize;

        constructor(private element: HTMLElement, nodes: Component[], links: Lineage[]) {
            this.updateMapSize(this.element);
            this.force = d3.layout.force()
                .size([this.mapSize.width, this.mapSize.height])
                .nodes(<any>nodes)
                .links(<any>links.map(l => {
                return {
                    source: _.find(nodes, i => i.NodeId === l.FromNodeId),
                    target: _.find(nodes, i => i.NodeId === l.ToNodeId)
                }
            }))
                .linkDistance(100)
                .gravity(0)
                .charge(-2000)
                .on("tick", this.onTick);

            this.svg = d3.select(this.element)
                .append("svg")
                .attr("width", this.mapSize.width)
                .attr("height", this.mapSize.height);

            this.circles = this.svg.selectAll(".node")
                .data(<any>nodes)
                .enter()
                .append("circle")
                .attr("class", "node")
                .attr("r",(d: Component) => d.NodeType === "Source" || d.NodeType === "Destination" ? 25 : 15)
                .style("fill", "gray")
                .call(this.force.drag);

            this.lines = this.svg.selectAll(".link")
                .data(<any>this.force.links())
                .enter()
                .append("line")
                .attr("class", "link")
                .style("stroke", "gray")
            ;
        }

        start() {
            this.force.start();
        }

        onTick = () => {
            this.circles
                .each(this.gravity(.2 * this.force.alpha()))
                .attr("cx",(d: D3.Layout.GraphNodeForce) => d.x)
                .attr("cy",(d: D3.Layout.GraphNodeForce) => d.y);
            this.lines
                .attr("x1",(d: D3.Layout.GraphLinkForce) => d.source.x)
                .attr("y1",(d: D3.Layout.GraphLinkForce) => d.source.y)
                .attr("x2",(d: D3.Layout.GraphLinkForce) => d.target.x)
                .attr("y2",(d: D3.Layout.GraphLinkForce) => d.target.y);
        }
        // Move nodes toward cluster focus.
        gravity = (alpha: number) => {
            return (d: Component) => {
                if (d.NodeType === "Source") {
                    d.y += (this.startPosition.y - d.y) * alpha;
                    d.x += (this.startPosition.x - d.x) * alpha;
                }
                else if (d.NodeType === "Destination") {
                    d.y += (this.endPosition.y - d.y) * alpha;
                    d.x += (this.endPosition.x - d.x) * alpha;
                }
            };
        }

        force: D3.Layout.ForceLayout;
        startPosition: Position;
        endPosition: Position;

        updateMapSize(element: HTMLElement) {
            this.mapSize = { width: 800, height: 600 };
            this.startPosition = new Position(this.mapSize.width / 6, this.mapSize.height / 2);
            this.endPosition = new Position(this.mapSize.width * 5 / 6, this.mapSize.height / 2);
        }

        svg: D3.Selection;
        circles: D3.Selection;
        lines: D3.Selection;
    }
}

window.onload = () => {
    var el = document.getElementById("content");
    var builder = new ComponentGraph.Builder(el, components, lineage);
    builder.start();
};