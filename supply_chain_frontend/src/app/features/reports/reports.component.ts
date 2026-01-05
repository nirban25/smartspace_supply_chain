
import { Component, Input, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

// Reuse the same material & node vocabulary used in SRS
type Material =
  | 'Sodium sulfate'
  | 'HLAS'
  | 'Dense carbonate'
  | 'Soda'
  | 'Light carbonate'
  | 'Pasta Surflex';

type NodeKind = 'Pantaco' | 'Tacuba' | 'Vallejo';

interface Line {
  material: Material;
  node: NodeKind;
  plannedRc: number;
  unloadedRc: number;
}

/**
 * Simple Analytics / Reports view
 * - Accepts optional @Input() data; if empty, uses demo data.
 * - Computes totals, compliance, per-material and per-node aggregates.
 * - Exports JSON and TXT for sharing.
 * - Import button:
 *    - Enables immediately on file selection
 *    - Disables immediately on click (before async read)
 *    - Re-enables only when a new file is selected
 */
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  @Input() data: Line[] = [
    { material: 'Sodium sulfate', node: 'Pantaco', plannedRc: 5, unloadedRc: 4 },
    { material: 'HLAS',           node: 'Vallejo', plannedRc: 3, unloadedRc: 3 },
    { material: 'Dense carbonate',node: 'Tacuba',  plannedRc: 2, unloadedRc: 1 },
    { material: 'Soda',           node: 'Pantaco', plannedRc: 4, unloadedRc: 4 },
    { material: 'Light carbonate',node: 'Tacuba',  plannedRc: 1, unloadedRc: 1 },
    { material: 'Pasta Surflex',  node: 'Vallejo', plannedRc: 2, unloadedRc: 2 },
  ];

  readonly materials: Material[] = [
    'Sodium sulfate', 'HLAS', 'Dense carbonate', 'Soda', 'Light carbonate', 'Pasta Surflex'
  ];
  readonly nodes: NodeKind[] = ['Pantaco', 'Tacuba', 'Vallejo'];

  // ---- UI state for file selection & import progress ----
  hasFileSelected = false;
  importing = false;
  lastImportMsg = '';

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  // Enable button immediately on selection
  onFileSelected(input: HTMLInputElement) {
    this.hasFileSelected = !!(input.files && input.files.length > 0);
    this.cdr.markForCheck();
    // If you need a synchronous flip (rare), uncomment:
    // this.cdr.detectChanges();
  }

  // ---- Totals & compliance ----
  get totalPlanned(): number {
    return this.data.reduce((a, l) => a + l.plannedRc, 0);
  }
  get totalUnloaded(): number {
    return this.data.reduce((a, l) => a + l.unloadedRc, 0);
  }
  get compliancePct(): number {
    return this.totalPlanned > 0 ? Math.round((this.totalUnloaded / this.totalPlanned) * 100) : 0;
  }
  get isLowCompliance(): boolean {
    return this.compliancePct < 90; // per SRS threshold
  }

  // ---- Line compliance ----
  getLineCompliance(l: Line): number {
    return l.plannedRc > 0 ? Math.round((l.unloadedRc / l.plannedRc) * 100) : 0;
  }

  // ---- Aggregations ----
  aggByMaterial() {
    const map: Record<Material, { planned: number; unloaded: number; compliance: number }> = {
      'Sodium sulfate': { planned: 0, unloaded: 0, compliance: 0 },
      'HLAS': { planned: 0, unloaded: 0, compliance: 0 },
      'Dense carbonate': { planned: 0, unloaded: 0, compliance: 0 },
      'Soda': { planned: 0, unloaded: 0, compliance: 0 },
      'Light carbonate': { planned: 0, unloaded: 0, compliance: 0 },
      'Pasta Surflex': { planned: 0, unloaded: 0, compliance: 0 }
    };
    for (const l of this.data) {
      const m = map[l.material];
      m.planned += l.plannedRc;
      m.unloaded += l.unloadedRc;
    }
    for (const k of this.materials) {
      const m = map[k];
      m.compliance = m.planned > 0 ? Math.round((m.unloaded / m.planned) * 100) : 0;
    }
    return map;
  }

  aggByNode() {
    const map: Record<NodeKind, { planned: number; unloaded: number; compliance: number }> = {
      Pantaco: { planned: 0, unloaded: 0, compliance: 0 },
      Tacuba:  { planned: 0, unloaded: 0, compliance: 0 },
      Vallejo: { planned: 0, unloaded: 0, compliance: 0 },
    };
    for (const l of this.data) {
      const n = map[l.node];
      n.planned += l.plannedRc;
      n.unloaded += l.unloadedRc;
    }
    for (const k of this.nodes) {
      const n = map[k];
      n.compliance = n.planned > 0 ? Math.round((n.unloaded / n.planned) * 100) : 0;
    }
    return map;
  }

  // ---- Exporters ----
  exportJson() {
    const payload = {
      summary: {
        totalPlanned: this.totalPlanned,
        totalUnloaded: this.totalUnloaded,
        compliancePct: this.compliancePct
      },
      byMaterial: this.aggByMaterial(),
      byNode: this.aggByNode(),
      raw: this.data
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `reports-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadTxt() {
    const byM = this.aggByMaterial();
    const byN = this.aggByNode();

    let txt = '';
    txt += `Reports\n`;
    txt += `Date: ${new Date().toISOString().slice(0,10)}\n\n`;

    txt += `Summary\n`;
    txt += `  Total Planned:  ${this.totalPlanned}\n`;
    txt += `  Total Unloaded: ${this.totalUnloaded}\n`;
    txt += `  Compliance:     ${this.compliancePct}%\n`;
    txt += `  Status:         ${this.isLowCompliance ? '⚠️ Low compliance (<90%)' : '✅ OK'}\n\n`;

    txt += `By Material\n`;
    this.materials.forEach(m => {
      const s = byM[m];
      txt += `  - ${m}: planned=${s.planned}, unloaded=${s.unloaded}, compliance=${s.compliance}%\n`;
    });
    txt += `\nBy Node\n`;
    this.nodes.forEach(n => {
      const s = byN[n];
      txt += `  - ${n}: planned=${s.planned}, unloaded=${s.unloaded}, compliance=${s.compliance}%\n`;
    });

    txt += `\nRaw Lines\n`;
    this.data.forEach((l, i) => {
      txt += `  ${i + 1}. material=${l.material}, node=${l.node}, planned=${l.plannedRc}, unloaded=${l.unloadedRc}\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `reports-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- Import (disable immediately & clear input after) ----
  importSelectedFile(input: HTMLInputElement) {
    // No file or already importing
    if (!input.files || input.files.length === 0 || this.importing) return;

    const file = input.files[0];

    // 1) Disable immediately & show status
    this.importing = true;
    this.hasFileSelected = false; // disables button right away
    this.lastImportMsg = `Importing ${file.name} ...`;
    this.cdr.markForCheck();
    // this.cdr.detectChanges(); // uncomment if you need a synchronous UI flip

    const reader = new FileReader();

    reader.onload = () => {
      // Ensure CD runs even zone-less
      this.ngZone.run(() => {
        try {
          const obj = JSON.parse(reader.result as string);
          const parsed = this.extractLinesFromJson(obj);
          if (parsed) {
            this.data = parsed;
            this.lastImportMsg = `Imported ${parsed.length} lines from ${file.name}`;
          } else {
            alert('No valid data found in JSON.');
            this.lastImportMsg = '';
          }
        } catch {
          alert('Invalid JSON file.');
          this.lastImportMsg = '';
        } finally {
          // 2) Clear file selection so the same file can be re-imported
          input.value = '';
          // 3) End importing; button remains disabled until a new file is chosen
          this.importing = false;
          this.hasFileSelected = false;
          this.cdr.markForCheck();
        }
      });
    };

    reader.onerror = () => {
      this.ngZone.run(() => {
        alert('Error reading the file.');
        input.value = '';
        this.importing = false;
        this.hasFileSelected = false;
        this.lastImportMsg = '';
        this.cdr.markForCheck();
      });
    };

    reader.readAsText(file);
  }

  /**
   * Accept JSON with:
   *  - { lines: Line[] } (from Unloading)
   *  - { raw: Line[] }   (from Reports export)
   *  - Line[]            (plain array)
   */
  private extractLinesFromJson(obj: any): Line[] | null {
    if (Array.isArray(obj?.lines)) return obj.lines as Line[];
    if (Array.isArray(obj?.raw))   return obj.raw as Line[];
    if (Array.isArray(obj))        return obj as Line[];
    return null;
  }
}
