import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProfesseurComponent } from './new-professeur.component';

describe('NewProfesseurComponent', () => {
  let component: NewProfesseurComponent;
  let fixture: ComponentFixture<NewProfesseurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewProfesseurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewProfesseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
