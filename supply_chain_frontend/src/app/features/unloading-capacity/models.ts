export type MaterialType =
  | 'sodium_sulfate'
  | 'dense_carbonate'
  | 'light_carbonate'
  | 'pasta'
  | 'hlas'
  | 'soda';
 
export interface DesignTarget {
  material: MaterialType;
  base: number;    // design base
  safety: number;  // safety stock
  total: number;   // base + safety
}
 
export interface OperationCapacity {
  operationId: string;
  name: string;
  dailyCapacity: number;
  siloCapacity: number;
  materialDemand?: number;
}
 
export interface InventoryRecord {
  operationId: string;
  material: MaterialType;
  cars: number; // #RCs currently in the operation
}
 
export interface HazardRule {
  material: MaterialType;
  unloadingCapacity: number;
  safety: number;
}
 
export interface UnloadingConfig {
  deviationThreshold: number;  // alert if |actual - design.total| > threshold
  dailyUpdateTime: string;     // e.g., '06:00'
}