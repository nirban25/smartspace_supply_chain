
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Node capacities (from docs)
  capacities = { pantaco: 35, tacuba: 15, vallejo: 35 };

  // Key limits/targets (from docs)
  dailyReceiptLimit = 32;
  planComplianceMin = 90;        // % compliance alert threshold
  capacityDeviation = 2;         // deviation vs design to trigger alert
  emptyReleaseTarget = '1:1';    // unloaded:released ratio (target)

  // Roll‑up design inventory (concise)
  designInventorySummary = [
    { label: 'Sulfate', value: '10 + 10 stock' },
    { label: 'Dense carbonate', value: '2 + 2 stock' },
    { label: 'Light carbonate', value: '1 + 1 stock' },
    { label: 'Pasta', value: '2 + 2 stock' },
    { label: 'HLAS', value: '3 + 3 stock' },
    { label: 'Soda', value: '4 + 4 stock' },
  ];

  // Very important quick links only
  links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Unloading Plan', path: '/operations/unloading-plan' },
    { label: 'Transit', path: '/visibility/transit' },
    { label: 'HazMat', path: '/safety/hazmat' },
    { label: 'Reports', path: '/analytics/reports' },
  ];
}
