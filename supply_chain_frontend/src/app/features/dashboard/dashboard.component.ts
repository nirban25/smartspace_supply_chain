import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
 
type Row = { id:number; description:string; status:'Pending'|'In Transit'|'Delivered' };
 
@Component({
  selector: 'app-material-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
 
  /* Top horizontal cards (binded) */
  cardsRow = [
    { value: 120,    label: 'Empty Cars' },
    { value: 15,     label: 'Hazardous Materials' },
    { value: '1,280', label: 'Material Supply' }
  ];
 
  /* KPI cards for sections (dummy values — replace with live data) */
  unloadingKpis = [
    { title: 'Plan Compliance', value: '92%', desc: 'Loads unloaded vs plan' },
    { title: 'On-Time Unloading', value: '88%', desc: 'Within target time window' },
    { title: 'Avg. Unload Time', value: '42m', desc: 'Per consignment' },
  ];
  emptyCarKpis = [
    { title: 'Cars Released', value: 96, desc: 'Last 7 days' },
    { title: 'Avg. Dwell', value: '13h', desc: 'Yard dwell time' },
    { title: 'Release Rate', value: '78%', desc: 'Released within SLA' },
  ];
 
  /* Table data */
  rows: Row[] = [
    { id:1, description:'Material A', status:'Pending' },
    { id:2, description:'Material B', status:'In Transit' },
    { id:3, description:'Material C', status:'Delivered' },
    { id:4, description:'Material D', status:'Pending' }
  ];
 
  badgeClass(status: Row['status']): string {
    return status === 'Delivered' ? 'badge delivered'
         : status === 'In Transit' ? 'badge transit'
         : 'badge pending';
  }
}