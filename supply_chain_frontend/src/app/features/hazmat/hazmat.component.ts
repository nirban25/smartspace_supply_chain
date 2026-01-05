
import { Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

type MaterialKey = 'HLAS' | 'PASTA_CALACA' | 'SODIUM';

interface HazmatDesign {
  material: MaterialKey;
  unloadingCapacityPerDay: number;
  safetyStockPerDay: number;
  allowIntermediateStorage: boolean;
}

interface NodePresence {
  pantaco: number;
  tacuba: number;
  vallejo: number;
}

interface HazmatStatus {
  material: MaterialKey;
  arrivalsToday: number;
  carsInCircuit: number;
  nodes: NodePresence;
  lastUpdatedIso: string;
}

type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

interface HazmatAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  ruleCode: string;
  timestampIso: string;
  acknowledged: boolean;
  material?: MaterialKey;
}

interface HazmatRow {
  material: MaterialKey;
  inTransit: number;
  pantaco: number;
  tacuba: number;
  inPlant: number;
  arrivalsToday: number;
  unloadedToday: number;
  releasedEmptyToday: number;
  designLimitText: string;
  deviation: number;
  planCompliancePct: number;
  releaseRatio: number;
  statusChip: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-hazmat',
  standalone: true,
  imports: [
    CommonModule, NgFor, NgIf,
    MatCardModule, MatIconModule, MatButtonModule,
    MatSnackBarModule, MatProgressBarModule, MatTableModule, MatChipsModule,
  ],
  templateUrl: './hazmat.component.html',
  styleUrls: ['./hazmat.component.scss'],
})
export class HazmatComponent {
  private readonly snack = inject(MatSnackBar);

  readonly materials: MaterialKey[] = ['HLAS', 'PASTA_CALACA', 'SODIUM'];

  private thresholds = new Map<MaterialKey, { unload: number; safety: number }>([
    ['HLAS', { unload: 3, safety: 3 }],
    ['PASTA_CALACA', { unload: 2, safety: 2 }],
    ['SODIUM', { unload: 10, safety: 10 }],
  ]);

  private readonly nodeDesign = { pantaco: 35, tacuba: 15, vallejo: 35 };

  dailyPlan = signal<Map<MaterialKey, number>>(new Map<MaterialKey, number>([
    ['HLAS', this.thresholds.get('HLAS')!.unload],
    ['PASTA_CALACA', this.thresholds.get('PASTA_CALACA')!.unload],
    ['SODIUM', this.thresholds.get('SODIUM')!.unload],
  ]));

  actualUnloadedToday = signal<Map<MaterialKey, number>>(new Map<MaterialKey, number>([
    ['HLAS', 4],
    ['PASTA_CALACA', 1],
    ['SODIUM', 1],
  ]));

  releasedEmptyToday = signal<Map<MaterialKey, number>>(new Map<MaterialKey, number>([
    ['HLAS', 3],
    ['PASTA_CALACA', 1],
    ['SODIUM', 1],
  ]));

  readonly designMap = computed<Map<MaterialKey, HazmatDesign>>(() => {
    const map = new Map<MaterialKey, HazmatDesign>();
    for (const m of this.materials) {
      const t = this.thresholds.get(m)!;
      map.set(m, {
        material: m,
        unloadingCapacityPerDay: t.unload,
        safetyStockPerDay: t.safety,
        allowIntermediateStorage: false,
      });
    }
    return map;
  });

  readonly statuses = signal<HazmatStatus[]>([
    { material: 'HLAS', arrivalsToday: 3, carsInCircuit: 7, nodes: { pantaco: 0, tacuba: 0, vallejo: 3 }, lastUpdatedIso: new Date().toISOString() },
    { material: 'PASTA_CALACA', arrivalsToday: 3, carsInCircuit: 5, nodes: { pantaco: 1, tacuba: 1, vallejo: 1 }, lastUpdatedIso: new Date().toISOString() },
    { material: 'SODIUM', arrivalsToday: 1, carsInCircuit: 2, nodes: { pantaco: 0, tacuba: 0, vallejo: 1 }, lastUpdatedIso: new Date().toISOString() },
  ]);

