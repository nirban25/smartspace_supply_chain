
import { Component, signal, computed, Input, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

type AlertKind = 'info' | 'success' | 'warning' | 'error';

interface AlertItem {
  id: string;
  kind: AlertKind;
  title?: string;
  message: string;
  autoDismiss: boolean;
  durationMs: number;
  createdAt: number;
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './alerts.component.html',   // <-- must exist with this exact name & path
  styleUrls: ['./alerts.component.scss'],   // <-- must exist with this exact name & path
})
export class AlertsComponent implements OnInit {
  @Input() collapsed = false;
  private readonly list = signal<AlertItem[]>([]);
  readonly alerts = computed(() => this.list());

  ngOnInit(): void {
    // Demo content so the page isn't blank
    this.warning('⚠️ Compliance below 90%.', 'Compliance Alert', { autoDismiss: false });
    this.info('You can trigger alerts programmatically from any page.', 'How to use');
  }

  push(kind: AlertKind, message: string, title?: string, opts?: { autoDismiss?: boolean; durationMs?: number }) {
    const id = Math.random().toString(36).slice(2, 10);
    const item: AlertItem = {
      id, kind, title, message,
      autoDismiss: opts?.autoDismiss ?? true,
      durationMs: Math.max(1000, opts?.durationMs ?? 5000),
      createdAt: Date.now(),
    };
    this.list.update(arr => [item, ...arr]);
    if (item.autoDismiss) setTimeout(() => this.remove(id), item.durationMs);
  }

  info(message: string, title?: string, opts?: { autoDismiss?: boolean; durationMs?: number })    { this.push('info',    message, title, opts); }
  success(message: string, title?: string, opts?: { autoDismiss?: boolean; durationMs?: number }) { this.push('success', message, title, opts); }
  warning(message: string, title?: string, opts?: { autoDismiss?: boolean; durationMs?: number }) { this.push('warning', message, title, opts); }
  error(message: string, title?: string, opts?: { autoDismiss?: boolean; durationMs?: number })   { this.push('error',   message, title, opts); }

  remove(id: string) { this.list.update(arr => arr.filter(a => a.id !== id)); }
  clear()            { this.list.set([]); }
}
