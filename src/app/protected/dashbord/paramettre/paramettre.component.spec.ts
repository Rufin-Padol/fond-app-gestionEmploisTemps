import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamettreComponent } from './paramettre.component';

describe('ParamettreComponent', () => {
  let component: ParamettreComponent;
  let fixture: ComponentFixture<ParamettreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParamettreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParamettreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
