import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
 
import { UnloadingCapacityService } from './unloading-capacity.service';
import {
  DesignTarget,
  OperationCapacity,
  InventoryRecord,
  HazardRule,
  MaterialType
} from './models';
 
interface MaterialRow {
  material: MaterialType;
  designTotal: number;
  actualTotal: number;
  deviation: number;  // actual - design
  alert: boolean;     // |deviation| > threshold
}
 
@Component({
  selector: 'app-unloading-capacity',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unloading-capacity.component.html',
  styleUrls: ['./unloading-capacity.component.scss']
})
export class UnloadingCapacityComponent {
  // ---------- Data state ----------
  designTargets = signal<DesignTarget[]>([]);
  hazardRules   = signal<HazardRule[]>([]);
  config        = signal<{ deviationThreshold: number; dailyUpdateTime: string }>({
    deviationThreshold: 2,
    dailyUpdateTime: '06:00'
  });
  operations    = signal<OperationCapacity[]>([]);
  inventory     = signal<InventoryRecord[]>([]);
  lastUpdated   = signal<Date | null>(null);
 
  // Hazard materials (typed) for template loop
  hazardMaterials: MaterialType[] = ['hlas', 'pasta'];
 
  // ---------- Plan form ----------
  planForm: FormGroup;
  private planTotalSig = signal<number>(0);
  planTotal = computed(() => this.planTotalSig());
 
  // ---------- Form-to-signals bridge for computed updates ----------
  // AOT-friendly "tick" signal — we bump it on every form change so computeds re-run
  private planTick = signal(0);
 
  // ---------- Review (deviations) modal state ----------
  reviewOpen = signal<boolean>(false);
  openReview()  { this.reviewOpen.set(true); }
  closeReview() { this.reviewOpen.set(false); }
  toggleReview(){ this.reviewOpen.set(!this.reviewOpen()); }
 
  // ---------- Derived: Design vs Actual rows ----------
  materialRows = computed<MaterialRow[]>(() => {
    const targets = this.designTargets();
    const threshold = this.config().deviationThreshold;
 
    const actualByMaterial = new Map<MaterialType, number>();
    for (const rec of this.inventory()) {
      actualByMaterial.set(rec.material, (actualByMaterial.get(rec.material) || 0) + rec.cars);
    }
 
    return targets.map(t => {
      const actual = actualByMaterial.get(t.material) || 0;
      const deviation = actual - t.total;
      return {
        material: t.material,
        designTotal: t.total,
        actualTotal: actual,
        deviation,
        alert: Math.abs(deviation) > threshold
      };
    });
  });
 
  // ---------- Derived: per-operation summary & validations ----------
  opSummary = computed(() => {
    // Make this computed reactive to form changes
    const _ = this.planTick(); // value unused; dependency only
 
    const ops = this.operations();
    const plan = this.planForm?.value || {};
    const res: Array<{
      op: OperationCapacity;
      totalPlanned: number;
      capacityOk: boolean;
      siloOk: boolean;
    }> = [];
 
    for (const op of ops) {
      let total = 0;
      for (const key of Object.keys(plan)) {
        const [prefix, opId] = key.split('__');
        if (prefix === 'planned' && opId === op.operationId) {
          total += Number(plan[key] || 0);
        }
      }
      res.push({
        op,
        totalPlanned: total,
        capacityOk: total <= op.dailyCapacity,
        siloOk: total <= op.siloCapacity
      });
    }
    return res;
  });
 
  // ---------- Banner counters ----------
  alertCount          = computed(() => this.materialRows().filter(r => r.alert).length);
  opsExceededCapacity = computed(() => this.opSummary().filter(s => !s.capacityOk).length);
  opsExceededSilo     = computed(() => this.opSummary().filter(s => !s.siloOk).length);
 
