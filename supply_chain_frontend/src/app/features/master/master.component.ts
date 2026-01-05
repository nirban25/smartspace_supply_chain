
import { Component, HostListener, signal, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Router, RouterModule, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { MatSidenavModule }    from '@angular/material/sidenav';
import { MatToolbarModule }    from '@angular/material/toolbar';
import { MatIconModule }       from '@angular/material/icon';
import { MatButtonModule }     from '@angular/material/button';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MatDividerModule }    from '@angular/material/divider';

@Component({
  selector: 'app-master',
  standalone: true,
  imports: [
    CommonModule, NgFor, NgIf,
    RouterModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatIconModule,
    MatButtonModule, MatExpansionModule, MatDividerModule
  ],
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss'],
})
export class MasterComponent {
  // ---- Signals (no "is..." prefix to avoid method name collision) ----
  sideOpen    = signal(false);
  profileOpen = signal(false);

  @ViewChildren(MatExpansionPanel) panels!: QueryList<MatExpansionPanel>;

  navGroups = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      children: [{ label: 'Overview', route: '/dashboard' }]
    },
    {
      label: 'Operations',
      icon: 'work',
      children: [
        { label: 'Unloading Plan', route: '/operations/unloading-plan' },
        { label: 'Unloading Capacity', route: '/operations/unloading-capacity' },
        { label: 'Daily Receipts', route: '/operations/receipts' },
        { label: 'Empty Car Release', route: '/operations/empty-release' }
      ]
    },
    {
      label: 'Visibility',
      icon: 'visibility',
      children: [
        { label: 'Plant Inventory', route: '/visibility/inventory' },
        { label: 'Nodes (Pantaco & Tacuba)', route: '/visibility/nodes' },
        { label: 'Transit Space (Ferrovalle)', route: '/visibility/transit' },
        { label: 'Circuit Map', route: '/visibility/map' }
      ]
    },
    {
      label: 'Safety & Compliance',
      icon: 'verified_user',
      children: [
        { label: 'Hazardous Materials', route: '/safety/hazmat' },
        { label: 'Alerts & Notifications', route: '/safety/alerts' },
        { label: 'Traceability & Audit', route: '/safety/audit' }
      ]
    },
    {
      label: 'Analytics',
      icon: 'insights',
      children: [{ label: 'Reports', route: '/analytics/reports' }]
    },
    {
      label: 'Setup',
      icon: 'settings',
      children: [
        { label: 'Data Sources & Integrations', route: '/setup/data-sources' },
        { label: 'Masters', route: '/setup/masters' },
        { label: 'Admin', route: '/setup/admin' },
        { label: 'Help', route: '/setup/help' }
      ]
    }
  ];

  constructor(private router: Router) {
    // Close overlays on route changes for better UX
    this.router.events.subscribe(() => {
      this.sideOpen.set(false);
      this.profileOpen.set(false);
    });
  }

  // ---- Sidenav controls ----
  toggleSideNav() { this.sideOpen.update(x => !x); }
  closeSideNav()  {
    this.sideOpen.set(false);
    if (this.panels) {
      this.panels.forEach(panel => panel.close());
    }
  }

  // ---- Profile menu controls ----
  toggleProfile() { this.profileOpen.update(x => !x); }
  closeProfile()  { this.profileOpen.set(false); }

  // ---- Navigate and close profile in one call ----
  navigateAndClose(path: string) {
    this.closeProfile();
    this.router.navigate([path]);
  }

  // ---- Keyboard: ESC closes profile ----
  @HostListener('document:keydown.escape')
  onEsc() { this.closeProfile(); }

  // ---- Clicking inside content area closes profile ----
  onContentClick() { this.closeProfile(); }
}
