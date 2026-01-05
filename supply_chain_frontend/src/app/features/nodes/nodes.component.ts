
import { CommonModule } from '@angular/common';
import { Component, Input, Signal, computed, effect, signal } from '@angular/core';

type Material =
  | 'sodiumSulfate'
  | 'HLAS'
  | 'denseCarbonate'
  | 'soda'
  | 'lightCarbonate'
  | 'pastaSurflex';

type HazardMaterial = 'sodium' | 'pastaCalaca' | 'HLAS';

export interface UnloadingPlan {
  plannedRCs: number;     // # RCs planned to unload to operations
  unloadedRCs: number;    // # RCs unloaded by operations
}

export interface NodeInventory {
  name: 'Pantaco' | 'Tacuba';
  capacity: number;                            // designed capacity (Pantaco: 35, Tacuba: 15)
  inventoryByMaterial: Partial<Record<Material, number>>;
  forecastArrivals?: number;                   // # RCs forecasted to arrive (transit)
  unloadingPlan?: UnloadingPlan;               // daily plan (for compliance calculation)
  hazardousAtNode?: Partial<Record<HazardMaterial, number>>; // must be 0 at intermediate nodes
  lastUpdatedIso?: string;                     // optional timestamp for traceability
}

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface NodeAlert {
  node: 'Pantaco' | 'Tacuba';
  code: string;
  message: string;
  severity: AlertSeverity;
  whenIso: string;
}

@Component({
  selector: 'app-nodes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nodes.component.html',
  styleUrls: ['./nodes.component.scss']
})
export class NodesComponent {

  /** External data source; falls back to defaults derived from the docs */
  @Input({ required: false }) nodes: NodeInventory[] | null = null;

  /** Default doc-aligned state (override via @Input) */
  private defaultNodes: NodeInventory[] = [
    {
      name: 'Pantaco',
      capacity: 35,
      inventoryByMaterial: {
        sodiumSulfate: 8,
        HLAS: 0,
        denseCarbonate: 6,
        soda: 5,
        lightCarbonate: 4,
        pastaSurflex: 2
      },
      forecastArrivals: 4,
      unloadingPlan: { plannedRCs: 12, unloadedRCs: 10 },
      hazardousAtNode: { sodium: 0, pastaCalaca: 0, HLAS: 0 },
      lastUpdatedIso: new Date().toISOString()
    },
    {
      name: 'Tacuba',
      capacity: 15,
      inventoryByMaterial: {
        sodiumSulfate: 3,
        HLAS: 0,
        denseCarbonate: 2,
        soda: 3,
        lightCarbonate: 1,
        pastaSurflex: 1
      },
      forecastArrivals: 5,
      unloadingPlan: { plannedRCs: 6, unloadedRCs: 4 },
      hazardousAtNode: { sodium: 0, pastaCalaca: 0, HLAS: 0 },
      lastUpdatedIso: new Date().toISOString()
    }
  ];

  // Internal reactive state
  private nodeData = signal<NodeInventory[]>(this.nodes ?? this.defaultNodes);

  // Keep signal in sync with @Input
  ngOnChanges(): void {
    if (this.nodes && Array.isArray(this.nodes)) {
      this.nodeData.set(this.nodes);
    }
  }

  /** Display helpers */
  readonly materialsOrder: Material[] = [
    'sodiumSulfate', 'HLAS', 'denseCarbonate', 'soda', 'lightCarbonate', 'pastaSurflex'
  ];

  readonly materialLabels: Record<Material, string> = {
    sodiumSulfate: 'Sodium sulfate',
    HLAS: 'HLAS',
    denseCarbonate: 'Dense carbonate',
    soda: 'Soda',
    lightCarbonate: 'Light carbonate',
    pastaSurflex: 'Pasta Surflex'
  };

  /** Derived metrics per node */
  readonly metrics = computed(() => {
    return this.nodeData().map(n => {
      const total = this.sumInventory(n.inventoryByMaterial);
      const utilizationPct = n.capacity > 0 ? Math.round((total / n.capacity) * 100) : 0;
      const arrivals = n.forecastArrivals ?? 0;
      const projected = total + arrivals;
      const compliancePct = n.unloadingPlan
        ? this.safePct(n.unloadingPlan.unloadedRCs, n.unloadingPlan.plannedRCs)
        : null;
      const hazardousSum = this.sumHazardous(n.hazardousAtNode);

      return {
        node: n.name,
        total,
        utilizationPct,
        arrivals,
        projected,
        capacity: n.capacity,
        compliancePct,
        hazardousSum,
        lastUpdatedIso: n.lastUpdatedIso ?? new Date().toISOString()
      };
    });
  });