  // ---------- Deviations for the Review modal ----------
  deviatedMaterials = computed(() =>
    this.materialRows().filter(r => r.alert).map(r => ({
      materialLabel: this.materialLabel(r.material),
      designTotal: r.designTotal,
      actualTotal: r.actualTotal,
      deviation: r.deviation
    }))
  );
 
  opsOverDaily = computed(() =>
    this.opSummary().filter(s => !s.capacityOk).map(s => ({
      operation: s.op.name,
      totalPlanned: s.totalPlanned,
      dailyCapacity: s.op.dailyCapacity,
      exceedBy: s.totalPlanned - s.op.dailyCapacity
    }))
  );
 
  opsOverSilo = computed(() =>
    this.opSummary().filter(s => !s.siloOk).map(s => ({
      operation: s.op.name,
      totalPlanned: s.totalPlanned,
      siloCapacity: s.op.siloCapacity,
      exceedBy: s.totalPlanned - s.op.siloCapacity
    }))
  );
 
  // ---------- Hazard (informational) ----------
  hazardView = computed(() => {
    const rules = this.hazardRules();
    const targets = this.designTargets();
    const map: Record<string, { capacity: number; safety: number; designTotal: number }> = {};
    for (const r of rules) {
      const target = targets.find(t => t.material === r.material);
      map[r.material] = {
        capacity: r.unloadingCapacity,
        safety: r.safety,
        designTotal: target?.total ?? r.unloadingCapacity + r.safety
      };
    }
    return map;
  });
 
  constructor(private fb: FormBuilder, private svc: UnloadingCapacityService) {
    this.planForm = this.fb.group({});
    this.bootstrap();
  }
 
  private bootstrap() {
    // Load everything; build form AFTER design + ops arrive
    forkJoin({
      design: this.svc.loadDesignTargets(),
      hazards: this.svc.loadHazardRules(),
      config: this.svc.loadConfig(),
      ops: this.svc.loadOperations(),
      inventory: this.svc.loadInventory()
    }).subscribe(({ design, hazards, config, ops, inventory }) => {
      this.designTargets.set(design);
      this.hazardRules.set(hazards);
      this.config.set(config);
      this.operations.set(ops);
      this.inventory.set(inventory);
 
      // Build form for ALL operations × ALL materials
      const group: Record<string, any> = {};
      for (const op of ops) {
        for (const t of design) {
          const key = `planned__${op.operationId}__${t.material}`;
          group[key] = [0];
        }
      }
      this.planForm = this.fb.group(group);
 
      // Track plan total live and make computeds reactive via planTick
      this.recomputePlanTotal();
      this.planForm.valueChanges.subscribe(() => {
        this.recomputePlanTotal();
        this.planTick.set(this.planTick() + 1); // <-- force opSummary to re-run
      });
 
      this.lastUpdated.set(new Date());
    });
  }
 
  private recomputePlanTotal() {
    const plan = this.planForm?.value || {};
    let total = 0;
    for (const key of Object.keys(plan)) {
      total += Number(plan[key] || 0);
    }
    this.planTotalSig.set(total);
  }
 
  materialLabel(m: MaterialType): string {
    switch (m) {
      case 'sodium_sulfate':  return 'Sodium sulfate';
      case 'dense_carbonate': return 'Dense carbonate';
      case 'light_carbonate': return 'Light carbonate';
      case 'pasta':           return 'Pasta';
      case 'hlas':            return 'HLAS';
      case 'soda':            return 'Soda';
    }
  }
 
  /* =========================================================
     Plan actions & helpers (make operations "do something")
     ========================================================= */
 
  /** Compute shortages per material: max(DesignTotal - ActualTotal, 0) */
  private getMaterialShortages(): Map<MaterialType, number> {
    const shortages = new Map<MaterialType, number>();
    const byMatActual = new Map<MaterialType, number>();
    for (const rec of this.inventory()) {
      byMatActual.set(rec.material, (byMatActual.get(rec.material) || 0) + rec.cars);
    }
    for (const t of this.designTargets()) {
      const actual = byMatActual.get(t.material) || 0;
      const short = Math.max(t.total - actual, 0);
      shortages.set(t.material, short);
    }
    return shortages;
  }
 
