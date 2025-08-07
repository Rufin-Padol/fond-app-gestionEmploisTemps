import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEmploisTempsSalleComponent } from './view-emplois-temps-salle.component';

describe('ViewEmploisTempsSalleComponent', () => {
  let component: ViewEmploisTempsSalleComponent;
  let fixture: ComponentFixture<ViewEmploisTempsSalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEmploisTempsSalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEmploisTempsSalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
