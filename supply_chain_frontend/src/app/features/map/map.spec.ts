import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let fixture: ComponentFixture<MapComponent>;
  let component: MapComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // For standalone components, import the component itself
      imports: [MapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent); // <-- use MapComponent, not Map
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
