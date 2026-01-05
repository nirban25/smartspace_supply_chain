
import { CommonModule, DatePipe } from '@angular/common';
import { Component, Signal, computed, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

type NodeName = 'Pantaco' | 'Tacuba' | 'Vallejo' | 'Ferrovalle';
type Material =
  | 'Sodium sulfate'
  | 'HLAS'
  | 'Dense carbonate'
  | 'Soda'
  | 'Light carbonate'
  | 'Pasta Surflex'
  | 'Pasta Calaca';

type ActionType = 'RECEIVING' | 'UNLOADING' | 'RELEASING' | 'ALERT';
type UseCase = 'UC1' | 'UC2' | 'UC3' | 'UC4' | 'UC5' | 'UC6' | 'UC7' | 'UC8' | 'UC9';

interface TraceLog {
  id: string;
  action: ActionType;
  useCase: UseCase[];
  node: NodeName;
  material?: Material;
  railcarId?: string;
  quantity?: number;
  userId: string;
  timestamp: string;   // ISO
  source?: string;
  notes?: string;
}

@Component({
  selector: 'app-traceability',
  standalone: true,
  templateUrl: './traceability.component.html',
  styleUrls: ['./traceability.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  providers: [DatePipe]
})
export class TraceabilityComponent {

  /** SRS-derived constants */
  readonly NODE_CAPACITY: Record<NodeName, number> = {
    Pantaco: 35,
    Tacuba: 15,
    Vallejo: 35,
    Ferrovalle: Number.NaN // transit for empties; capacity workflow-controlled
  };

  readonly DAILY_RECEIPT_LIMIT = 32;

  readonly DESIGN_INVENTORY: Record<Exclude<Material, 'Pasta Calaca'>, number> = {
    'Sodium sulfate': 20,  // 10 + 10
    'HLAS': 6,             // 3 + 3
    'Dense carbonate': 4,  // 2 + 2
    'Soda': 8,             // 4 + 4
    'Light carbonate': 2,  // 1 + 1
    'Pasta Surflex': 4     // 2 + 2
  };

  // ---------------------------
  // Filters & reactive inputs
  // ---------------------------
  filterForm!: FormGroup;

  // IMPORTANT: declare first; initialize inside constructor AFTER form is created
  filtersSig!: Signal<{
    useCase: UseCase | '';
    node: NodeName | '';
    material: Material | '';
    action: ActionType | '';
    from: string | '';
    to: string | '';
  }>;

  readonly useCaseOptions: UseCase[] = ['UC1','UC2','UC3','UC4','UC5','UC6','UC7','UC8','UC9'];
  readonly nodeOptions: NodeName[] = ['Pantaco','Tacuba','Vallejo','Ferrovalle'];
  readonly materialOptions: Material[] = [
    'Sodium sulfate','HLAS','Dense carbonate','Soda','Light carbonate','Pasta Surflex','Pasta Calaca'
  ];
  readonly actionOptions: ActionType[] = ['RECEIVING','UNLOADING','RELEASING','ALERT'];

  // ---------------------------
  // Sample data (replace with integration)
  // ---------------------------
  logs = signal<TraceLog[]>([
    {
      id: crypto.randomUUID(),
      action: 'RECEIVING',
      useCase: ['UC1','UC2','UC8'],
      node: 'Vallejo',
      material: 'Sodium sulfate',
      railcarId: 'RC-SS-0001',
      quantity: 1,
      userId: 'system@etl',
      timestamp: new Date().toISOString(),
      source: 'Email: RECIBOS DE FFCC TRANSFER',
      notes: 'Auto-ingested daily receipt'
    },
    {
      id: crypto.randomUUID(),
      action: 'UNLOADING',
      useCase: ['UC3','UC9'],
      node: 'Vallejo',
      material: 'HLAS',
      railcarId: 'RC-HLAS-0103',
      quantity: 1,
      userId: 'htm@vallejo',
      timestamp: new Date().toISOString(),
      source: 'HTM Completed Unloading',
      notes: 'Registry item for audit'
    },
    {
      id: crypto.randomUUID(),
      action: 'RELEASING',
      useCase: ['UC5'],
      node: 'Ferrovalle',
      railcarId: 'RC-EMPTY-202',
      userId: 'ops@ferrovalle',
      timestamp: new Date().toISOString(),
      source: 'FV Portal - Diverse Services',
      notes: 'Empty car release'
    },
    {
      id: crypto.randomUUID(),
      action: 'ALERT',
      useCase: ['UC6','UC7'],
      node: 'Vallejo',
      material: 'HLAS',
      userId: 'monitor@rules',
      timestamp: new Date().toISOString(),
      source: 'Business Logic Engine',
      notes: 'Hazardous inventory exceeds design'
    }
  ]);

  // ---------------------------
  // Computed list (driven by signals)
  // NOTE: This function is defined now but only executes when
  // the template reads it, which happens AFTER the constructor runs.
  // ---------------------------
  filtered = computed(() => {
    // Use the latest values from the filters signal; if not ready, fall back to current form value
    const fv = this.filtersSig ? this.filtersSig() : this.filterForm.value;

    return this.logs().filter(l => {
      const matchesUseCase = fv.useCase ? l.useCase.includes(fv.useCase) : true;
      const matchesNode    = fv.node ? l.node === fv.node : true;
      const matchesMaterial= fv.material ? l.material === fv.material : true;
      const matchesAction  = fv.action ? l.action === fv.action : true;
      const matchesFrom    = fv.from ? (new Date(l.timestamp).getTime() >= new Date(fv.from).getTime()) : true;
      const matchesTo      = fv.to ? (new Date(l.timestamp).getTime() <= new Date(fv.to).getTime()) : true;
      return matchesUseCase && matchesNode && matchesMaterial && matchesAction && matchesFrom && matchesTo;
    });
  });

  constructor(private fb: FormBuilder, private datePipe: DatePipe) {
    // 1) Create the form first
    this.filterForm = this.fb.group({
      useCase: [''] as any,
      node: [''] as any,
      material: [''] as any,
      action: [''] as any,
      from: [''],
      to: ['']
    });

    // 2) Then convert valueChanges -> signal
    this.filtersSig = toSignal(this.filterForm.valueChanges, {
      initialValue: this.filterForm.value
    });
  }

  /** Clear Filters (optional) */
  clearFilters() {
    this.filterForm.reset({
      useCase: '',
      node: '',
      material: '',
      action: '',
      from: '',
      to: ''
    });
  }

  /** Manual log entry (called by template) */
  onManualLog(
    actionStr: string,
    useCaseStrs: string[],
    nodeStr: string,
    materialStr: string,
    railcarId: string,
    quantityStr: string,
    userId: string,
    source: string,
    notes: string
  ) {
    const action   = this.normalizeAction(actionStr);
    const useCase  = this.normalizeUseCases(useCaseStrs);
    const node     = this.normalizeNode(nodeStr);
    const material = this.normalizeMaterial(materialStr);
    const quantity = quantityStr ? Number(quantityStr) : undefined;

    this.addManualLog({
      action,
      useCase,
      node,
      material,
      railcarId: railcarId || undefined,
      quantity,
      userId: userId || undefined,
      source: source || undefined,
      notes: notes || undefined
    });
  }

  /** Helper to extract selected values from a <select multiple> */
  getSelectedValues(select: HTMLSelectElement): string[] {
    return Array.from(select.selectedOptions).map((o: HTMLOptionElement) => o.value);
    // If you want only one UC, change to: return [select.value].filter(Boolean);
  }

  /** trackBy function for *ngFor */
  trackById(index: number, row: TraceLog): string {
    return row.id;
  }

  /** Add a manual log entry */
  private addManualLog(partial: Partial<TraceLog>) {
    const entry: TraceLog = {
      id: crypto.randomUUID(),
      action: (partial.action ?? 'RECEIVING'),
      useCase: partial.useCase ?? [],
      node: (partial.node ?? 'Vallejo'),
      material: partial.material,
      railcarId: partial.railcarId,
      quantity: partial.quantity,
      userId: partial.userId ?? 'operator@vallejo',
      timestamp: new Date().toISOString(),
      source: partial.source ?? 'Manual Entry',
      notes: partial.notes
    };
    this.logs.update(arr => [entry, ...arr]);
  }

  /** Export CSV */
  exportCSV() {
    const header = ['id','action','useCase','node','material','railcarId','quantity','userId','timestamp','source','notes'];
    const rows = this.filtered().map(l => [
      l.id, l.action, l.useCase.join('|'), l.node, l.material ?? '', l.railcarId ?? '', l.quantity ?? '',
      l.userId, l.timestamp, l.source ?? '', (l.notes ?? '').replace(/\n/g,' ')
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `traceability_audit_${this.datePipe.transform(new Date(),'yyyyMMdd_HHmmss')}.csv`;
    a.click();
  }

  /** Export JSON */
  exportJSON() {
    const blob = new Blob([JSON.stringify(this.filtered(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `traceability_audit_${this.datePipe.transform(new Date(),'yyyyMMdd_HHmmss')}.json`;
    a.click();
  }

  // -----------------------
  // Type guards / normalizers
  // -----------------------
  private normalizeMaterial(value: string): Material | undefined {
    const v = value?.trim() as Material;
    return this.materialOptions.includes(v) ? v : undefined;
  }

  private normalizeAction(value: string): ActionType {
    const v = value?.trim() as ActionType;
    return this.actionOptions.includes(v) ? v : 'RECEIVING';
  }

  private normalizeNode(value: string): NodeName {
    const v = value?.trim() as NodeName;
    return this.nodeOptions.includes(v) ? v : 'Vallejo';
  }

  private normalizeUseCases(values: string[]): UseCase[] {
    const allowed = new Set(this.useCaseOptions);
    return (values || [])
      .map(v => v?.trim() as UseCase)
      .filter(v => allowed.has(v));
  }
}

