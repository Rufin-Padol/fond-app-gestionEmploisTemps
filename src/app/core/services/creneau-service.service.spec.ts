import { TestBed } from '@angular/core/testing';

import { CreneauServiceService } from './creneau-service.service';

describe('CreneauServiceService', () => {
  let service: CreneauServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreneauServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
