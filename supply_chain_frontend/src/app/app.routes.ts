
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Auth
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/register/register.component').then(m => m.RegisterComponent),
  },

  // Shell
  {
    path: '',
    loadComponent: () =>
      import('./features/master/master.component').then(m => m.MasterComponent),
    children: [
      // ===== Default redirect (pick one) =====
      // Option A: dashboard is the default
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // Option B: home is the default
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      // ===== Home (minimal overview + quick links) =====
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then(m => m.HomeComponent),
      },

      // ===== Dashboard =====
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },

      // ===== Operations =====
      {
        path: 'operations/unloading-plan',
        loadComponent: () =>
          import('./features/unloading-plan/unloading-plan.component').then(m => m.UnloadingPlanComponent),
      },
      {
        path: 'operations/unloading-capacity',
        loadComponent: () =>
          import('./features/unloading-capacity/unloading-capacity.component').then(m => m.UnloadingCapacityComponent),
      },
      {
        path: 'operations/receipts',
        loadComponent: () =>
          import('./features/railcar-receipt/receipt.component').then(m => m.RailcarReceiptComponent),
      },
      {
        path: 'operations/empty-release',
        loadComponent: () =>
          import('./features/empty-car/empty-car-dashboard/empty-car-dashboard')
            .then(m => m.EmptyCarDashboardComponent),
      },

      // ===== Visibility =====
      {
        path: 'visibility/inventory',
        loadComponent: () =>
          import('./features/inventory/inventory.component').then(m => m.InventoryComponent),
      },
      {
        path: 'visibility/nodes',
        loadComponent: () =>
          import('./features/nodes/nodes.component').then(m => m.NodesComponent),
      },
      {
        path: 'visibility/transit',
        loadComponent: () =>
          import('./features/transit-space/transit-dashboard/transit-dashboard').then(m => m.TransitDashboardComponent),
      },
      {
        path: 'visibility/map',
        loadComponent: () =>
          import('./features/map/map.component').then(m => m.MapComponent),
      },

      // ===== Safety & Compliance =====
      {
        path: 'safety/hazmat',
        loadComponent: () =>
          import('./features/hazmat/hazmat.component').then(m => m.HazmatComponent),
      },
      {
        path: 'safety/alerts',
        loadComponent: () =>
          import('./features/alerts/alerts.component').then(m => m.AlertsComponent),
      },
      {
        path: 'safety/audit',
        loadComponent: () =>
          import('./features/traceability/traceability.component').then(m => m.TraceabilityComponent),
      },

      // ===== Analytics =====
      {
        path: 'analytics/reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then(m => m.ReportsComponent),
      },

      // ===== Setup =====
      {
        path: 'setup/data-sources',
        loadComponent: () =>
          import('./features/data-sources/data-sources.component').then(m => m.DataSourcesComponent),
      },
      {
        path: 'setup/masters',
        loadComponent: () =>
          import('./features/masters/masters.component').then(m => m.MastersComponent),
      },
      {
        path: 'setup/admin',
        loadComponent: () =>
          import('./features/admin/admin.component').then(m => m.AdminComponent),
      },
      {
        path: 'setup/help',
        loadComponent: () =>
          import('./features/help/help.component').then(m => m.HelpComponent),
      },

      // ===== Account (new) =====
      {
        path: 'account/profile',
        loadComponent: () =>
          import('./features/account/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'account/settings',
        loadComponent: () =>
          import('./features/account/settings/settings.component').then(m => m.SettingsComponent),
      },

      // ===== General Help (optional if you keep setup/help) =====
      {
        path: 'help',
        loadComponent: () =>
          import('./features/help/help.component').then(m => m.HelpComponent),
      },

      // ===== Wildcard =====
      { path: '**', redirectTo: 'home' } // or 'dashboard' if you prefer
    ],
  },
];
