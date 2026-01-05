
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Domain models for Masters data
 */
export interface Material {
  id: string;
  name: string;
  hazardous: boolean;
  design: number;       // design stock
  safety: number;       // safety stock
  supplier?: string;
}

export interface NodeYard {
  id: string;
  name: 'Pantaco' | 'Tacuba' | 'Vallejo' | string;
  type: 'Transit' | 'Plant' | 'Storage' | string;
  capacity: number;    // railcars capacity
  location?: string;
}

export interface Supplier {
  id: string;
  name: string;
  materialsSupplied: string[];
  contact?: string;
}

export interface OperationalParam {
  id: string;
  key: string;         // e.g., 'unloadingComplianceThreshold'
  value: number | string | boolean;
  description?: string;
  effectiveDate?: string;
}

type TabKey = 'materials' | 'nodes' | 'suppliers' | 'parameters';

@Component({
  selector: 'app-masters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './masters.component.html',
  styleUrls: ['./masters.component.scss']
})
export class MastersComponent {
  // ---- Tabs (signals; Angular 16+) ----
  readonly tab = signal<TabKey>('materials');

  // ---- Demo stores (replace with API/service calls) ----
  readonly materials = signal<Material[]>([
    { id: crypto.randomUUID(), name: 'Sodium sulfate', hazardous: false, design: 10, safety: 10, supplier: 'SPI Materials' },
    { id: crypto.randomUUID(), name: 'HLAS', hazardous: true, design: 3, safety: 3, supplier: 'Mariscala' },
    { id: crypto.randomUUID(), name: 'Dense carbonate', hazardous: false, design: 2, safety: 2, supplier: 'SPI Materials' },
    { id: crypto.randomUUID(), name: 'Light carbonate', hazardous: false, design: 1, safety: 1, supplier: 'SPI Materials' },
    { id: crypto.randomUUID(), name: 'Pasta Surflex', hazardous: true, design: 2, safety: 2, supplier: 'Mariscala' },
    { id: crypto.randomUUID(), name: 'Soda', hazardous: false, design: 4, safety: 4, supplier: 'SPI Materials' },
  ]);

  readonly nodes = signal<NodeYard[]>([
    { id: crypto.randomUUID(), name: 'Pantaco', type: 'Transit', capacity: 35 },
    { id: crypto.randomUUID(), name: 'Tacuba', type: 'Transit', capacity: 15 },
    { id: crypto.randomUUID(), name: 'Vallejo', type: 'Plant', capacity: 35, location: 'Plant Yard' },
  ]);

  readonly suppliers = signal<Supplier[]>([
    { id: crypto.randomUUID(), name: 'Mariscala', materialsSupplied: ['Pasta Calaca', 'HLAS'], contact: 'mariscala@example.com' },
    { id: crypto.randomUUID(), name: 'SPI Materials', materialsSupplied: ['Sodium sulfate', 'Dense carbonate', 'Light carbonate', 'Soda'], contact: 'spi@example.com' },
  ]);

  readonly parameters = signal<OperationalParam[]>([
    { id: crypto.randomUUID(), key: 'unloadingComplianceThreshold', value: 90, description: 'Minimum % compliance before alert' },
    { id: crypto.randomUUID(), key: 'plantMaxRailcarsPerDay', value: 32, description: 'Daily receipt limit (arrivals)' },
    { id: crypto.randomUUID(), key: 'emptyReleaseRatio', value: 1, description: 'Released == Unloaded target ratio' },
  ]);

  // ---- Derived helpers ----
  readonly materialCount = computed(() => this.materials().length);
  readonly nodeCount = computed(() => this.nodes().length);
  readonly supplierCount = computed(() => this.suppliers().length);
  readonly paramCount = computed(() => this.parameters().length);

  // ---- Form models ----
  newMaterial: Partial<Material> = { hazardous: false, design: 0, safety: 0 };
  newNode: Partial<NodeYard> = { type: 'Transit', capacity: 0 };
  newSupplier: Partial<Supplier> = { materialsSupplied: [] };
  newParam: Partial<OperationalParam> = { key: '', value: '' };

  /**
   * Raw, comma-separated materials text for supplier form.
   * Bound in template using [(ngModel)] and normalized in an on-change handler.
   */
  newSupplierMaterialsRaw = '';

  // ---- CRUD (local-only) ----
  addMaterial() {
    const m = this.newMaterial;
    if (!m?.name) return;
    this.materials.update(list => [
      ...list,
      {
        id: crypto.randomUUID(),
        name: m.name!,
        hazardous: !!m.hazardous,
        design: Number(m.design ?? 0),
        safety: Number(m.safety ?? 0),
        supplier: m.supplier || ''
      }
    ]);
    this.newMaterial = { hazardous: false, design: 0, safety: 0 };
  }

  removeMaterial(id: string) {
    this.materials.update(list => list.filter(x => x.id !== id));
  }

  addNode() {
    const n = this.newNode;
    if (!n?.name) return;
    this.nodes.update(list => [
      ...list,
      {
        id: crypto.randomUUID(),
        name: n.name as NodeYard['name'],
        type: (n.type as NodeYard['type']) ?? 'Transit',
        capacity: Number(n.capacity ?? 0),
        location: n.location
      }
    ]);
    this.newNode = { type: 'Transit', capacity: 0 };
  }

  removeNode(id: string) {
    this.nodes.update(list => list.filter(x => x.id !== id));
  }

  addSupplier() {
    const s = this.newSupplier;
    if (!s?.name) return;

    const materials = Array.isArray(s.materialsSupplied) ? s.materialsSupplied : [];

    this.suppliers.update(list => [
      ...list,
      { id: crypto.randomUUID(), name: s.name!, materialsSupplied: materials, contact: s.contact }
    ]);

    // reset
    this.newSupplier = { materialsSupplied: [] };
    this.newSupplierMaterialsRaw = '';
  }

  removeSupplier(id: string) {
    this.suppliers.update(list => list.filter(x => x.id !== id));
  }

  addParam() {
    const p = this.newParam;
    if (!p?.key) return;
    this.parameters.update(list => [
      ...list,
      {
        id: crypto.randomUUID(),
        key: p.key!,
        value: p.value ?? '',
        description: p.description,
        effectiveDate: p.effectiveDate
      }
    ]);
    this.newParam = { key: '', value: '' };
  }

  removeParam(id: string) {
    this.parameters.update(list => list.filter(x => x.id !== id));
  }

  setTab(next: TabKey) {
    this.tab.set(next);
  }

  trackById(_: number, item: { id: string }) {
    return item.id;
  }

  // ---- Normalizers / Handlers (fix for template parsing errors) ----
  onSupplierMaterialsModelChange(raw: string) {
    this.newSupplierMaterialsRaw = raw ?? '';
    this.newSupplier.materialsSupplied = this.newSupplierMaterialsRaw
      .split(',')
      .map((x) => x.trim())
      .filter((x) => !!x);
  }
}
