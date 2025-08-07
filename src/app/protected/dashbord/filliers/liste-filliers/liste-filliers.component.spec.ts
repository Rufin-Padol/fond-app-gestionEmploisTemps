import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeFilliersComponent } from './liste-filliers.component';

describe('ListeFilliersComponent', () => {
  let component: ListeFilliersComponent;
  let fixture: ComponentFixture<ListeFilliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeFilliersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeFilliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
