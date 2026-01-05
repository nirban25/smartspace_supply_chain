import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RailcarReceiptData, DAILY_LIMIT_TOTAL } from './receipt.models';
 
@Injectable({ providedIn: 'root' })
export class RailcarReceiptService {
  /**
   * Simulated loader — replace with a real HttpClient call to your backend that
   * consolidates data from emails/files (e.g., "RECIBOS DE FFCC TRANSFER") and inventory systems.
   */
  loadToday(): Observable<RailcarReceiptData> {
    return of({
      carsInPlantTotal: 28,
      arrivalsToday: 6,
      releasedToFerrovalle: 3,
      plannedArrivals: 5,
      breakdownByMaterial: [
        { material: 'Sodium sulfate', carsInPlant: 12 },
        { material: 'HLAS', carsInPlant: 6 },
        { material: 'Dense carbonate', carsInPlant: 4 },
        { material: 'Soda', carsInPlant: 3 },
        { material: 'Light carbonate', carsInPlant: 2 },
        { material: 'Pasta Surflex', carsInPlant: 1 },
      ],
      lastUpdatedIso: new Date().toISOString(),
      dataSource: 'RECIBOS DE FFCC TRANSFER'
    });
  }
 
  /**
   * Compute totals and threshold flags according to spec:
   * Total = #RCs in plant + #RCs arrival − #RCs released to FCC
   * Alert if Total > 32
   * Forecast alert if plannedArrivals + carsInPlantTotal − releasedToFerrovalle > 32
   */
  computeStatus(data: RailcarReceiptData) {
    const totalComputed =
      (data.carsInPlantTotal || 0) +
      (data.arrivalsToday || 0) -
      (data.releasedToFerrovalle || 0);
 
    const exceedsLimit = totalComputed > DAILY_LIMIT_TOTAL;
 
    const planned = data.plannedArrivals ?? 0;
    const forecast =
      planned +
      (data.carsInPlantTotal || 0) -
      (data.releasedToFerrovalle || 0);
 
    const forecastExceedsLimit = forecast > DAILY_LIMIT_TOTAL;
 
    return { totalComputed, exceedsLimit, forecastExceedsLimit };
  }
}