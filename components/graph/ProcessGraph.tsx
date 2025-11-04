import React, { useMemo, useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import * as d3 from 'd3';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';
import type { GraphData, GraphNodeData } from '../../types';

interface ProcessGraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNodeData) => void;
}

export interface ProcessGraphRef {
  zoomIn: () => void;
  zoomOut: () => void;
  centerGraph: () => void;
  exportToSvg: () => string;
}

const ProcessGraph = forwardRef<ProcessGraphRef, ProcessGraphProps>(({ data, onNodeClick }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();
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
    
    const nodeMap = new Map(data.nodes.map(n => [n.id, n]));
    const validEdges = data.edges.filter(e => nodeMap.has(e.source) && nodeMap.has(e.target));

    const hierarchy = d3.stratify<GraphNodeData>()
        .id(d => d.id)
        .parentId(d => {
            const edge = validEdges.find(e => e.target === d.id);
            return edge ? edge.source : null;
        })(data.nodes);

    const treeLayout = d3.tree<GraphNodeData>()
      .nodeSize([nodeWidth + 60, nodeHeight + 80])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5));
      
    const root = treeLayout(hierarchy);
    
    return { nodes: root.descendants(), links: root.links() };
  }, [data]);

  const centerGraph = useCallback(() => {
      if (!svgRef.current || !containerRef.current || nodes.length === 0 || !zoomRef.current) return;

      const svg = d3.select(svgRef.current);
      const g = svg.select<SVGGElement>('g.graph-content');
      const zoom = zoomRef.current;
      
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
  }, [nodes, dimensions]);


  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('g.graph-content');
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);
    zoomRef.current = zoom;
    
    if (nodes.length > 0) {
        centerGraph();
    }

  }, [nodes, links, dimensions, centerGraph]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (svgRef.current && zoomRef.current) {
        d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 1.2);
      }
    },
    zoomOut: () => {
      if (svgRef.current && zoomRef.current) {
        d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 0.8);
      }
    },
    centerGraph: () => {
      centerGraph();
    },
    exportToSvg: () => {
      if (!svgRef.current) return '';
      const svgNode = svgRef.current.cloneNode(true) as SVGSVGElement;
      
      const style = document.createElement('style');
      style.textContent = `
          .fill-node-header-main { fill: #4361ee; }
          .fill-node-header-decision { fill: #ffb703; }
          .fill-node-header-beginend { fill: #4cc9f0; }
          .fill-node-header-critical { fill: #f72585; }
          .fill-white { fill: white; }
          .stroke-gray-200 { stroke: #e5e7eb; }
          .text-base { font-size: 1rem; }
          .font-bold { font-weight: 700; }
          .text-gray-800 { fill: #1f2937; }
          .text-center { text-anchor: middle; }
          .text-xs { font-size: 0.75rem; }
          .text-gray-500 { fill: #6b7280; }
          .leading-tight { line-height: 1.25; }
          .stroke-gray-300 { stroke: #d1d5db; }
          .fill-none { fill: none; }
          .font-semibold { font-weight: 600; }
          .fill-gray-600 { fill: #4b5563; }
          .fill-gray-400 { fill: #9ca3af; }
          .fill-gray-200 { fill: #e5e7eb; }
      `;
      const defs = svgNode.querySelector('defs');
      if (defs) {
        defs.appendChild(style);
      }
      
      const serializer = new XMLSerializer();
      return serializer.serializeToString(svgNode);
    }
  }));

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
                <GraphNode key={node.id} node={node} onNodeClick={onNodeClick} />
            ))}
        </g>
        </svg>
    </div>
  );
});

export default ProcessGraph;