  /** Auto-fill plan to meet Design shortages, respecting op daily + silo capacity */
  public autoPlanToShortage() {
    if (!this.planForm) return;
 
    // Reset existing plan first (set to true if you want a clear recompute now)
    this.clearPlan(false);
 
    const shortages = this.getMaterialShortages();
 
    // Remaining capacity per op = min(dailyCapacity, siloCapacity)
    const remainingCap = new Map<string, number>();
    for (const op of this.operations()) {
      remainingCap.set(op.operationId, Math.min(op.dailyCapacity, op.siloCapacity));
    }
 
    // Distribute shortages material-by-material across ops greedily
    for (const t of this.designTargets()) {
      let need = shortages.get(t.material) || 0;
      if (need <= 0) continue;
 
      for (const op of this.operations()) {
        const capLeft = remainingCap.get(op.operationId) || 0;
        if (capLeft <= 0) continue;
 
        const key = `planned__${op.operationId}__${t.material}`;
        const alloc = Math.min(need, capLeft);
 
        // Write to form control
        const curr = Number(this.planForm.get(key)?.value || 0);
        this.planForm.get(key)?.setValue(curr + alloc);
 
        // Update trackers
        remainingCap.set(op.operationId, capLeft - alloc);
        need -= alloc;
 
        if (need <= 0) break;
      }
      // If need > 0 here, there wasn't enough global capacity — unplanned shortage remains
    }
 
    // Recompute after allocation and tick
    this.recomputePlanTotal();
    this.planTick.set(this.planTick() + 1);
  }
 
  /** Clear all plan inputs */
  public clearPlan(recompute = true) {
    if (!this.planForm) return;
    const group = this.planForm.controls;
    for (const name of Object.keys(group)) {
      this.planForm.get(name)?.setValue(0);
    }
    if (recompute) {
      this.recomputePlanTotal();
      this.planTick.set(this.planTick() + 1);
    }
  }
 
  /** Quick ± on a single op/material cell */
  public bumpPlan(opId: string, material: MaterialType, delta: number) {
    const key = `planned__${opId}__${material}`;
    const ctrl = this.planForm.get(key);
    if (!ctrl) return;
    const curr = Number(ctrl.value || 0);
    const next = Math.max(curr + delta, 0);
    ctrl.setValue(next);
    this.recomputePlanTotal();
    this.planTick.set(this.planTick() + 1);
  }
 
  /** OPTIONAL: Demo an overbook to show breaches in review */
  public overbookDemo() {
    const ops = this.operations();
    const mats = this.designTargets();
    if (ops.length === 0 || mats.length === 0) return;
 
    const op = ops[0];               // first op
    const mat = mats[0].material;    // first material
    const key = `planned__${op.operationId}__${mat}`;
    const ctrl = this.planForm.get(key);
    if (!ctrl) return;
    const curr = Number(ctrl.value || 0);
    ctrl.setValue(curr + 5); // add 5 RCs to exceed capacity in most cases
    this.recomputePlanTotal();
    this.planTick.set(this.planTick() + 1);
  }
 
  // ---- Export buttons (top-right) ----
  public exportJSON() {
    const payload = {
      timestamp: new Date().toISOString(),
      config: this.config(),
      designTargets: this.designTargets(),
      inventory: this.inventory(),
      materialRows: this.materialRows(),
      planTotal: this.planTotal(),
      plan: this.buildPlanArray(),
      operations: this.operations(),
      opSummary: this.opSummary(),
      hazardRules: this.hazardRules(),
      hazardView: this.hazardView()
    };
    this.download(`unloading-capacity-${this.dateStamp()}.json`, JSON.stringify(payload, null, 2), 'application/json');
  }
 
