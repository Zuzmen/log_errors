import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertWidgetComponent } from './alert-widget.component';

describe('AlertWidgetComponent', () => {
  let component: AlertWidgetComponent;
  let fixture: ComponentFixture<AlertWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlertWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
