import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmingestionComponent } from './admingestion.component';

describe('AdmingestionComponent', () => {
  let component: AdmingestionComponent;
  let fixture: ComponentFixture<AdmingestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmingestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmingestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
