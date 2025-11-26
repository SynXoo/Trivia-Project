import { TestBed } from '@angular/core/testing';

import { SocketService } from './socket.service';

/**
 * Unit test file for the SocketService
 */
describe('SocketService', () => {
  let service: SocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
