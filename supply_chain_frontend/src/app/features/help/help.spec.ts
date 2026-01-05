
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpComponent } from './help.component';

describe('HelpComponent', () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HelpComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the HelpComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should filter topics by search query', () => {
    component.searchQuery = 'inventory';
    expect(component.filteredTopics.some(t => t.title.toLowerCase().includes('inventory'))).toBeTrue();
  });

  it('should select a topic', () => {
    const topic = component.helpTopics[0];
    component.selectTopic(topic);
    expect(component.selectedTopic).toBe(topic);
  });

  it('should clear selection', () => {
    component.selectedTopic = component.helpTopics[0];
    component.clearSelection();
    expect(component.selectedTopic).toBeNull();
  });
});
