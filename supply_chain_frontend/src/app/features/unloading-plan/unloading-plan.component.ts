
// src/app/unloading/unloading.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Material = 'Sodium sulfate' | 'HLAS' | 'Dense carbonate' | 'Soda' | 'Light carbonate' | 'Pasta Surflex';
type NodeKind = 'Pantaco' | 'Tacuba' | 'Vallejo';

interface Line {
  material: Material;
  node: NodeKind;
  plannedRc: number;
  unloadedRc: number;
}

@Component({
  selector: 'app-unloading',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unloading-plan.component.html',
  styleUrls: ['./unloading-plan.component.scss']
})
export class UnloadingPlanComponent {
  // Header bound via ngModel
  planDate = new Date().toISOString().slice(0, 10);
  planner = '';
  notes = '';

  // New line fields bound via ngModel
  newMaterial: Material | '' = '';
  newNode: NodeKind | '' = '';
  newPlannedRc = 0;
  newUnloadedRc = 0;

  // Table state
  lines: Line[] = [];

  // Dropdown options
  readonly materials: Material[] = [
    'Sodium sulfate', 'HLAS', 'Dense carbonate',
    'Soda', 'Light carbonate', 'Pasta Surflex'
  ];
  readonly nodes: NodeKind[] = ['Pantaco', 'Tacuba', 'Vallejo'];

  // Summary getters
  get totalPlanned(): number {
    return this.lines.reduce((a, l) => a + l.plannedRc, 0);
  }
  get totalUnloaded(): number {
    return this.lines.reduce((a, l) => a + l.unloadedRc, 0);
  }
  get compliancePct(): number {
    return this.totalPlanned > 0 ? Math.round((this.totalUnloaded / this.totalPlanned) * 100) : 0;
  }
  get isLowCompliance(): boolean {
    return this.compliancePct < 90;
  }

  getLineCompliance(l: Line): number {
    return l.plannedRc > 0 ? Math.round((l.unloadedRc / l.plannedRc) * 100) : 0;
  }

  // Actions
  addLine() {
    if (!this.newMaterial || !this.newNode) return;
    this.lines.push({
      material: this.newMaterial as Material,
      node: this.newNode as NodeKind,
      plannedRc: Number(this.newPlannedRc),
      unloadedRc: Number(this.newUnloadedRc),
    });
    this.newMaterial = '';
    this.newNode = '';
    this.newPlannedRc = 0;
    this.newUnloadedRc = 0;
  }

  editLine(i: number) {
    const l = this.lines[i];
    this.newMaterial = l.material;
    this.newNode = l.node;
    this.newPlannedRc = l.plannedRc;
    this.newUnloadedRc = l.unloadedRc;
    this.lines.splice(i, 1); // remove old; re-add on next Add
  }

  removeLine(i: number) {
    this.lines.splice(i, 1);
  }
  



  exportJson() {
    const payload = {
      planDate: this.planDate,
      planner: this.planner,
      notes: this.notes,
      lines: this.lines
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `unloading-${this.planDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  downloadTxt() {
  let txt = `Unloading Plan\n`;
  txt += `Date: ${this.planDate}\n`;
  txt += `Planner: ${this.planner}\n`;
  txt += `Notes: ${this.notes}\n\n`;
  txt += `Lines:\n`;
  this.lines.forEach((l, i) => {
    txt += `${i + 1}. Material: ${l.material}, Node: ${l.node}, Planned RCs: ${l.plannedRc}, Unloaded RCs: ${l.unloadedRc}, Compliance: ${this.getLineCompliance(l)}%\n`;
  });
  const blob = new Blob([txt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `unloading-${this.planDate}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
}
