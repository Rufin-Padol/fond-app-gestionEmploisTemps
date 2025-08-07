import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sisbar2Component } from './sisbar2.component';

describe('Sisbar2Component', () => {
  let component: Sisbar2Component;
  let fixture: ComponentFixture<Sisbar2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sisbar2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sisbar2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