  readonly computedRows = computed<HazmatRow[]>(() => {
    const dmap = this.designMap();
    const plan = this.dailyPlan();
    const unloaded = this.actualUnloadedToday();
    const released = this.releasedEmptyToday();

    return this.statuses().map((s) => {
      const d = dmap.get(s.material)!;
      const plannedLimit = d.unloadingCapacityPerDay + d.safetyStockPerDay;
      const inTransit = Math.max(0, s.carsInCircuit - (s.nodes.pantaco + s.nodes.tacuba + s.nodes.vallejo));

      const plannedUnloads = plan.get(s.material) ?? 0;
      const actualUnloads = unloaded.get(s.material) ?? 0;
      const compliance = plannedUnloads > 0 ? Math.round((actualUnloads / plannedUnloads) * 100) : 0;

      const deviation = s.nodes.vallejo - plannedLimit;

      const releasedToday = released.get(s.material) ?? 0;
      const releaseRatio = actualUnloads > 0 ? +(releasedToday / actualUnloads).toFixed(2) : 1;

      const hasIntermediate = (s.nodes.pantaco + s.nodes.tacuba) > 0;

      const chip: 'primary' | 'accent' | 'warn' =
        hasIntermediate ? 'warn'
        : (s.arrivalsToday > plannedLimit || Math.abs(deviation) > 2 ? 'accent' : 'primary');

      return {
        material: s.material,
        inTransit,
        pantaco: s.nodes.pantaco,
        tacuba: s.nodes.tacuba,
        inPlant: s.nodes.vallejo,
        arrivalsToday: s.arrivalsToday,
        unloadedToday: actualUnloads,
        releasedEmptyToday: releasedToday,
        designLimitText: `${plannedLimit} (${d.unloadingCapacityPerDay}+${d.safetyStockPerDay})`,
        deviation,
        planCompliancePct: compliance,
        releaseRatio,
        statusChip: chip,
      };
    });
  });

  readonly nodeOccupancy = computed(() => {
    const presence = { pantaco: 0, tacuba: 0, vallejo: 0 };
    for (const s of this.statuses()) {
      presence.pantaco += s.nodes.pantaco;
      presence.tacuba += s.nodes.tacuba;
      presence.vallejo += s.nodes.vallejo;
    }
    return { occupancy: presence, design: { ...this.nodeDesign } };
  });

  private calcNodeOccupancy() {
    const presence = { pantaco: 0, tacuba: 0, vallejo: 0 };
    for (const s of this.statuses()) {
      presence.pantaco += s.nodes.pantaco;
      presence.tacuba += s.nodes.tacuba;
      presence.vallejo += s.nodes.vallejo;
    }
    return { occupancy: presence, design: { ...this.nodeDesign } };
  }

  readonly acknowledgedAlertIds = signal<Set<string>>(new Set());

  readonly alerts = computed<HazmatAlert[]>(() => {
    const rows = this.computedRows();
    const items: HazmatAlert[] = [];

    for (const r of rows) {
      if (r.pantaco + r.tacuba > 0) {
        items.push({
          id: `AL_${r.material}_INTERMEDIATE`,
          severity: 'CRITICAL',
          message: `${this.label(r.material)}: intermediate yard presence detected (Pantaco/Tacuba). Direct delivery required.`,
          ruleCode: 'HAZ_NO_INTERMEDIATE',
          timestampIso: new Date().toISOString(),
          acknowledged: false,
          material: r.material,
        });
      }
      const [unload, safety] = this.designPair(r.material);
      if ((unload + safety) <= 0) {
        items.push({
          id: `AL_${r.material}_DESIGN_NOT_SET`,
          severity: 'INFO',
          message: `${this.label(r.material)} design limit isn't configured—set unloading capacity + safety stock.`,
          ruleCode: 'HAZ_DESIGN_LIMIT',
          timestampIso: new Date().toISOString(),
          acknowledged: false,
          material: r.material,
        });
      }
      if (r.planCompliancePct < 90) {
        items.push({
          id: `AL_${r.material}_PLAN_COMPLIANCE_LT_90`,
          severity: 'WARNING',
          message: `${this.label(r.material)} unloading plan compliance is ${r.planCompliancePct}% (< 90%).`,
          ruleCode: 'PLAN_COMPLIANCE_LT_90',
          timestampIso: new Date().toISOString(),
          acknowledged: false,
          material: r.material,
        });
      }
      if (Math.abs(r.deviation) > 2) {
        items.push({
          id: `AL_${r.material}_DESIGN_DEV_GT_2`,
          severity: 'WARNING',
          message: `${this.label(r.material)} inventory deviation is ${r.deviation} (> |±2|).`,
          ruleCode: 'DESIGN_DEVIATION_GT_2',
          timestampIso: new Date().toISOString(),
          acknowledged: false,
          material: r.material,
        });
      }
      if (r.releaseRatio < 1) {
        items.push({
          id: `AL_${r.material}_RELEASE_RATIO_LT_1`,
          severity: 'CRITICAL',
          message: `Empty-car release mismatch: released (${r.releasedEmptyToday}) < unloaded (${r.unloadedToday}). Target 1:1.`,
          ruleCode: 'EMPTY_RELEASE_LT_UNLOADED',
          timestampIso: new Date().toISOString(),
          acknowledged: false,
          material: r.material,
        });
      }
    }

    const totals = this.topStripTotals();
    if (totals.inPlant > 32) {
      items.push({
        id: `AL_PLANT_GT_32`,
        severity: 'WARNING',
        message: `Plant inventory exceeds limit: ${totals.inPlant} (> 32).`,
        ruleCode: 'PLANT_INV_GT_32',
        timestampIso: new Date().toISOString(),
        acknowledged: false,
      });
    }
    if (totals.calculated > 32) {
      items.push({
        id: `AL_DAILY_RECEIPT_CALC_GT_32`,
        severity: 'WARNING',
        message: `Daily receipt calc — InPlant (${totals.inPlant}) + Arrivals (${totals.arrivals}) - Released (${totals.released}) = ${totals.calculated} (> 32).`,
        ruleCode: 'DAILY_RECEIPT_GT_32',
        timestampIso: new Date().toISOString(),
        acknowledged: false,
      });
    }

    const occ = this.calcNodeOccupancy();
    if (occ.occupancy.pantaco > occ.design.pantaco) {
      items.push({
        id: `AL_PANTACO_GT_DESIGN`,
        severity: 'WARNING',
        message: `Pantaco occupancy ${occ.occupancy.pantaco} > design ${occ.design.pantaco}.`,
        ruleCode: 'PANTACO_SPACE_GT_DESIGN',
        timestampIso: new Date().toISOString(),
        acknowledged: false,
      });
    }
    if (occ.occupancy.tacuba > occ.design.tacuba) {
      items.push({
        id: `AL_TACUBA_GT_DESIGN`,
        severity: 'WARNING',
        message: `Tacuba occupancy ${occ.occupancy.tacuba} > design ${occ.design.tacuba}.`,
        ruleCode: 'TACUBA_SPACE_GT_DESIGN',
        timestampIso: new Date().toISOString(),
        acknowledged: false,
      });
    }
    if (occ.occupancy.vallejo > occ.design.vallejo) {
      items.push({
        id: `AL_VALLEJO_GT_DESIGN`,
        severity: 'WARNING',
        message: `Vallejo occupancy ${occ.occupancy.vallejo} > design ${occ.design.vallejo}.`,
        ruleCode: 'VALLEJO_SPACE_GT_DESIGN',
        timestampIso: new Date().toISOString(),
        acknowledged: false,
      });
    }

    const ack = this.acknowledgedAlertIds();
    return items.filter(a => !ack.has(a.id));
  });

