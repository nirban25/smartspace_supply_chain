
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface InventoryItem {
  location: string;
  capacity: number;
  current: number;
  hazardous: boolean;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {
  lastUpdated = signal('Today at 06:00 AM');

  inventory = signal<InventoryItem[]>([
    { location: 'Pantaco Yard', capacity: 35, current: 30, hazardous: false },
    { location: 'Tacuba Yard', capacity: 15, current: 18, hazardous: false }, // Over limit
    { location: 'Vallejo Plant', capacity: 35, current: 32, hazardous: true }
  ]);

  isOverLimit(item: InventoryItem): boolean {
    return item.current > item.capacity;
  }

  utilization(item: InventoryItem): string {
    const pct = Math.round((item.current / item.capacity) * 100);
    return `${pct}%`;
  }

  alerts(): string[] {
    const alerts: string[] = [];
    this.inventory().forEach(item => {
      if (this.isOverLimit(item)) {
        alerts.push(`${item.location} exceeds capacity!`);
      }
      if (item.hazardous && item.current > item.capacity) {
        alerts.push(`Hazardous material overstock at ${item.location}!`);
      }
    });
    return alerts;
  }

  /** -----------------------------
   *  CSV Download Implementation
   *  ----------------------------- */
  private csvEscape(val: unknown): string {
    if (val === null || val === undefined) return '';
    const s = String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  private buildCsv(): string {
    const headers = ['Location', 'Capacity', 'Current', 'Utilization', 'Hazardous', 'Status'];
    const rows: string[][] = [headers];

    for (const item of this.inventory()) {
      const utilizationVal = this.utilization(item);
      const statusVal = this.isOverLimit(item) ? 'Over Limit!' : 'OK';
      rows.push([
        item.location,
        item.capacity.toString(),
        item.current.toString(),
        utilizationVal,
        item.hazardous ? 'Yes' : 'No',
        statusVal
      ]);
    }

    return rows
      .map(r => r.map(v => this.csvEscape(v)).join(','))
      .join('\n');
  }

  private triggerDownload(filename: string, text: string): void {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  onDownloadCsv(): void {
    try {
      const csv = this.buildCsv();
      // Make a tidy timestamp for the filename
      const now = new Date();
      const ts = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0')
      ].join('');
      const filename = `inventory-report-${ts}.csv`;

      this.triggerDownload(filename, csv);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Sorry, could not generate the report. See console for details.');
    }
  }
}
