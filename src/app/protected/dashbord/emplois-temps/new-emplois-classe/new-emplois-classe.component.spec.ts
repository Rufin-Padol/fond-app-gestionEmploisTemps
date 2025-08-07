import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEmploisClasseComponent } from './new-emplois-classe.component';

describe('NewEmploisClasseComponent', () => {
  let component: NewEmploisClasseComponent;
  let fixture: ComponentFixture<NewEmploisClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewEmploisClasseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewEmploisClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
