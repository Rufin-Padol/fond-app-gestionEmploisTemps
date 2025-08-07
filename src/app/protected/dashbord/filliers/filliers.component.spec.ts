import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilliersComponent } from './filliers.component';

describe('FilliersComponent', () => {
  let component: FilliersComponent;
  let fixture: ComponentFixture<FilliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilliersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
