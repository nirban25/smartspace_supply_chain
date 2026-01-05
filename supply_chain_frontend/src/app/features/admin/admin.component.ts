
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

/* ===== Domain Types ===== */

export type AlertCategory =
  | 'Compliance'
  | 'Inventory'
  | 'Transit'
  | 'EmptyRelease'
  | 'DailyReceipt';

export interface NodeCapacity {
  nodeName: 'Pantaco' | 'Tacuba' | 'Vallejo';
  designedCapacity: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface MaterialDesign {
  materialName:
    | 'Sodium sulfate'
    | 'Dense carbonate'
    | 'Light carbonate'
    | 'Pasta'
    | 'HLAS'
    | 'Soda';
  normalUnits: number;
  safetyStock: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface AlertPolicy {
  category: AlertCategory;
  ruleExpr: string;
  threshold?: number | null;
  severity: 'Info' | 'Warn' | 'Critical';
  channel: 'Teams' | 'Email' | 'Both';
  recipients: string;
  enabled: boolean;
  debounceMinutes?: number;
  escalationPath?: string;
}

export interface Connector {
  type: 'Email' | 'Excel' | 'FV' | 'Teams' | 'SharePoint';
  owner?: string;
  schedule?: string;
  enabled: boolean;
  settings: Record<string, unknown>;
}

export interface RoleAssignment {
  userId: string;
  roleName: 'Admin' | 'Planner' | 'Operator' | 'Auditor';
}

/* ===== Defaults (seed data) ===== */

const DEFAULT_NODE_CAPACITIES: NodeCapacity[] = [
  { nodeName: 'Pantaco', designedCapacity: 35 },
  { nodeName: 'Tacuba', designedCapacity: 15 },
  { nodeName: 'Vallejo', designedCapacity: 35 },
];

const DEFAULT_MATERIALS: MaterialDesign[] = [
  { materialName: 'Sodium sulfate', normalUnits: 10, safetyStock: 10 },
  { materialName: 'Dense carbonate', normalUnits: 2, safetyStock: 2 },
  { materialName: 'Light carbonate', normalUnits: 1, safetyStock: 1 },
  { materialName: 'Pasta', normalUnits: 2, safetyStock: 2 },
  { materialName: 'HLAS', normalUnits: 3, safetyStock: 3 },
  { materialName: 'Soda', normalUnits: 4, safetyStock: 4 },
];

const DEFAULT_ALERTS: AlertPolicy[] = [
  {
    category: 'Compliance',
    ruleExpr: 'compliance < 0.90',
    severity: 'Warn',
    channel: 'Both',
    recipients: 'ops-team@example.com',
    enabled: true,
    debounceMinutes: 10,
  },
  {
    category: 'Inventory',
    ruleExpr: 'totalInPlant > 32',
    severity: 'Critical',
    channel: 'Both',
    recipients: 'yard-supervisors@example.com',
    enabled: true,
    debounceMinutes: 5,
  },
  {
    category: 'Transit',
    ruleExpr: 'pantacoStored + pantacoArrivals > pantacoCapacity',
    severity: 'Warn',
    channel: 'Teams',
    recipients: 'planner@example.com',
    enabled: true,
    debounceMinutes: 10,
  },
  {
    category: 'EmptyRelease',
    ruleExpr: 'releasedToday < unloadedToday',
    severity: 'Warn',
    channel: 'Email',
    recipients: 'ferrovalle-ops@example.com',
    enabled: true,
    debounceMinutes: 15,
  },
  {
    category: 'DailyReceipt',
    ruleExpr: 'arrivalsToday > 32',
    severity: 'Critical',
    channel: 'Both',
    recipients: 'ops-lead@example.com',
    enabled: true,
    debounceMinutes: 5,
  },
];

const DEFAULT_CONNECTORS: Connector[] = [
  {
    type: 'Email',
    owner: 'HTM',
    schedule: '06:00',
    enabled: true,
    settings: { subjects: ['Inventory of Tracks', 'Release Email', 'RECIBOS DE FFCC TRANSFER'] },
  },
  {
    type: 'FV',
    owner: 'Raul Jimenez',
    schedule: '06:00',
    enabled: true,
    settings: { endpoint: 'https://fv.example/api', auth: 'aad' },
  },
  {
    type: 'Teams',
    owner: 'Ops',
    schedule: 'on-demand',
    enabled: true,
    settings: { channel: 'Road Throughput - LL & SNO' },
  },
];

const DEFAULT_ROLES: RoleAssignment[] = [
  { userId: 'user-ops-1', roleName: 'Operator' },
  { userId: 'user-plan-1', roleName: 'Planner' },
  { userId: 'user-admin-1', roleName: 'Admin' },
  { userId: 'auditor-1', roleName: 'Auditor' },
];

const LS_KEYS = {
  NODE_CAPACITY: 'admin.nodeCapacity',
  MATERIALS: 'admin.materials',
  ALERTS: 'admin.alerts',
  CONNECTORS: 'admin.connectors',
  ROLES: 'admin.roles',
  HAZARD_POLICY: 'admin.hazardousDirectOnly',
};

/* ===== Strongly typed form group aliases ===== */

type NodeCapacityForm = FormGroup<{
  nodeName: FormControl<NodeCapacity['nodeName']>;
  designedCapacity: FormControl<number>;
  effectiveFrom: FormControl<string>;
  effectiveTo: FormControl<string>;
}>;

type MaterialDesignForm = FormGroup<{
  materialName: FormControl<MaterialDesign['materialName']>;
  normalUnits: FormControl<number>;
  safetyStock: FormControl<number>;
  effectiveFrom: FormControl<string>;
  effectiveTo: FormControl<string>;
}>;

type AlertPolicyForm = FormGroup<{
  category: FormControl<AlertCategory>;
  ruleExpr: FormControl<string>;
  threshold: FormControl<number | null>;
  severity: FormControl<AlertPolicy['severity']>;
  channel: FormControl<AlertPolicy['channel']>;
  recipients: FormControl<string>;
  enabled: FormControl<boolean>;
  debounceMinutes: FormControl<number>;
  escalationPath: FormControl<string>;
}>;

type ConnectorForm = FormGroup<{
  type: FormControl<Connector['type']>;
  owner: FormControl<string>;
  schedule: FormControl<string>;
  enabled: FormControl<boolean>;
  settings: FormControl<Record<string, unknown>>;
}>;

type RoleAssignmentForm = FormGroup<{
  userId: FormControl<string>;
  roleName: FormControl<RoleAssignment['roleName']>;
}>;

/* ===== Component ===== */

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    nodeCapacities: this.fb.array<NodeCapacityForm>([]),
    materials: this.fb.array<MaterialDesignForm>([]),
    alerts: this.fb.array<AlertPolicyForm>([]),
    connectors: this.fb.array<ConnectorForm>([]),
    roles: this.fb.array<RoleAssignmentForm>([]),
    hazardousDirectOnly: new FormControl<boolean>(true, { nonNullable: true }),
  });

  // convenience getters
  get nodeCapacitiesArray() { return this.form.controls.nodeCapacities; }
  get materialsArray() { return this.form.controls.materials; }
  get alertsArray() { return this.form.controls.alerts; }
  get connectorsArray() { return this.form.controls.connectors; }
  get rolesArray() { return this.form.controls.roles; }

  // signals for UI
  nodeCapacities = signal(this.nodeCapacitiesArray);
  materials = signal(this.materialsArray);
  alerts = signal(this.alertsArray);
  connectors = signal(this.connectorsArray);
  roles = signal(this.rolesArray);

  totalNodeCapacity = computed(() =>
    this.nodeCapacities().controls.reduce(
      (sum, g) => sum + (g.controls.designedCapacity.value ?? 0), 0
    )
  );

  constructor() {
    this.loadAll();
    this.form.valueChanges.subscribe(() => this.saveAll());
  }

  /* ===== Builders (nonNullable string controls + typed returns) ===== */

  private buildNodeCapacity(nc?: Partial<NodeCapacity>): NodeCapacityForm {
    return this.fb.group({
      nodeName: new FormControl<NodeCapacity['nodeName']>(nc?.nodeName ?? 'Pantaco', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      designedCapacity: new FormControl<number>(nc?.designedCapacity ?? 35, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      effectiveFrom: new FormControl<string>(nc?.effectiveFrom ?? '', { nonNullable: true }),
      effectiveTo: new FormControl<string>(nc?.effectiveTo ?? '', { nonNullable: true }),
    });
  }

  private buildMaterial(md?: Partial<MaterialDesign>): MaterialDesignForm {
    return this.fb.group({
      materialName: new FormControl<MaterialDesign['materialName']>(md?.materialName ?? 'Sodium sulfate', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      normalUnits: new FormControl<number>(md?.normalUnits ?? 0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      safetyStock: new FormControl<number>(md?.safetyStock ?? 0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      effectiveFrom: new FormControl<string>(md?.effectiveFrom ?? '', { nonNullable: true }),
      effectiveTo: new FormControl<string>(md?.effectiveTo ?? '', { nonNullable: true }),
    });
  }

  private buildAlert(ap?: Partial<AlertPolicy>): AlertPolicyForm {
    return this.fb.group({
      category: new FormControl<AlertCategory>(ap?.category ?? 'Compliance', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      ruleExpr: new FormControl<string>(ap?.ruleExpr ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      threshold: new FormControl<number | null>(ap?.threshold ?? null),
      severity: new FormControl<AlertPolicy['severity']>(ap?.severity ?? 'Info', { nonNullable: true }),
      channel: new FormControl<AlertPolicy['channel']>(ap?.channel ?? 'Both', { nonNullable: true }),
      recipients: new FormControl<string>(ap?.recipients ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      enabled: new FormControl<boolean>(ap?.enabled ?? true, { nonNullable: true }),
      debounceMinutes: new FormControl<number>(ap?.debounceMinutes ?? 5, {
        nonNullable: true,
        validators: [Validators.min(0)],
      }),
      escalationPath: new FormControl<string>(ap?.escalationPath ?? '', { nonNullable: true }),
    });
  }

  private buildConnector(cn?: Partial<Connector>): ConnectorForm {
    return this.fb.group({
      type: new FormControl<Connector['type']>(cn?.type ?? 'Email', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      owner: new FormControl<string>(cn?.owner ?? '', { nonNullable: true }),
      schedule: new FormControl<string>(cn?.schedule ?? '', { nonNullable: true }),
      enabled: new FormControl<boolean>(cn?.enabled ?? true, { nonNullable: true }),
      settings: new FormControl<Record<string, unknown>>(cn?.settings ?? {}, { nonNullable: true }),
    });
  }

  private buildRole(ra?: Partial<RoleAssignment>): RoleAssignmentForm {
    return this.fb.group({
      userId: new FormControl<string>(ra?.userId ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      roleName: new FormControl<RoleAssignment['roleName']>(ra?.roleName ?? 'Operator', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  /* ===== Load/Save (localStorage; replace with API later) ===== */

  private loadAll() {
    this.loadArray<NodeCapacity>(LS_KEYS.NODE_CAPACITY, DEFAULT_NODE_CAPACITIES, this.nodeCapacitiesArray, this.buildNodeCapacity.bind(this));
    this.loadArray<MaterialDesign>(LS_KEYS.MATERIALS, DEFAULT_MATERIALS, this.materialsArray, this.buildMaterial.bind(this));
    this.loadArray<AlertPolicy>(LS_KEYS.ALERTS, DEFAULT_ALERTS, this.alertsArray, this.buildAlert.bind(this));
    this.loadArray<Connector>(LS_KEYS.CONNECTORS, DEFAULT_CONNECTORS, this.connectorsArray, this.buildConnector.bind(this));
    this.loadArray<RoleAssignment>(LS_KEYS.ROLES, DEFAULT_ROLES, this.rolesArray, this.buildRole.bind(this));

    const hazardRaw = localStorage.getItem(LS_KEYS.HAZARD_POLICY);
    if (hazardRaw) this.form.controls.hazardousDirectOnly.setValue(JSON.parse(hazardRaw));
  }

  private loadArray<T>(
    key: string,
    defaults: T[],
    target: FormArray<any>,
    builder: (value?: Partial<T>) => FormGroup
  ) {
    target.clear();
    const raw = localStorage.getItem(key);
    const parsed: T[] = raw ? JSON.parse(raw) : defaults;
    parsed.forEach((item) => target.push(builder(item)));
  }

  private saveAll() {
    this.saveArray(LS_KEYS.NODE_CAPACITY, this.nodeCapacitiesArray);
    this.saveArray(LS_KEYS.MATERIALS, this.materialsArray);
    this.saveArray(LS_KEYS.ALERTS, this.alertsArray);
    this.saveArray(LS_KEYS.CONNECTORS, this.connectorsArray);
    this.saveArray(LS_KEYS.ROLES, this.rolesArray);
    localStorage.setItem(LS_KEYS.HAZARD_POLICY, JSON.stringify(this.form.controls.hazardousDirectOnly.value));
  }

  private saveArray(key: string, arr: FormArray<any>) {
    const value = arr.getRawValue();
    localStorage.setItem(key, JSON.stringify(value));
  }

  /* ===== Add/Remove ===== */

  addNodeCapacity() { this.nodeCapacitiesArray.push(this.buildNodeCapacity()); }
  removeNodeCapacity(i: number) { this.nodeCapacitiesArray.removeAt(i); }

  addMaterial() { this.materialsArray.push(this.buildMaterial()); }
  removeMaterial(i: number) { this.materialsArray.removeAt(i); }

  addAlert() { this.alertsArray.push(this.buildAlert()); }
  removeAlert(i: number) { this.alertsArray.removeAt(i); }

  addConnector() { this.connectorsArray.push(this.buildConnector()); }
  removeConnector(i: number) { this.connectorsArray.removeAt(i); }

  addRole() { this.rolesArray.push(this.buildRole()); }
  removeRole(i: number) { this.rolesArray.removeAt(i); }

  /* ===== Stubs to wire later ===== */

  testConnector(index: number) {
    const cn = this.connectorsArray.at(index)?.getRawValue();
    alert(`Testing connector "${cn.type}"\n${JSON.stringify(cn.settings, null, 2)}`);
  }

  publishUnloadingPlan() {
    alert('Daily Unloading Plan published (stub). Replace with API call to HTM + Teams.');
  }

  /* ===== Rule helpers (unit-testable) ===== */

  static exceedsTotalLimit(totalInPlant: number, limit = 32) { return totalInPlant > limit; }
  static deviatesFromDesign(actual: number, design: number, tolerance = 2) {
    return Math.abs(actual - design) > tolerance;
  }
}
