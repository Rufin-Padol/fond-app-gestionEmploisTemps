import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewClasseComponent } from './new-classe.component';

describe('NewClasseComponent', () => {
  let component: NewClasseComponent;
  let fixture: ComponentFixture<NewClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewClasseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
