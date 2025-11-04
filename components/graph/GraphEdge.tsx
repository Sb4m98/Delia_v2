import React from 'react';
import * as d3 from 'd3';
import type { GraphNodeData, GraphEdge as GraphEdgeType } from '../../types';

interface GraphEdgeProps {
  link: d3.HierarchyPointLink<GraphNodeData>;
  allEdges: GraphEdgeType[];
}

const GraphEdge: React.FC<GraphEdgeProps> = ({ link, allEdges }) => {
  const linkGenerator = d3.linkVertical<d3.HierarchyPointLink<GraphNodeData>, d3.HierarchyPointNode<GraphNodeData>>()
    .x(d => d.x)
    .y(d => d.y);

  const pathData = linkGenerator(link);
  
  const midX = (link.source.x + link.target.x) / 2;
  const midY = (link.source.y + link.target.y) / 2;
  
  const originalEdge = allEdges.find(
    edge => edge.source === link.source.data.id && edge.target === link.target.data.id
  );
  const label = originalEdge?.label;

  return (
    <g className="edge-group">
      <path
        d={pathData || ''}
        className="stroke-gray-300 fill-none"
        strokeWidth="2"
        markerEnd="url(#arrow)"
      />
       {label && (
         <g transform={`translate(${midX}, ${midY})`}>
          <rect 
            x={-35}
            y={-12}
            width={70}
            height={24}
            rx="8" 
            className="fill-white" 
          />
          <text
            textAnchor="middle"
            alignmentBaseline="middle"
            className="text-xs font-semibold fill-gray-600"
          >
            {label}
          </text>
         </g>
      )}
      <defs>
        <marker
          id="arrow"
          viewBox="0 -5 10 10"
          refX="10"
          refY="0"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,-5L10,0L0,5" className="fill-gray-400" />
        </marker>
      </defs>
    </g>
  );
};

export default GraphEdge;
