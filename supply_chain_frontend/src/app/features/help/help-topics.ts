
import { HelpTopic } from './help-topic.model';

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'system-overview',
    title: 'System Overview',
    summary: 'Learn about the main features and navigation of the supply chain application.',
    sources: [],
    rules: []
  },
  {
    id: 'unloading-plan',
    title: 'Unloading Plan',
    summary: 'How to view and manage daily unloading plans for materials.',
    sources: [],
    rules: [],
    troubleshooting: [
      'If you cannot see today\'s plan, try refreshing the page.',
      'Contact support if you notice missing or incorrect data.'
    ]
  },
  {
    id: 'transit-space',
    title: 'Transit Space',
    summary: 'Monitor the movement and status of railcars in transit.',
    sources: [],
    rules: [],
    troubleshooting: [
      'If transit data is not updating, check your internet connection.'
    ]
  },
  {
    id: 'empty-car-retirement',
    title: 'Empty Car Retirement',
    summary: 'Track and manage the release of empty railcars from the plant.',
    sources: [],
    rules: []
  },
  {
    id: 'plant-inventory',
    title: 'Plant Inventory',
    summary: 'View current inventory levels for all materials in the plant.',
    sources: [],
    rules: []
  },
  {
    id: 'hazardous-materials',
    title: 'Hazardous Materials',
    summary: 'Guidance on handling and tracking hazardous materials safely.',
    sources: [],
    rules: [],
    troubleshooting: [
      'For safety concerns, contact your supervisor immediately.'
    ]
  },
  {
    id: 'daily-receipts',
    title: 'Daily Railcar Receipts',
    summary: 'Check the number of railcars received each day.',
    sources: [],
    rules: []
  },
  {
    id: 'unloading-capacity',
    title: 'Unloading Capacity',
    summary: 'Understand the unloading capacity for each operation.',
    sources: [],
    rules: []
  },
  {
    id: 'alerts',
    title: 'Alerts & Notifications',
    summary: 'How to view and respond to system alerts and notifications.',
    sources: [],
    rules: [],
    troubleshooting: [
      'If you receive an alert, follow the instructions provided or contact support.'
    ]
  },
  {
    id: 'traceability',
    title: 'Traceability & Audit',
    summary: 'Overview of how actions are tracked for compliance and auditing.',
    sources: [],
    rules: []
  }
];
