
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsComponent } from './reports.component';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computes totals and compliance', () => {
    expect(component.totalPlanned).toBeGreaterThan(0);
    expect(component.totalUnloaded).toBeGreaterThan(0);
    expect(component.compliancePct).toBeGreaterThan(0);
  });

  it('clears file input after importSelectedFile on success (mock)', () => {
    // This is a lightweight demonstration; in a real DOM test, you'd provide a File and spy on FileReader.
    const mockInput = document.createElement('input');
    Object.defineProperty(mockInput, 'files', {
      value: [new File([JSON.stringify({ raw: component.data })], 'test.json', { type: 'application/json' })],
      writable: false
    });

    // Spy on FileReader to immediately trigger onload with JSON content
    const fileReaderSpy = spyOn(window as any, 'FileReader').and.returnValue({
      onload: null,
      readAsText(file: File) {
        // call onload with a fake result
        // @ts-ignore
        this.onload({ target: { result: JSON.stringify({ raw: component.data }) } });
      }
    });

    component.importSelectedFile(mockInput as HTMLInputElement);
    expect(fileReaderSpy).toHaveBeenCalled();
    // After import, input.value should be ''
    expect((mockInput as HTMLInputElement).value).toBe('');
  });
});
