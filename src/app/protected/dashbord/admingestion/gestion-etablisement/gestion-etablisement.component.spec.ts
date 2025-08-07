import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEtablisementComponent } from './gestion-etablisement.component';

describe('GestionEtablisementComponent', () => {
  let component: GestionEtablisementComponent;
  let fixture: ComponentFixture<GestionEtablisementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionEtablisementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionEtablisementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
