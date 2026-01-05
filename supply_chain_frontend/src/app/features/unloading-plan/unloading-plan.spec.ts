import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnloadingPlanComponent } from './unloading-plan.component';

describe('Unloading', () => {
  let component: UnloadingPlanComponent;
  let fixture: ComponentFixture<UnloadingPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnloadingPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnloadingPlanComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
