import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFilliersComponent } from './new-filliers.component';

describe('NewFilliersComponent', () => {
  let component: NewFilliersComponent;
  let fixture: ComponentFixture<NewFilliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewFilliersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewFilliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
