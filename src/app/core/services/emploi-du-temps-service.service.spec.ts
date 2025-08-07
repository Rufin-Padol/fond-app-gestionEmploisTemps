import { TestBed } from '@angular/core/testing';

import { EmploiDuTempsServiceService } from './emploi-du-temps-service.service';

describe('EmploiDuTempsServiceService', () => {
  let service: EmploiDuTempsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmploiDuTempsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
