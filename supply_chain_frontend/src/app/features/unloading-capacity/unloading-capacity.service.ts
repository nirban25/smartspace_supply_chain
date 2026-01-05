// src/app/features/unloading-capacity/unloading-capacity.service.ts
import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import {
  DesignTarget,
  OperationCapacity,
  InventoryRecord,
  HazardRule,
  UnloadingConfig
} from './models';
 
@Injectable({ providedIn: 'root' })
export class UnloadingCapacityService {
  // Embedded config (no assets)
  private readonly CONFIG: UnloadingConfig = {
    deviationThreshold: 2,
    dailyUpdateTime: '06:00'
  };
 
  // Embedded design totals (base + safety = total)
  private readonly DESIGN: DesignTarget[] = [
    { material: 'sodium_sulfate',  base: 10, safety: 10, total: 20 },
    { material: 'dense_carbonate', base:  2, safety:  2, total:  4 },
    { material: 'light_carbonate', base:  1, safety:  1, total:  2 },
    { material: 'pasta',           base:  2, safety:  2, total:  4 },
    { material: 'hlas',            base:  3, safety:  3, total:  6 },
    { material: 'soda',            base:  4, safety:  4, total:  8 }
  ];
 
  // Embedded hazard rules
  private readonly HAZARD: HazardRule[] = [
    { material: 'hlas',  unloadingCapacity: 3, safety: 3 },
    { material: 'pasta', unloadingCapacity: 2, safety: 2 }
  ];
 
  // Embedded operations (so each card renders for all operations)
  private readonly OPS: OperationCapacity[] = [
    { operationId: 'opA', name: 'Operation A', dailyCapacity: 12, siloCapacity: 15, materialDemand: 10 },
    { operationId: 'opB', name: 'Operation B', dailyCapacity: 10, siloCapacity: 12, materialDemand:  8 },
    { operationId: 'opC', name: 'Operation C', dailyCapacity:  8, siloCapacity: 10, materialDemand:  6 }
  ];
 
  // Embedded inventory (spread across ops & materials)
  private readonly INV: InventoryRecord[] = [
    { operationId: 'opA', material: 'sodium_sulfate', cars: 6 },
    { operationId: 'opB', material: 'sodium_sulfate', cars: 7 },
    { operationId: 'opC', material: 'sodium_sulfate', cars: 3 },
 
    { operationId: 'opA', material: 'hlas', cars: 2 },
    { operationId: 'opB', material: 'hlas', cars: 4 },
 
    { operationId: 'opA', material: 'soda', cars: 3 },
    { operationId: 'opC', material: 'soda', cars: 2 },
 
    { operationId: 'opB', material: 'pasta', cars: 1 },
 
    { operationId: 'opC', material: 'dense_carbonate', cars: 1 },
    { operationId: 'opA', material: 'light_carbonate', cars: 1 }
  ];
 
  // API (Observables) — no HTTP, no assets
  loadConfig(): Observable<UnloadingConfig>        { return of(this.CONFIG); }
  loadDesignTargets(): Observable<DesignTarget[]>  { return of(this.DESIGN); }
  loadHazardRules(): Observable<HazardRule[]>      { return of(this.HAZARD); }
  loadOperations(): Observable<OperationCapacity[]> { return of(this.OPS); }
  loadInventory(): Observable<InventoryRecord[]>   { return of(this.INV); }
}