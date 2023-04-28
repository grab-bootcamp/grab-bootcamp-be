import { Test, TestingModule } from '@nestjs/testing';
import { FwiService } from './fwi.service';

describe('FwiService', () => {
  let service: FwiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FwiService],
    }).compile();

    service = module.get<FwiService>(FwiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
