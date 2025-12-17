import { TestBed } from '@angular/core/testing';

import { WorldBank } from './world-bank';

describe('WorldBank', () => {
  let service: WorldBank;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorldBank);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
