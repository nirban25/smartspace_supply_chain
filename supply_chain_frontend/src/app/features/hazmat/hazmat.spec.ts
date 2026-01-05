
import { TestBed } from '@angular/core/testing';
import { HazmatComponent } from './hazmat.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('HazmatComponent (rules aligned to docs)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HazmatComponent, MatSnackBarModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HazmatComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });

  it('should compute daily receipt calc', () => {
    const fixture = TestBed.createComponent(HazmatComponent);
    const comp = fixture.componentInstance;
    const totals = comp.topStripTotals();
    expect(totals.calculated).toEqual(totals.inPlant + totals.arrivals - totals.released);
  });

  it('should flag plan compliance < 90%', () => {
    const fixture = TestBed.createComponent(HazmatComponent);
    const comp = fixture.componentInstance;
    comp.setPlannedUnloads('HLAS', 6);
    comp.setActualUnloaded('HLAS', 5); // 83%
    const alert = comp.alerts().find(a => a.ruleCode === 'PLAN_COMPLIANCE_LT_90' && a.material === 'HLAS');
    expect(alert).toBeTruthy();
  });

  it('should flag release ratio < 1', () => {
    const fixture = TestBed.createComponent(HazmatComponent);
    const comp = fixture.componentInstance;
    comp.setActualUnloaded('PASTA_CALACA', 2);
    comp.setReleasedEmpty('PASTA_CALACA', 1);
    const alert = comp.alerts().find(a => a.ruleCode === 'EMPTY_RELEASE_LT_UNLOADED' && a.material === 'PASTA_CALACA');
    expect(alert).toBeTruthy();
  });

  it('should acknowledge all alerts', () => {
    const fixture = TestBed.createComponent(HazmatComponent);
    const comp = fixture.componentInstance;
    const before = comp.alerts().filter(a => !a.acknowledged).length;
    comp.acknowledgeAlerts();
    const after = comp.alerts().filter(a => !a.acknowledged).length;
    expect(after).toBe(0);
    expect(before).toBeGreaterThanOrEqual(0);
  });
});
