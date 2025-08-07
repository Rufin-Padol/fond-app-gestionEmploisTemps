import { TestBed } from '@angular/core/testing';

import { EtablissementServiceUserService } from './etablissement-service-user.service';

describe('EtablissementServiceUserService', () => {
  let service: EtablissementServiceUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtablissementServiceUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
