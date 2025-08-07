import { TestBed } from '@angular/core/testing';

import { EtablissementServiceService } from './etablissement-service.service';

describe('EtablissementServiceService', () => {
  let service: EtablissementServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtablissementServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
