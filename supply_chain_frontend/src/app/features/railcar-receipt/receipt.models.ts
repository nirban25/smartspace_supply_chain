export type MaterialType =
  | 'Sodium sulfate'
  | 'HLAS'
  | 'Dense carbonate'
  | 'Soda'
  | 'Light carbonate'
  | 'Pasta Surflex';
 
export interface MaterialBreakdownItem {
  material: MaterialType | string;
  carsInPlant: number;
}
 
export interface RailcarReceiptData {
  // Elements considered (per spec)
  carsInPlantTotal: number;      // #RCs in plant (total)
  arrivalsToday: number;         // #RCs arrival (today)
  releasedToFerrovalle: number;  // #RCs released to FCC (empties)
 
  // Optional planned arrivals (for forecast alert per spec)
  plannedArrivals?: number;
 
  // Breakdown by material present at plant
  breakdownByMaterial?: MaterialBreakdownItem[];
 
  // Meta
  lastUpdatedIso?: string; // ISO date-time for the daily 6:00 am update
  dataSource?: string;     // e.g., "RECIBOS DE FFCC TRANSFER"
}
 
export const DAILY_LIMIT_TOTAL = 32; // Daily receipt limit (spec)