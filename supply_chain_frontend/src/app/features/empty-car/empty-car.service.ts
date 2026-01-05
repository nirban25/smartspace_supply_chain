
import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmptyCarReleaseMetrics, ReleaseDraft, ActivityEvent } from './empty-car.types';

const FV_PORTAL_URL = 'https://fv.example.com/sistemas-de-gestion-y-liberaciones'; // TODO: real URL

@Injectable({ providedIn: 'root' })
export class EmptyCarServiceComponent {
  /** Demo: replace with actual ETL/parse for Unload Plan Excel + Release Email */
  fetchMetrics(): Observable<EmptyCarReleaseMetrics> {
    const unloaded = 20; // from Unload Plan Excel
    const released = 18; // from Release Email / portal data
    return of({
      unloadedCars: unloaded,
      releasedCars: released,
      lastUpdatedISO: new Date().toISOString(),
      sources: {
        unloadPlanExcel: '/data/unload-plan.xlsx',
        releaseEmail: '/data/release-email.eml',
        fvPortal: FV_PORTAL_URL
      },
      owner: 'Amado Mena'
    });
  }

  /** Launch FV portal robustly: tries window.open, then falls back to an <a> click */
  openPortal(url?: string): void {
    const targetUrl = url || FV_PORTAL_URL;
    // Try window.open first
    const win = window.open(targetUrl, '_blank', 'noopener,noreferrer');
    if (win && !win.closed) return; // success

    // Fallback (for popup blockers): create an anchor and click it
    const anchor = document.createElement('a');
    anchor.href = targetUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  /** One-shot timer for next local 06:00; resubscribe to keep daily cadence */
  createDailySixAMTimer(): Observable<Date> {
    const next = this.nextSixAM();
    const msUntilNext = next.getTime() - Date.now();
    return timer(Math.max(msUntilNext, 0)).pipe(map(() => next));
  }

  private nextSixAM(): Date {
    const now = new Date();
    const target = new Date(now);
    target.setHours(6, 0, 0, 0);
    if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
    return target;
  }

  buildActivityEvent(user: string, draft: ReleaseDraft): ActivityEvent {
    const action = `Drafted release for ${draft.carIds.join(', ')}${draft.notes ? ` — ${draft.notes}` : ''}`;
    return {
      id: `ev-${Date.now()}`,
      user,
      action,
      timestampISO: new Date().toISOString()
    };
  }
}
