import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeEmploisComponent } from './liste-emplois.component';

describe('ListeEmploisComponent', () => {
  let component: ListeEmploisComponent;
  let fixture: ComponentFixture<ListeEmploisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeEmploisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeEmploisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
