import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RailcarReceiptService } from './receipt.service';
import { RailcarReceiptData, DAILY_LIMIT_TOTAL } from './receipt.models';
 
@Component({
  selector: 'app-railcar-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})
export class RailcarReceiptComponent implements OnInit {
  data?: RailcarReceiptData;
  totalComputed = 0;
  exceedsLimit = false;
  forecastExceedsLimit = false;
  readonly DAILY_LIMIT = DAILY_LIMIT_TOTAL;
 
  constructor(private svc: RailcarReceiptService) {}
 
  ngOnInit(): void {
    this.svc.loadToday().subscribe(d => {
      this.data = d;
      const status = this.svc.computeStatus(d);
      this.totalComputed = status.totalComputed;
      this.exceedsLimit = status.exceedsLimit;
      this.forecastExceedsLimit = !!status.forecastExceedsLimit;
    });
  }
 
  get lastUpdatedDisplay(): string {
    if (!this.data?.lastUpdatedIso) return '—';
    const dt = new Date(this.data.lastUpdatedIso);
    return dt.toLocaleString();
  }
}