
// src/app/features/empty-car/empty-car.types.ts

export interface EmptyCarReleaseMetrics {
  unloadedCars: number;     // #RCs Unloaded (from Unload Plan Excel)
  releasedCars: number;     // #RCs Released to FFCC (from Release Email / FV portal)
  lastUpdatedISO: string;   // Last sync timestamp (target daily 06:00 local)
  sources: {
    unloadPlanExcel?: string; // Path/ID of Unload Plan Excel
    releaseEmail?: string;    // Path/ID of Release Email
    fvPortal?: string;        // FV portal URL (Sistemas de Gestión y Liberaciones)
  };
  owner?: string;             // Decision owner in your doc
}

export interface AlertItem {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestampISO: string;
}

export interface ActivityEvent {
  id: string;
  user: string;              // e.g., "Inti Alekhya"
  action: string;            // e.g., "Drafted release for RC12345, RC67890"
  timestampISO: string;
}

export interface ReleaseDraft {
  carIds: string[];
  notes?: string;
}
