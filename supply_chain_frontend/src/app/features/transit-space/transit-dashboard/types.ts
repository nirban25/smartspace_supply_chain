
// src/app/features/transit-space/transit-dashboard/types.ts

export type MaterialType =
  | 'Sodium sulfate'
  | 'HLAS'
  | 'Dense carbonate'
  | 'Soda'
  | 'Light carbonate'
  | 'Pasta Surflex';

export type NodeId = 'Pantaco' | 'Tacuba' | 'Vallejo';

export interface ArrivalForecast {
  id: string;
  material: MaterialType;
  inboundNode: NodeId;
  eta: string; // ISO string
}

export interface DataSourceStatus {
  ferrovalleConnected: boolean;
  lastExcelIngestAt?: string;   // ISO (shown as local date/time)
  nextScheduledRunAt?: string;  // ISO (06:00 daily)
  multiUserCredentials: boolean;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  ruleCode:
    | 'PANTACO_OVER_35'
    | 'PANTACO_PLUS_ARRIVALS_OVER_35'
    | 'TACUBA_UNDER_15'
    | 'NODE_OVER_DESIGN';
  node?: NodeId;
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  meta?: Record<string, unknown>;
}
