
// src/app/features/transit-space/transit-dashboard/transit-dashboard.ts
// Single file that exports the Angular standalone component and contains the static UI logic.

import {
  Component,
  AfterViewInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import {
  MaterialType,
  NodeId,
  ArrivalForecast,
  DataSourceStatus,
  Alert,
  AuditEntry,
} from './types';
import { MATERIALS as MATERIALS_WITH_ALL, NODES as NODES_WITH_ALL } from './constants';

/* ========================================================================
   Static demo data (no backend APIs required)
   ======================================================================== */
const now = new Date();
const toISO = (d: Date) => d.toISOString();

// Guaranteed Dense carbonate -> Pantaco @ 12:00 PM (so your filters always show something)
const twelveLocalISO = new Date(new Date().setHours(12, 0, 0, 0)).toISOString();

const ARRIVALS_STATIC: ArrivalForecast[] = [
  { id: 'RC-DC-7001', material: 'Dense carbonate', inboundNode: 'Pantaco', eta: twelveLocalISO },
  { id: 'RC-1002',    material: 'HLAS',            inboundNode: 'Pantaco', eta: toISO(new Date(now.getTime() + 4*3600_000)) },
  { id: 'RC-1003',    material: 'Soda',            inboundNode: 'Tacuba',  eta: toISO(new Date(now.getTime() + 3*3600_000)) },
  { id: 'RC-1004',    material: 'Dense carbonate', inboundNode: 'Vallejo', eta: toISO(new Date(now.getTime() + 5*3600_000)) },
  { id: 'RC-1005',    material: 'Light carbonate', inboundNode: 'Tacuba',  eta: toISO(new Date(now.getTime() + 6*3600_000)) },
  { id: 'RC-1006',    material: 'Pasta Surflex',   inboundNode: 'Pantaco', eta: toISO(new Date(now.getTime() + 7*3600_000)) },
];

const DATA_SOURCE_STATIC: DataSourceStatus = {
  ferrovalleConnected: true,
  lastExcelIngestAt: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), // shows 9:00 AM
  nextScheduledRunAt: new Date(new Date().setHours(6, 0, 0, 0)).toISOString(), // 06:00 daily
  multiUserCredentials: true,
};

const ALERTS_STATIC: Alert[] = [
  {
    id: 'ALERT-1',
    severity: 'warning',
    message: 'Pantaco + Inbound > 35 (design capacity)',
    ruleCode: 'PANTACO_PLUS_ARRIVALS_OVER_35',
    node: 'Pantaco',
    createdAt: toISO(new Date()),
  },
  {
    id: 'ALERT-2',
    severity: 'info',
    message: 'Tacuba < 15 RCs (design threshold)',
    ruleCode: 'TACUBA_UNDER_15',
    node: 'Tacuba',
    createdAt: toISO(new Date()),
  },
];

const AUDIT_STATIC: AuditEntry[] = [
  {
    id: 'AUD-1',
    ts: new Date(new Date().setHours(9, 15, 32, 0)).toISOString(), // 9:15:32 AM
    actor: 'Inti Alekhya',
    action: 'ACK_ALERT',
    meta: { alertId: 'ALERT-1' },
  },
  {
    id: 'AUD-2',
    ts: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), // 9:00 AM
    actor: 'Inti Alekhya',
    action: 'UPLOAD_EXCEL_PARSED',
    meta: { fileName: 'fileName.csv' },
  },
];

/* ========================================================================
   Page state + helpers
   ======================================================================== */
let arrivals: ArrivalForecast[] = ARRIVALS_STATIC.slice();
let alerts: Alert[] = ALERTS_STATIC.slice();
let dataSource: DataSourceStatus = { ...DATA_SOURCE_STATIC };
let audit: AuditEntry[] = AUDIT_STATIC.slice();

let filters: { material: MaterialType | 'All'; node: NodeId | 'All' } = {
  material: 'All',
  node: 'All', // set to 'Pantaco' if you want default node Pantaco
};

// typed lists for validation (strip 'All')
const MATERIALS: MaterialType[] = MATERIALS_WITH_ALL.filter(
  (m): m is MaterialType => m !== 'All'
);
const NODE_VALUES: NodeId[] = NODES_WITH_ALL.filter(
  (n): n is NodeId => n !== 'All'
);

