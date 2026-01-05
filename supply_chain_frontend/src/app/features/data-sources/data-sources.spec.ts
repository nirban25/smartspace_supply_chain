
// src/app/features/data-sources/data-sources.spec.ts
import { TestBed } from '@angular/core/testing';
import { DataSourcesComponent } from './data-sources.component';

describe('DataSourcesComponent', () => {
  let component: DataSourcesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // ✅ standalone import: brings CommonModule + ReactiveFormsModule via component decorator
      imports: [DataSourcesComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(DataSourcesComponent);
    component = fixture.componentInstance;
  });

  it('should list sources by default', () => {
    const list = component.filteredSources;
    expect(list.length).toBeGreaterThan(0);
  });

  it('should filter by category', () => {
    component.filterForm.patchValue({ category: 'Transit' });
    const list = component.filteredSources;
    expect(list.every(s => s.category === 'Transit')).toBeTrue();
  });

  it('should filter by search text', () => {
    component.filterForm.patchValue({ search: 'HTM' });
    const list = component.filteredSources;
    expect(list.some(s => (s.description ?? '').toLowerCase().includes('registry'))).toBeTrue();
  });

  it('should toggle source enabled state', () => {
    const id = component.dataSources[0].id;
    const before = component.dataSources.find(s => s.id === id)!.enabled;
    component.toggleSource(id);
    const after = component.dataSources.find(s => s.id === id)!.enabled;
    expect(after).toBe(!before);
  });

  it('should toggle connector status', () => {
    const id = component.connectors[0].id;
    const before = component.connectors.find(c => c.id === id)!.status;
    component.toggleConnector(id);
    const after = component.connectors.find(c => c.id === id)!.status;
    expect(['active', 'paused']).toContain(after);
    expect(after).not.toBe(before);
  });

  it('should resolve sources for a connector', () => {
    const c = component.connectors[0];
    const sources = component.sourcesFor(c);
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.every(s => c.sourceIds.includes(s.id))).toBeTrue();
  });
});
