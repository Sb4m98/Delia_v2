import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';
import type { GraphData, GraphNodeData } from '../../types';

interface ProcessGraphProps {
  data: GraphData;
}

const ProcessGraph: React.FC<ProcessGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const { nodes, links } = useMemo(() => {
    if (!data || data.nodes.length === 0) {
      return { nodes: [], links: [] };
    }
    
    const nodeWidth = 220;
    const nodeHeight = 80;
    
    const hierarchy = d3.stratify<GraphNodeData>()
        .id(d => d.id)
        .parentId(d => {
            // Find an incoming edge to determine the parent
            const edge = data.edges.find(e => e.target === d.id);
            // Ensure there are no cycles by checking if the source is also a target from this node
            const isCycle = data.edges.some(e => e.source === d.id && e.target === edge?.source);
            return (edge && !isCycle) ? edge.source : null;
        })(data.nodes);

    const treeLayout = d3.tree<GraphNodeData>()
      .nodeSize([nodeWidth + 60, nodeHeight + 80])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5));
      
    const root = treeLayout(hierarchy);
    
    const d3Nodes = root.descendants();
    const d3Links = root.links();
    
    return { nodes: d3Nodes, links: d3Links };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('g.graph-content');
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Center the graph initially
    const bounds = g.node()?.getBBox();
    if (bounds) {
        const { width, height } = dimensions;
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;
        const midX = bounds.x + fullWidth / 2;
        const midY = bounds.y + fullHeight / 2;

        if (fullWidth === 0 || fullHeight === 0) return;

        const scale = 0.85 * Math.min(width / fullWidth, height / fullHeight);
        const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    }

  }, [nodes, links, dimensions]);


  if (!data || data.nodes.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No data to display.</div>;
  }
  
  return (
    <div ref={containerRef} className="w-full h-full">
        <svg ref={svgRef} className="w-full h-full rounded-lg" preserveAspectRatio="xMidYMid meet">
        <defs>
            <pattern id="bg-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" className="fill-gray-200" />
            </pattern>
            <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#000000" floodOpacity=".12"/>
            </filter>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#bg-dots)" />
        <g className="graph-content">
            {links.map((link) => (
                <GraphEdge key={`edge-${link.source.id}-${link.target.id}`} link={link} allEdges={data.edges} />
            ))}
            {nodes.map((node) => (
                <GraphNode key={node.id} node={node} />
            ))}
        </g>
        </svg>
    </div>
  );
};

export default ProcessGraph;