  public exportTXT() {
    const lines: string[] = [];
    lines.push(`Unloading Capacity Export (${this.dateStamp()})`);
    lines.push(`Update time: ${this.config().dailyUpdateTime}`);
    lines.push(`Total Planned RCs: ${this.planTotal()}`);
    lines.push(`Deviation alerts: ${this.alertCount()}`);
    lines.push(`Ops > Daily cap: ${this.opsExceededCapacity()}`);
    lines.push(`Ops > Silo cap: ${this.opsExceededSilo()}`);
    lines.push('');
    lines.push('--- Design vs Actual (by material) ---');
    for (const r of this.materialRows()) {
      lines.push(`${this.materialLabel(r.material)} | design=${r.designTotal} actual=${r.actualTotal} dev=${r.deviation} ${r.alert ? 'ALERT' : 'OK'}`);
    }
    lines.push('');
    lines.push('--- Plan (per operation) ---');
    for (const p of this.buildPlanArray()) {
      lines.push(`${p.operationId} | ${this.materialLabel(p.material)} planned=${p.plannedUnload}`);
    }
    lines.push('');
    lines.push('--- Hazard Rules ---');
    for (const m of this.hazardMaterials) {
      const hv = this.hazardView()[m];
      lines.push(`${this.materialLabel(m)} | capacity=${hv?.capacity ?? '-'} safety=${hv?.safety ?? '-'} designTotal=${hv?.designTotal ?? '-'}`);
    }
    this.download(`unloading-capacity-${this.dateStamp()}.txt`, lines.join('\n'), 'text/plain');
  }
 
  // ---- Deviations modal exports ----
  public exportReviewJSON() {
    const payload = {
      timestamp: new Date().toISOString(),
      deviationThreshold: this.config().deviationThreshold,
      deviatedMaterials: this.deviatedMaterials(),
      operationsOverDailyCapacity: this.opsOverDaily(),
      operationsOverSiloCapacity: this.opsOverSilo()
    };
    this.download(`deviations-${this.dateStamp()}.json`, JSON.stringify(payload, null, 2), 'application/json');
  }
 
  public exportReviewTXT() {
    const lines: string[] = [];
    lines.push(`Deviations Review (${this.dateStamp()})`);
    lines.push(`Threshold: ±${this.config().deviationThreshold} railcars`);
    lines.push('');
    lines.push('--- Material deviations ---');
    for (const r of this.deviatedMaterials()) {
      lines.push(`${r.materialLabel} | design=${r.designTotal} actual=${r.actualTotal} dev=${r.deviation}`);
    }
    lines.push('');
    lines.push('--- Operations over daily capacity ---');
    for (const s of this.opsOverDaily()) {
      lines.push(`${s.operation} | planned=${s.totalPlanned} dailyCap=${s.dailyCapacity} exceedBy=${s.exceedBy}`);
    }
    lines.push('');
    lines.push('--- Operations over silo capacity ---');
    for (const s of this.opsOverSilo()) {
      lines.push(`${s.operation} | planned=${s.totalPlanned} siloCap=${s.siloCapacity} exceedBy=${s.exceedBy}`);
    }
    this.download(`deviations-${this.dateStamp()}.txt`, lines.join('\n'), 'text/plain');
  }
 
  // ---------- helpers ----------
  private buildPlanArray(): Array<{ operationId: string; material: MaterialType; plannedUnload: number }> {
    const out: Array<{ operationId: string; material: MaterialType; plannedUnload: number }> = [];
    const plan = this.planForm?.value || {};
    for (const op of this.operations()) {
      for (const t of this.designTargets()) {
        const key = `planned__${op.operationId}__${t.material}`;
        out.push({ operationId: op.operationId, material: t.material, plannedUnload: Number(plan[key] || 0) });
      }
    }
    return out;
  }
 
  private download(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
 
  private dateStamp() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  }
}