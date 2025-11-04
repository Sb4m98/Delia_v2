import React from 'react';
import type * as d3 from 'd3';
import type { GraphNodeData } from '../../types';

interface GraphNodeProps {
  node: d3.HierarchyPointNode<GraphNodeData>;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

const typeColorMap = {
  mainProcess: 'fill-node-header-main',
  decision: 'fill-node-header-decision',
  beginEnd: 'fill-node-header-beginend',
  criticalNode: 'fill-node-header-critical',
};

const GraphNode: React.FC<GraphNodeProps> = ({ node }) => {
  const { x, y, data } = node;
  const headerColorClass = typeColorMap[data.type] || 'fill-gray-500';

  return (
    <g
      transform={`translate(${x - NODE_WIDTH / 2}, ${y - NODE_HEIGHT / 2})`}
      className="cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
      filter="url(#nodeShadow)"
    >
      <rect
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx="12"
        ry="12"
        className="fill-white stroke-gray-200"
      />
      <rect
        width={NODE_WIDTH}
        height="8"
        rx="12"
        ry="12"
        className={headerColorClass}
      />
       <rect
        y="8"
        width={NODE_WIDTH}
        height={NODE_HEIGHT - 8}
        className="fill-white"
        clipPath={`url(#clip-${data.id})`}
       />
      
      <clipPath id={`clip-${data.id}`}>
          <rect y="8" width={NODE_WIDTH} height={NODE_HEIGHT-8} rx="12" ry="12"/>
      </clipPath>

      <foreignObject x="10" y="18" width={NODE_WIDTH - 20} height="30">
        <div className="text-base font-bold text-gray-800 text-center flex items-center justify-center h-full leading-tight">
            {data.label}
        </div>
      </foreignObject>

       <foreignObject x="10" y="48" width={NODE_WIDTH - 20} height={NODE_HEIGHT - 52}>
        <div className="text-xs text-gray-500 text-center leading-tight h-full flex items-center justify-center">
            {data.description}
        </div>
      </foreignObject>

      <title>{`${data.label}: ${data.description}`}</title>
    </g>
  );
};

export default GraphNode;