import { TestBed, async, inject } from '@angular/core/testing';

import { TrsGuard } from './sales.guard';

describe('SalesGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrsGuard]
    });
  });

  it('should ...', inject([TrsGuard], (guard: TrsGuard) => {
    expect(guard).toBeTruthy();
  }));
});
