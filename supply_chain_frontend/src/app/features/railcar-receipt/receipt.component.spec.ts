import { RailcarReceiptService } from './receipt.service';
import { RailcarReceiptData } from './receipt.models';
 
describe('RailcarReceiptService.computeStatus', () => {
  const svc = new RailcarReceiptService();
 
  it('computes total and flags over limit', () => {
    const data: RailcarReceiptData = {
      carsInPlantTotal: 30,
      arrivalsToday: 6,
      releasedToFerrovalle: 3,
    };
    const status = svc.computeStatus(data);
    expect(status.totalComputed).toBe(33);
    expect(status.exceedsLimit).toBe(true);
  });
 
  it('computes forecast exceedance using planned arrivals', () => {
    const data: RailcarReceiptData = {
      carsInPlantTotal: 25,
      arrivalsToday: 2,
      releasedToFerrovalle: 5,
      plannedArrivals: 15
    };
    const status = svc.computeStatus(data);
    expect(status.totalComputed).toBe(22);
    expect(status.exceedsLimit).toBe(false);
    expect(status.forecastExceedsLimit).toBe(true);
  });
 
  it('handles missing values safely', () => {
    const status = svc.computeStatus({ carsInPlantTotal: 0, arrivalsToday: 0, releasedToFerrovalle: 0 });
    expect(status.totalComputed).toBe(0);
    expect(status.exceedsLimit).toBe(false);
    expect(status.forecastExceedsLimit).toBe(false);
  });
});