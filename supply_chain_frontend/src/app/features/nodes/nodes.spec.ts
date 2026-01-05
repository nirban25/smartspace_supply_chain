
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NodesComponent, NodeInventory } from './nodes.component';

describe('NodesComponent (standalone)', () => {
  let fixture: ComponentFixture<NodesComponent>;
  let component: NodesComponent;

  const pantaco: NodeInventory = {
    name: 'Pantaco',
    capacity: 35,
    inventoryByMaterial: { sodiumSulfate: 30 },
    forecastArrivals: 6,
    unloadingPlan: { plannedRCs: 10, unloadedRCs: 8 }, // 80% -> warning
    hazardousAtNode: { sodium: 0, pastaCalaca: 0, HLAS: 0 },
    lastUpdatedIso: new Date().toISOString()
  };

  const tacuba: NodeInventory = {
    name: 'Tacuba',
    capacity: 15,
    inventoryByMaterial: { sodiumSulfate: 14, soda: 2 }, // total 16 -> critical
    forecastArrivals: 0,
    unloadingPlan: { plannedRCs: 5, unloadedRCs: 5 }, // 100%
    hazardousAtNode: { sodium: 1, pastaCalaca: 0, HLAS: 0 }, // hazardous present -> critical
    lastUpdatedIso: new Date().toISOString()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NodesComponent);
    component = fixture.componentInstance;
    component.nodes = [pantaco, tacuba];
    component.ngOnChanges();
    fixture.detectChanges();
  });

  it('computes metrics correctly', () => {
    const m = component.metrics();
    const pantacoMetrics = m.find(mm => mm.node === 'Pantaco')!;
    expect(pantacoMetrics.total).toBe(30);
    expect(pantacoMetrics.projected).toBe(36); // 30 + 6
    expect(pantacoMetrics.utilizationPct).toBe(Math.round((30 / 35) * 100));
  });

  it('clamps progress width to 100%', () => {
    expect(component.clampPct(120)).toBe(100);
    expect(component.clampPct(-5)).toBe(0);
    expect(component.clampPct(55)).toBe(55);
  });

  it('returns material qty safely', () => {
    expect(component.getMaterialQtyNode('Tacuba', 'soda')).toBe(2);
    expect(component.getMaterialQtyNode('Pantaco', 'HLAS')).toBe(0);
  });

  it('raises warnings for transit over capacity (Pantaco projected > capacity)', () => {
    const alerts = component.alerts();
    const a = alerts.find(x => x.node === 'Pantaco' && x.code === 'TRANSIT_OVER_CAPACITY');
    expect(a).toBeTruthy();
    expect(a!.severity).toBe('warning');
  });

  it('raises warning for plan compliance < 90%', () => {
    const alerts = component.alerts();
    const a = alerts.find(x => x.node === 'Pantaco' && x.code === 'PLAN_COMPLIANCE_LOW');
    expect(a).toBeTruthy();
    expect(a!.severity).toBe('warning');
  });

  it('raises critical when node total exceeds capacity', () => {
    const alerts = component.alerts();
    const a = alerts.find(x => x.node === 'Tacuba' && x.code === 'CAPACITY_EXCEEDED');
    expect(a).toBeTruthy();
    expect(a!.severity).toBe('critical');
  });

  it('raises critical when hazardous materials are present at intermediate nodes', () => {
    const alerts = component.alerts();
    const a = alerts.find(x => x.node === 'Tacuba' && x.code === 'HAZARDOUS_AT_NODE');
    expect(a).toBeTruthy();
    expect(a!.severity).toBe('critical');
  });
});
