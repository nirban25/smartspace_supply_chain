
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminComponent } from './admin.component';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AdminComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should seed node capacities and compute total capacity', () => {
    const arr = component.nodeCapacitiesArray;
    expect(arr.length).toBeGreaterThan(0);
    expect(component.totalNodeCapacity()).toBeGreaterThan(0);
  });

  it('should add & remove materials', () => {
    const before = component.materialsArray.length;
    component.addMaterial();
    expect(component.materialsArray.length).toBe(before + 1);
    component.removeMaterial(component.materialsArray.length - 1);
    expect(component.materialsArray.length).toBe(before);
  });

  it('exceedsTotalLimit rule works', () => {
    expect(AdminComponent.exceedsTotalLimit(33)).toBeTrue();
    expect(AdminComponent.exceedsTotalLimit(32)).toBeFalse();
  });

  it('deviatesFromDesign respects tolerance', () => {
    expect(AdminComponent.deviatesFromDesign(12, 10)).toBeFalse(); // within ±2
    expect(AdminComponent.deviatesFromDesign(13, 10)).toBeTrue();  // deviation 3
    expect(AdminComponent.deviatesFromDesign(7, 10)).toBeTrue();   // deviation 3
  });

  it('persists to localStorage on change', () => {
    const key = 'admin.nodeCapacity';
    expect(localStorage.getItem(key)).toBeTruthy(); // initial save via valueChanges
    const first = component.nodeCapacitiesArray.at(0);
    first.patchValue({ designedCapacity: 99 });
    fixture.detectChanges();

    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    expect(parsed[0].designedCapacity).toBe(99);
  });
});
