import type { MapNode, NodeType } from '../types';

const ROW_COUNT = 15;

function pickNodeType(row: number, totalRows: number): NodeType {
  if (row === 0) return 'combat';
  if (row === totalRows - 1) return 'boss';
  if (row === totalRows - 2) return 'rest';

  const roll = Math.random();
  if (row % 4 === 3) {
    // Rest/shop row
    return roll < 0.5 ? 'rest' : 'shop';
  }
  if (roll < 0.45) return 'combat';
  if (roll < 0.60) return 'event';
  if (roll < 0.70) return 'elite';
  if (roll < 0.80) return 'shop';
  if (roll < 0.88) return 'rest';
  return 'treasure';
}

export function generateMap(): MapNode[] {
  const nodes: MapNode[] = [];
  const colsPerRow = 3;

  // Generate node positions
  for (let row = 0; row < ROW_COUNT; row++) {
    const cols = row === ROW_COUNT - 1 ? 1 : colsPerRow;
    for (let col = 0; col < cols; col++) {
      const xSpacing = row === ROW_COUNT - 1 ? 0 : (col - (cols - 1) / 2) * 120;
      nodes.push({
        id: `node_${row}_${col}`,
        type: pickNodeType(row, ROW_COUNT),
        x: 200 + xSpacing + (Math.random() - 0.5) * 20,
        y: 30 + row * 52,
        connections: [],
        visited: false,
        available: row === 0,
        row,
        col,
      });
    }
  }

  // Generate connections: each node connects forward to 1-2 nodes in the next row
  for (let row = 0; row < ROW_COUNT - 1; row++) {
    const currentRowNodes = nodes.filter(n => n.row === row);
    const nextRowNodes = nodes.filter(n => n.row === row + 1);

    currentRowNodes.forEach(node => {
      // Connect to 1-2 nodes in next row, prefer nearby columns
      const numConnections = Math.random() < 0.4 ? 2 : 1;
      const closestIdx = Math.min(node.col, nextRowNodes.length - 1);
      const targets = new Set<number>([closestIdx]);
      while (targets.size < Math.min(numConnections, nextRowNodes.length)) {
        targets.add(Math.floor(Math.random() * nextRowNodes.length));
      }
      targets.forEach(idx => {
        node.connections.push(nextRowNodes[idx].id);
      });
    });

    // Ensure every node in next row is reachable
    const reachable = new Set(currentRowNodes.flatMap(n => n.connections));
    nextRowNodes.forEach(n => {
      if (!reachable.has(n.id)) {
        const from = currentRowNodes[Math.floor(Math.random() * currentRowNodes.length)];
        from.connections.push(n.id);
      }
    });
  }

  return nodes;
}

export function getAvailableNodes(nodes: MapNode[], currentNodeId: string | null): MapNode[] {
  if (!currentNodeId) {
    return nodes.filter(n => n.row === 0);
  }
  const current = nodes.find(n => n.id === currentNodeId);
  if (!current) return [];
  return nodes.filter(n => current.connections.includes(n.id));
}

export function markNodeVisited(nodes: MapNode[], nodeId: string): MapNode[] {
  const updated = nodes.map(n => ({ ...n }));
  const node = updated.find(n => n.id === nodeId);
  if (node) node.visited = true;

  // Update available based on the newly visited node's connections
  const availableIds = new Set<string>();
  const visitedNodes = updated.filter(n => n.visited);
  visitedNodes.forEach(n => n.connections.forEach(id => availableIds.add(id)));
  updated.forEach(n => {
    if (!n.visited) {
      n.available = availableIds.has(n.id);
    }
  });
  return updated;
}
