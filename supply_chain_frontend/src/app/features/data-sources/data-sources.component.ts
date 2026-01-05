
// src/app/features/data-sources/data-sources.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

/** Domain models */
export interface DataSourceItem {
  id: string;
  name: string;
  category:
    | 'Inventory'
    | 'Shipment'
    | 'Transit'
    | 'Compliance'
    | 'Email'
    | 'Excel'
    | 'Collaboration'
    | 'Portal';
  origin: 'Excel' | 'Email' | 'Web' | 'API' | 'InternalDB' | 'Teams' | 'SharePoint' | 'LocalPC';
  owner?: string;          // e.g., "Raul Jimenez", "Amado Mena", "HTM Resource"
  frequency?: string;      // e.g., "Daily / 6:00 am", "Real-time"
  description?: string;    // short purpose/use
  endpoint?: string;       // URL, mailbox, Teams channel, path, etc.
  enabled: boolean;
}

export interface IntegrationConnector {
  id: string;
  name: string;            // e.g., "ETL: Email Attachments", "API: Teams"
  type: 'ETL' | 'API' | 'Ingestion' | 'Job';
  schedule?: string;       // e.g., "cron(0 6 * * *)"
  sourceIds: string[];     // links to DataSourceItem ids
  destination: string;     // e.g., "Central DB", "Data Lake", "Kafka topic"
  status: 'active' | 'paused' | 'error';
  lastRun?: string;
}

/** Mock starter data (replace with service calls) */
const STARTER_SOURCES: DataSourceItem[] = [
  {
    id: 'src-inventory-plant',
    name: 'Plant Inventory Report',
    category: 'Inventory',
    origin: 'Email',
    owner: 'HTM Resource',
    frequency: 'Daily / 6:00 am',
    description: 'Railcar counts by material; triggers threshold alerts.',
    endpoint: 'mailbox:Inventory of Tracks',
    enabled: true
  },
  {
    id: 'src-inventory-pantaco',
    name: 'Pantaco Inventory',
    category: 'Transit',
    origin: 'Web',
    owner: 'Ferrovalle Platform',
    frequency: 'Daily / 6:00 am',
    description: 'Designed capacity 35 railcars; Excel export.',
    endpoint: 'https://ferrovalle.example.com/diverse-systems',
    enabled: true
  },
  {
    id: 'src-inventory-tacuba',
    name: 'Tacuba Inventory',
    category: 'Transit',
    origin: 'Web',
    owner: 'Ferrovalle Platform',
    frequency: 'Daily / 6:00 am',
    description: 'Designed capacity 15 railcars; Excel export.',
    endpoint: 'https://ferrovalle.example.com/diverse-systems',
    enabled: true
  },
  {
    id: 'src-shipment-report',
    name: 'Daily Shipment Report',
    category: 'Shipment',
    origin: 'Excel',
    owner: 'Supplier',
    frequency: 'Daily / 6:00 am',
    description: 'Supplier shipments by material for Vallejo.',
    endpoint: 'sharepoint:/sites/supply/ShipmentReport.xlsx',
    enabled: true
  },
  {
    id: 'src-htm-compliance',
    name: 'HTM Plan Compliance',
    category: 'Compliance',
    origin: 'InternalDB',
    owner: 'HTM System',
    frequency: 'Real-time',
    description: 'Completed unloading registry & progress monitoring.',
    endpoint: 'db:htm://compliance',
    enabled: true
  },
  {
    id: 'src-unloading-plan',
    name: 'Unloading Plan Excel',
    category: 'Excel',
    origin: 'LocalPC',
    owner: 'Raul Jimenez',
    frequency: 'Daily / 6:00 am',
    description: 'Operations plan: planned vs actual unload.',
    endpoint: 'file://C:/operations/unloading-plan.xlsx',
    enabled: false
  },
  {
    id: 'src-release-email',
    name: 'Release Email (Empty Cars)',
    category: 'Email',
    origin: 'Email',
    owner: 'Amado Mena',
    frequency: 'Daily / 6:00 am',
    description: '#RCs released to FFCC; audit trail.',
    endpoint: 'mailbox:Release Email',
    enabled: true
  },
  {
    id: 'src-teams-road-throughput',
    name: 'Teams: Road Throughput - LL & SNO',
    category: 'Collaboration',
    origin: 'Teams',
    owner: 'Operations',
    frequency: 'Real-time',
    description: 'Plan communication, photo uploads, alerts.',
    endpoint: 'teams://Road Throughput - LL & SNO',
    enabled: true
  },
  {
    id: 'src-ferrovalle-portal',
    name: 'Ferrovalle Divers Services Portal',
    category: 'Portal',
    origin: 'Web',
    owner: 'Ferrovalle',
    frequency: 'Daily / 6:00 am',
    description: 'Release management for empty cars.',
    endpoint: 'https://ferrovalle.example.com/releases',
    enabled: true
  }
];