  readonly hasAlerts = computed(() => this.alerts().length > 0);

  readonly anyCritical = computed(() =>
    this.alerts().some(a => a.severity === 'CRITICAL')
  );

  private lastCriticalState = this.anyCritical();
  constructor() {
    effect(() => {
      const current = this.anyCritical();
      if (current !== this.lastCriticalState) {
        this.lastCriticalState = current;
        this.snack.open(
          current
            ? 'Violations detected: review hazardous material rules.'
            : 'All hazardous materials within design constraints.',
          'Close',
          { duration: 2500 }
        );
      }
    });
  }

  readonly loading = signal(false);

  refresh() {
    this.loading.set(true);
    const fresh = this.statuses().map(s => ({ ...s, lastUpdatedIso: new Date().toISOString() }));
    this.statuses.set(fresh);
    setTimeout(() => {
      this.loading.set(false);
      this.snack.open('Hazardous materials refreshed', 'Close', { duration: 2000 });
    }, 250);
  }

  acknowledgeAlerts(alertId?: string) {
    const setCopy = new Set(this.acknowledgedAlertIds());
    if (alertId) {
      setCopy.add(alertId);
    } else {
      for (const a of this.alerts()) setCopy.add(a.id);
    }
    this.acknowledgedAlertIds.set(setCopy);

    this.snack.open('Alerts acknowledged', 'Close', {
      duration: 10000,
      panelClass: ['custom-snackbar']
    });
  }

  topStripTotals() {
    const rows = this.computedRows();
    const inPlant = rows.reduce((sum, r) => sum + r.inPlant, 0);
    const inTransit = rows.reduce((sum, r) => sum + r.inTransit, 0);
    const arrivals = rows.reduce((sum, r) => sum + r.arrivalsToday, 0);
    const released = rows.reduce((sum, r) => sum + r.releasedEmptyToday, 0);
    const calculated = inPlant + arrivals - released;
    return { inPlant, inTransit, arrivals, released, calculated };
  }

  label(m: MaterialKey) {
    switch (m) {
      case 'HLAS': return 'HLAS';
      case 'PASTA_CALACA': return 'Pasta Calaca';
      case 'SODIUM': return 'Sodium';
    }
  }

  private designPair(m: MaterialKey): [number, number] {
    const t = this.thresholds.get(m)!;
    return [t.unload, t.safety];
  }

  readonly displayedColumns = [
    'material', 'inTransit', 'pantaco', 'tacuba', 'inPlant',
    'arrivalsToday', 'unloadedToday', 'releasedEmptyToday',
    'designLimitText', 'deviation', 'planCompliancePct', 'releaseRatio'
  ];

  chipClass(row: HazmatRow): 'warn' | 'accent' | 'primary' {
    if (row.statusChip === 'warn') return 'warn';
    if (row.statusChip === 'accent') return 'accent';
    return 'primary';
  }
}
