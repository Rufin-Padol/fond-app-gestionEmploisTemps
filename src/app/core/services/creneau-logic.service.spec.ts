import { TestBed } from '@angular/core/testing';

import { CreneauLogicService } from './creneau-logic.service';

describe('CreneauLogicService', () => {
  let service: CreneauLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreneauLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
