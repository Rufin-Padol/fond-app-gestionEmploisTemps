import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeProfesseurComponent } from './liste-professeur.component';

describe('ListeProfesseurComponent', () => {
  let component: ListeProfesseurComponent;
  let fixture: ComponentFixture<ListeProfesseurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeProfesseurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeProfesseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
