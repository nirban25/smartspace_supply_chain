
// src/app/features/transit-space/transit-dashboard/constants.ts
import { MaterialType, NodeId } from './types';

export const MATERIALS: Array<MaterialType | 'All'> = [
  'All',
  'Sodium sulfate',
  'HLAS',
  'Dense carbonate',
  'Soda',
  'Light carbonate',
  'Pasta Surflex',
];

export const NODES: Array<NodeId | 'All'> = ['All', 'Pantaco', 'Tacuba', 'Vallejo'];