const STARTER_CONNECTORS: IntegrationConnector[] = [
  {
    id: 'etl-email-inventory',
    name: 'ETL: Email Attachments (Inventory)',
    type: 'ETL',
    schedule: 'cron(0 6 * * *)',
    sourceIds: ['src-inventory-plant'],
    destination: 'Central DB',
    status: 'active',
    lastRun: '2025-12-30T06:00:07Z'
  },
  {
    id: 'api-teams',
    name: 'API: Teams Connector',
    type: 'API',
    schedule: 'event-driven',
    sourceIds: ['src-teams-road-throughput'],
    destination: 'Notifications Service',
    status: 'active',
    lastRun: '2025-12-31T07:45:13Z'
  },
  {
    id: 'ingest-ferrovalle-excel',
    name: 'Ingestion: Ferrovalle Excel Export',
    type: 'Ingestion',
    schedule: 'cron(0 6 * * *)',
    sourceIds: ['src-inventory-pantaco', 'src-inventory-tacuba'],
    destination: 'Data Lake Bronze',
    status: 'paused',
    lastRun: '2025-12-29T06:00:00Z'
  },
  {
    id: 'etl-release-vs-unloaded',
    name: 'ETL: Release vs Unloaded Ratio',
    type: 'Job',
    schedule: 'cron(0 6 * * *)',
    sourceIds: ['src-release-email', 'src-unloading-plan'],
    destination: 'Central DB',
    status: 'error',
    lastRun: '2025-12-30T06:01:54Z'
  }
];

@Component({
  selector: 'app-data-sources',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // ✅ fixes NG8103 & NG8002
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataSourcesComponent {
  /** State */
  dataSources: DataSourceItem[] = STARTER_SOURCES;
  connectors: IntegrationConnector[] = STARTER_CONNECTORS;

  /** Simple filter form (category / text / enabled) */
  filterForm: FormGroup;

  /** UI flags */
  showConnectors = true;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      search: [''],
      category: ['All'],
      enabledOnly: [false]
    });
  }

  /** Derived list for the template */
  get filteredSources(): DataSourceItem[] {
    const { search, category, enabledOnly } = this.filterForm.value;
    return this.dataSources.filter(ds => {
      const matchesText =
        !search ||
        ds.name.toLowerCase().includes(search.toLowerCase()) ||
        (ds.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (ds.owner ?? '').toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === 'All' || ds.category === category;
      const matchesEnabled = !enabledOnly || ds.enabled;

      return matchesText && matchesCategory && matchesEnabled;
    });
  }

  /** Helper for chips */
  countByCategory(cat: DataSourceItem['category']): number {
    return this.dataSources.filter(d => d.category === cat).length;
  }

  /** Toggle a connector status for demo */
  toggleConnector(connId: string): void {
    this.connectors = this.connectors.map(c =>
      c.id === connId
        ? {
            ...c,
            status: c.status === 'active' ? 'paused' : 'active',
            lastRun: new Date().toISOString()
          }
        : c
    );
  }

  /** Enable/disable a data source for demo */
  toggleSource(srcId: string): void {
    this.dataSources = this.dataSources.map(s =>
      s.id === srcId ? { ...s, enabled: !s.enabled } : s
    );
  }

  /** Connector lookups used in the UI */
  sourcesFor(connector: IntegrationConnector): DataSourceItem[] {
    return this.dataSources.filter(s => connector.sourceIds.includes(s.id));
  }

  /** Category list for select */
  categories(): Array<DataSourceItem['category'] | 'All'> {
    return ['All', 'Inventory', 'Shipment', 'Transit', 'Compliance', 'Email', 'Excel', 'Collaboration', 'Portal'];
  }
}
