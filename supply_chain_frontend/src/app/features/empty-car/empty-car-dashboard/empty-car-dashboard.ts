
import { Component, OnDestroy, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { EmptyCarServiceComponent } from '../empty-car.service'; // ✅ fixed path
import { EmptyCarReleaseMetrics, AlertItem, ActivityEvent, ReleaseDraft } from '../empty-car.types'; // ✅ fixed path

@Component({
  selector: 'empty-car-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empty-car-dashboard.html',
  styleUrls: ['./empty-car-dashboard.scss'] // ✅ ensure this file exists in the same folder
})
export class EmptyCarDashboardComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private svc: EmptyCarServiceComponent = inject(EmptyCarServiceComponent); // ✅ explicit type fixes unknown errors

  metrics = signal<EmptyCarReleaseMetrics | null>(null);
  alerts  = signal<AlertItem[]>([]);
  events  = signal<ActivityEvent[]>([]);

  ratio = computed(() => {
    const m = this.metrics();
    if (!m) return 1;
    return m.unloadedCars === 0 ? 1 : m.releasedCars / m.unloadedCars;
  });

  hasAlert = computed(() => {
    const m = this.metrics();
    return !!m && m.releasedCars < m.unloadedCars;
  });

  releaseForm = this.fb.group({
    carIdsText: ['', [Validators.required]],
    notes: ['']
  });

  private subs: Subscription[] = [];

  constructor() {
    effect(() => {
      const m = this.metrics();
      if (!m) return;
      if (m.releasedCars < m.unloadedCars) {
        const alert: AlertItem = {
          id: `alert-release-ratio-${Date.now()}`,
          severity: 'critical',
          message: '⚠️ Alert — Released < Unloaded. Maintain a 1:1 ratio and formalize releases via FV portal.',
          timestampISO: new Date().toISOString()
        };
        const current = this.alerts();
        if (!current.some(a => a.message === alert.message)) {
          this.alerts.set([alert, ...current]);
        }
      }
    });
  }

  ngOnInit(): void {
    this.refresh();
    const first = this.svc.createDailySixAMTimer().subscribe(() => {
      this.refresh();
      const again = this.svc.createDailySixAMTimer().subscribe(() => this.refresh());
      this.subs.push(again);
    });
    this.subs.push(first);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  /** Button: Refresh */
  onRefreshClick(): void {
    this.refresh();
  }

  private refresh(): void {
    const sub = this.svc.fetchMetrics()
      .subscribe((m: EmptyCarReleaseMetrics) => this.metrics.set(m)); // ✅ explicit type keeps TS happy
    this.subs.push(sub);
  }

  /** Button: Open FV Portal */
  onOpenPortalClick(): void {
    const url = this.metrics()?.sources.fvPortal;
    this.svc.openPortal(url);
  }

  /** Button: Go to FV Portal & Release (submit) */
  onSubmitRelease(): void {
    if (this.releaseForm.invalid) return;

    const ids = (this.releaseForm.value.carIdsText ?? '')
      .split(/[,\s]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const draft: ReleaseDraft = {
      carIds: ids,
      notes: this.releaseForm.value.notes ?? ''
    };

    // Traceability event (local audit)
    const ev = this.svc.buildActivityEvent('Inti Alekhya', draft);
    this.events.set([ev, ...this.events()]);

    // Formalize release via FV portal
    const url = this.metrics()?.sources.fvPortal;
    this.svc.openPortal(url);

    // Reset form
    this.releaseForm.reset({ carIdsText: '', notes: '' });
  }
}
