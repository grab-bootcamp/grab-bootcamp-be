import { Test, TestingModule } from '@nestjs/testing';
import { LivedataController } from './livedata.controller';

describe('LivedataController', () => {
  let controller: LivedataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LivedataController],
    }).compile();

    controller = module.get<LivedataController>(LivedataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
