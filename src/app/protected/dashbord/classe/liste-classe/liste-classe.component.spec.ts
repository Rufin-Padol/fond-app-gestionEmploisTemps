import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeClasseComponent } from './liste-classe.component';

describe('ListeClasseComponent', () => {
  let component: ListeClasseComponent;
  let fixture: ComponentFixture<ListeClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeClasseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