  /** Alerts per supply chain rules */
  readonly alerts: Signal<NodeAlert[]> = computed(() => {
    const out: NodeAlert[] = [];
    const now = new Date().toISOString();

    for (const n of this.nodeData()) {
      const total = this.sumInventory(n.inventoryByMaterial);
      const arrivals = n.forecastArrivals ?? 0;
      const projected = total + arrivals;

      // Capacity exceeded
      if (total > n.capacity) {
        out.push(this.mkAlert(n.name, 'CAPACITY_EXCEEDED',
          `Inventory ${total} exceeds designed capacity ${n.capacity}.`,
          'critical', now));
      }

      // Transit space exceeded (current + arrivals)
      if (projected > n.capacity) {
        out.push(this.mkAlert(n.name, 'TRANSIT_OVER_CAPACITY',
          `Projected (current ${total} + arrivals ${arrivals} = ${projected}) exceeds capacity ${n.capacity}.`,
          'warning', now));
      }

      // Unloading plan compliance < 90%
      if (n.unloadingPlan) {
        const pct = this.safePct(n.unloadingPlan.unloadedRCs, n.unloadingPlan.plannedRCs);
        if (pct < 90) {
          out.push(this.mkAlert(n.name, 'PLAN_COMPLIANCE_LOW',
            `Unloading plan compliance ${pct}% is below 90%.`,
            'warning', now));
        }
      }

      // Hazardous presence at intermediate nodes (should be zero)
      const hazSum = this.sumHazardous(n.hazardousAtNode);
      if (hazSum > 0) {
        out.push(this.mkAlert(n.name, 'HAZARDOUS_AT_NODE',
          `Hazardous materials present at ${n.name} (${hazSum}). They must be delivered directly to plant (no intermediate storage).`,
          'critical', now));
      }
    }
    return out;
  });

  // -------- Template-friendly helpers (avoid parser issues) --------

  /** Clamp percentage to [0, 100] for width bindings */
  clampPct(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(value, 100));
  }

  /** Safe material qty fetch (template passes node name as string) */
  getMaterialQtyNode(nodeName: string, mat: Material): number {
    const matched = this.nodeData().find(n => n.name === nodeName);
    if (!matched || !matched.inventoryByMaterial) return 0;
    const v = matched.inventoryByMaterial[mat];
    return typeof v === 'number' ? v : 0;
  }

  /** Audit trail (append-only in-memory demo) */
  auditLog = signal<string[]>([]);
  private audit(effectName: string, payload: unknown) {
    const line = `[${new Date().toISOString()}] ${effectName}: ${JSON.stringify(payload)}`;
    this.auditLog.update(list => [line, ...list].slice(0, 100)); // keep last 100
  }

  constructor() {
    effect(() => this.audit('metrics', this.metrics()));
    effect(() => this.audit('alerts', this.alerts()));
  }

  // -------- Utils --------
  private sumInventory(inv?: Partial<Record<Material, number>>): number {
    if (!inv) return 0;
    return Object.values(inv).reduce((acc, v) => acc + (v ?? 0), 0);
  }

  private sumHazardous(h?: Partial<Record<HazardMaterial, number>>): number {
    if (!h) return 0;
    return Object.values(h).reduce((acc, v) => acc + (v ?? 0), 0);
  }

  private safePct(numerator: number, denominator: number): number {
    if (!denominator || denominator <= 0) return 0;
    return Math.round((numerator / denominator) * 100);
  }

  private mkAlert(node: 'Pantaco' | 'Tacuba', code: string, message: string,
                  severity: AlertSeverity, whenIso: string): NodeAlert {
    return { node, code, message, severity, whenIso };
  }

  trackByNode = (_: number, m: { node: string }) => m.node;
  cssForSeverity(sev: AlertSeverity): string {
    switch (sev) {
      case 'critical': return 'alert--critical';
      case 'warning': return 'alert--warning';
      default: return 'alert--info';
    }
  }
}
