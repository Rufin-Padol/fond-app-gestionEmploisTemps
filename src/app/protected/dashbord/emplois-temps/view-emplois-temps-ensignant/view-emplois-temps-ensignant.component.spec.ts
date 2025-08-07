import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEmploisTempsEnsignantComponent } from './view-emplois-temps-ensignant.component';

describe('ViewEmploisTempsEnsignantComponent', () => {
  let component: ViewEmploisTempsEnsignantComponent;
  let fixture: ComponentFixture<ViewEmploisTempsEnsignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEmploisTempsEnsignantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEmploisTempsEnsignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
