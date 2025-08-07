import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SisbarComponent } from './sisbar.component';

describe('SisbarComponent', () => {
  let component: SisbarComponent;
  let fixture: ComponentFixture<SisbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SisbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SisbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
