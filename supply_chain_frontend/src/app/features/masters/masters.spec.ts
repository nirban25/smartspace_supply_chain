
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MastersComponent } from './masters.component';

describe('MastersComponent (standalone)', () => {
  let component: MastersComponent;
  let fixture: ComponentFixture<MastersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MastersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MastersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to materials tab', () => {
    expect(component.tab()).toBe('materials');
  });

  it('should add and remove a material', () => {
    const initial = component.materials().length;
    component.newMaterial = { name: 'Test Mat', hazardous: true, design: 1, safety: 1, supplier: 'X' };
    component.addMaterial();
    expect(component.materials().length).toBe(initial + 1);

    const addedId = component.materials()[component.materials().length - 1].id;
    component.removeMaterial(addedId);
    expect(component.materials().length).toBe(initial);
  });

  it('should parse supplier materials from raw string', () => {
    component.onSupplierMaterialsModelChange('HLAS, Pasta Calaca ,  ,HLAS');
    expect(component.newSupplier.materialsSupplied).toEqual(['HLAS', 'Pasta Calaca', 'HLAS']);
  });

  it('should add and remove a supplier', () => {
    const initial = component.suppliers().length;
    component.newSupplier = { name: 'New Co', contact: 'new@example.com', materialsSupplied: ['HLAS'] };
    component.addSupplier();
    expect(component.suppliers().length).toBe(initial + 1);

    const id = component.suppliers()[component.suppliers().length - 1].id;
    component.removeSupplier(id);
    expect(component.suppliers().length).toBe(initial);
  });
});