function fmtDate(d?: string): string {
  return d ? new Date(d).toLocaleString() : '—';
}
function fmtTime(d?: string): string {
  return d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
}
function filterArrivals(src: ArrivalForecast[]): ArrivalForecast[] {
  return src.filter(a =>
    (filters.material === 'All' || a.material === filters.material) &&
    (filters.node === 'All' || a.inboundNode === filters.node)
  );
}

/* ========================================================================
   RENDERERS
   ======================================================================== */

/** KPI row exactly like the screenshot */
function renderKpis(): void {
  const container = document.getElementById('ts-kpis');
  if (!container) return;
  container.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-title">Railcar</div>
      <div class="kpi-value" id="ts-kpi-railcar-value">34 / 36</div>
      <div class="kpi-sub">Inbound NR</div>
      <div class="kpi-progress">
        <div id="ts-kpi-railcar-bar-fill" class="ts-progress-ok" style="width:0%"></div>
      </div>
    </div>

    <div class="kpi-card">
      <div class="kpi-title">Dense carbonate</div>
      <div class="kpi-value" id="ts-kpi-dense-value">16/16</div>
      <div class="kpi-sub">ETA</div>
    </div>

    <div class="kpi-card">
      <div class="kpi-title">Pantaco</div>
      <div class="kpi-value" id="ts-kpi-pantaco-value">28 / 55</div>
      <div class="kpi-sub">Inbond</div>
    </div>
  `;

  // Progress: 34/36 ≈ 94%
  const pct = Math.round((34 / 36) * 100);
  const fill = document.getElementById('ts-kpi-railcar-bar-fill');
  if (fill) (fill as HTMLElement).style.width = `${pct}%`;
}

function renderArrivals(): void {
  const tbody = document.querySelector('#ts-arrivals-table tbody') as HTMLElement | null;
  const reflection = document.getElementById('ts-arrivals-reflection');

  if (!tbody) return;

  const filtered = filterArrivals(arrivals);
  if (reflection) {
    reflection.textContent = `Showing ${filtered.length} of ${arrivals.length} arrivals — Material: ${filters.material}, Node: ${filters.node}`;
  }

  tbody.innerHTML = '';
  if (!filtered.length) {
    tbody.innerHTML = `<tr class="ts-empty-row"><td colspan="4">No arrivals for current filters.</td></tr>`;
    return;
  }

  filtered.forEach(a => {
    const tr = document.createElement('tr');
    if (a.inboundNode === 'Pantaco') {
      tr.classList.add('ts-row-pantaco');
      tr.setAttribute('title', 'Pantaco arrival (counts toward Pantaco+Arrivals rule)');
    }

    // ETA cell: for RC-DC-7001 show pill "12.00 mg" to mirror screenshot
    const etaCell =
      a.id === 'RC-DC-7001'
        ? `<span class="ts-pill">12.00 mg</span>`
        : fmtTime(a.eta);

    tr.innerHTML = `
      <td>${a.id}</td>
      <td>${a.material}</td>
      <td>${a.inboundNode}</td>
      <td>${etaCell}</td>`;
    tbody.appendChild(tr);
  });
}

function renderAlertMini(): void {
  const miniTbody = document.querySelector('#ts-alert-mini-table tbody') as HTMLElement | null;
  if (!miniTbody) return;

  const filt = filterArrivals(arrivals);
  miniTbody.innerHTML = '';

  if (!filt.length) {
    miniTbody.innerHTML = `<tr class="ts-empty-row"><td colspan="3">No arrivals for current filters.</td></tr>`;
    return;
  }

  const a = filt[0]; // show first filtered arrival (like the reference)
  const tr = document.createElement('tr');
  if (a.inboundNode === 'Pantaco') tr.classList.add('ts-row-pantaco');
  tr.innerHTML = `<td>${a.id}</td><td>${a.inboundNode}</td><td>140 km/h</td>`; // visual mimic in ETA column
  miniTbody.appendChild(tr);

  const summary = document.getElementById('ts-alert-summary');
  if (summary) {
    summary.textContent = `Showing ${filt.length} of ${arrivals.length} arrivals — Material: ${filters.material}`;
  }
}

function renderAlerts(): void {
  const ul = document.getElementById('ts-alerts'); if (!ul) return;
  ul.innerHTML = '';

  alerts.forEach(a => {
    const li = document.createElement('li');
    li.className = `ts-alert ${a.severity}`;
    li.innerHTML = `
      <div>
        <strong>${a.message}</strong>${a.node ? ` — Node: ${a.node}` : ''}
        <div class="ts-rule">Rule: ${a.ruleCode} · ${fmtDate(a.createdAt)}</div>
      </div>
      <div>
        ${a.acknowledgedAt
          ? `<span class="ts-rule" style="color:#12a150">Ack by ${a.acknowledgedBy} at ${fmtDate(a.acknowledgedAt)}</span>`
          : `<button class="btn" data-alert="${a.id}">Acknowledge</button>`}
      </div>`;
    ul.appendChild(li);
  });

  // Bind acknowledge buttons
  ul.querySelectorAll('button[data-alert]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = (ev.currentTarget as HTMLButtonElement).dataset['alert'];
      if (!id) return;
      acknowledgeAlert(id);
    });
  });
}

function renderDataSource(): void {
  const conn = document.getElementById('ts-ds-conn');
  const last = document.getElementById('ts-ds-last');
  const next = document.getElementById('ts-ds-next');
  const multi = document.getElementById('ts-ds-multi');

  if (conn)  conn.textContent = dataSource.ferrovalleConnected ? 'Connected' : 'Disconnected';
  if (last)  last.textContent = fmtDate(dataSource.lastExcelIngestAt);
  if (next)  next.textContent = 'Yes'; // mirrors screenshot text
  if (multi) multi.textContent = dataSource.multiUserCredentials ? '—' : 'No';

  const foot = document.getElementById('ts-ingest-foot');
  if (foot) {
    // Keep the screenshot-like text unless there is a fresh ingest
    foot.textContent = dataSource.lastExcelIngestAt
      ? `Last ingest at ${fmtDate(dataSource.lastExcelIngestAt)}`
      : 'UPLOAD_EXCEL_PARSED [fileName, accwa, casev]';
  }

  // Style the badge green when connected
  updateConnectionBadge();
}

/** Audit list renderer */
function renderAudit(): void {
  const ul = document.getElementById('ts-audit'); if (!ul) return;
  ul.innerHTML = '';

  audit.forEach(a => {
    const li = document.createElement('li');
    const metaStr = a.meta ? ` ${JSON.stringify(a.meta)}` : '';
    li.textContent = `[${fmtDate(a.ts)}] ${a.actor} — ${a.action}${metaStr}`;
    ul.appendChild(li);
  });
}

/* ========================================================================
   Actions
   ======================================================================== */
function acknowledgeAlert(alertId: string): void {
  alerts = alerts.map(a => a.id === alertId
    ? { ...a, acknowledgedBy: 'Inti Alekhya', acknowledgedAt: toISO(new Date()) }
    : a
  );
  audit.push({
    id: `AUD-${audit.length + 1}`,
    ts: toISO(new Date()),
    actor: 'Inti Alekhya',
    action: 'ACK_ALERT',
    meta: { alertId }
  });
  renderAlerts(); renderAudit();
}

function bindExcelUpload(): void {
  const input = document.getElementById('ts-excel-input') as HTMLInputElement | null;
  if (!input) return;
  input.addEventListener('change', () => {
    const f = input.files?.[0];
    audit.push({
      id: `AUD-${audit.length + 1}`,
      ts: toISO(new Date()),
      actor: 'Inti Alekhya',
      action: 'UPLOAD_EXCEL',
      meta: { fileName: f?.name ?? '—' }
    });
    dataSource.lastExcelIngestAt = toISO(new Date());
    renderDataSource(); renderAudit();
  });
}

/** Demo button next to file input to mimic the screenshot "Acknowle" action */
function bindAckDemoButton(): void {
  const btn = document.getElementById('ts-ack-demo');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const targetId = 'ALERT-1';
    const exists = alerts.some(a => a.id === targetId && !a.acknowledgedAt);
    if (exists) {
      acknowledgeAlert(targetId);
    } else {
      audit.push({
        id: `AUD-${audit.length + 1}`,
        ts: toISO(new Date()),
        actor: 'Inti Alekhya',
        action: 'ACK_ALERT',
        meta: { info: 'No pending ALERT-1' }
      });
      renderAudit();
    }
  });
}

/** Green badge styling for "Connected" */
function updateConnectionBadge(): void {
  const conn = document.getElementById('ts-ds-conn');
  if (!conn) return;
  conn.textContent = dataSource.ferrovalleConnected ? 'Connected' : 'Disconnected';
  (conn as HTMLElement).style.background = dataSource.ferrovalleConnected ? '#DFF3E5' : '#FDE1E1';
  (conn as HTMLElement).style.color = dataSource.ferrovalleConnected ? '#2B8643' : '#9A2E2E';
  (conn as HTMLElement).style.padding = '2px 8px';
  (conn as HTMLElement).style.borderRadius = '10px';
  (conn as HTMLElement).style.border = dataSource.ferrovalleConnected ? '1px solid #BDE4CC' : '1px solid #F5C2C2';
}

/* ========================================================================
   Filters binding (header Material + main Material/Node)
   ======================================================================== */
function bindFilters(): void {
  const topMat = document.getElementById('ts-top-material') as HTMLSelectElement | null;
  const matSel  = document.getElementById('ts-filter-material') as HTMLSelectElement | null;
  const nodeSel = document.getElementById('ts-filter-node') as HTMLSelectElement | null;

  // Defaults matching screenshot
  if (topMat) topMat.value = 'All';
  if (matSel) matSel.value = 'All';
  if (nodeSel) nodeSel.value = 'All';

  const syncMaterial = (v: string) => { if (topMat) topMat.value = v; if (matSel) matSel.value = v; };

  if (topMat) {
    topMat.addEventListener('change', () => {
      const v = topMat.value as MaterialType | 'All';
      if (v !== 'All' && !MATERIALS.includes(v)) return;
      filters.material = v; syncMaterial(v);
      renderArrivals(); renderAlertMini(); renderAlerts();
    });
  }

  if (matSel) {
    matSel.addEventListener('change', () => {
      const v = matSel.value as MaterialType | 'All';
      if (v !== 'All' && !MATERIALS.includes(v)) return;
      filters.material = v; syncMaterial(v);
      renderArrivals(); renderAlertMini(); renderAlerts();
    });
  }

  if (nodeSel) {
    nodeSel.addEventListener('change', () => {
      const v = nodeSel.value as NodeId | 'All';
      if (v !== 'All' && !NODE_VALUES.includes(v)) return;
      filters.node = v;
      renderArrivals(); renderAlertMini(); renderAlerts();
    });
  }
}

/* ========================================================================
   PUBLIC initializer (called by Angular component)
   ======================================================================== */
export function initTransitDashboard(): void {
  // 🔒 SSR guard: if running on the server, bail out to avoid "document is not defined"
  if (typeof document === 'undefined') return;

  bindFilters();
  bindExcelUpload();
  bindAckDemoButton();

  // Initial render (order matters for visual polish)
  renderKpis();
  renderArrivals();
  renderAlertMini();
  renderAlerts();
  renderDataSource();
  renderAudit();
}

/* ========================================================================
   ANGULAR STANDALONE COMPONENT (exported from this same file)
   ======================================================================== */
@Component({
  standalone: true,
  selector: 'app-transit-dashboard',
  templateUrl: './transit-dashboard.html',
  styleUrls: ['./transit-dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class TransitDashboardComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    // ✅ Only run in the browser; skip on SSR
    if (!isPlatformBrowser(this.platformId)) return;

    // Initialize the static UI (no backend required)
    initTransitDashboard();
  }
}

// Optional: auto-init for non-Angular hosting (guarded)
if (typeof document !== 'undefined') {
  const kick = () => initTransitDashboard();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', kick, { once: true });
  } else {
    // Uncomment if you want non-Angular auto-init.
    // kick();
  }
}
