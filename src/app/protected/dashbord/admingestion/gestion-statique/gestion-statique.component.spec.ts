import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionStatiqueComponent } from './gestion-statique.component';

describe('GestionStatiqueComponent', () => {
  let component: GestionStatiqueComponent;
  let fixture: ComponentFixture<GestionStatiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionStatiqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionStatiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
