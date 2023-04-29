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

  // source: https://docs.niwa.co.nz/eco/fwsys/ref/EquationsandFORTRANfortheCFFWI.pdf

  const testCases = [{
    month: 3,
    Fo: 87.7,
    Po: 8.5,
    Do: 19,
    H: 21,
    T: 20,
    W: 25,
    ro: 2.4,
    expected: {
      FFMC: 86.2,
      DMC: 10.4,
      DC: 23.6,
      ISI: 8.8,
    }
  }, {
    month: 3,
    Fo: 86.2,
    Po: 10.4,
    Do: 23.6,
    H: 40,
    T: 8.5,
    W: 17,
    ro: 0,
    expected: {
      FFMC: 87,
      DMC: 11.8,
      DC: 26.1,
      ISI: 6.5,
    }
  }, {
    month: 3,
    Fo: 87,
    Po: 11.8,
    Do: 26.1,
    H: 25,
    T: 6.5,
    W: 6,
    ro: 0,
    expected: {
      FFMC: 88.8,
      DMC: 13.2,
      DC: 28.2,
      ISI: 4.9,
    }
  }]

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it.each(testCases)('should calculate the FFMC', (testCase) => {
    expect(service.calcFFMC(
      service.calcIntermediateFFMC(testCase.Fo, testCase.H, testCase.T, testCase.W, testCase.ro)
    ))
      .toBeCloseTo(testCase.expected.FFMC, 1);
  });

  it.each(testCases)('should calculate the DMC', (testCase) => {
    expect(service.calcDMC(testCase.Po, testCase.T, testCase.ro, testCase.H, testCase.month))
      .toBeCloseTo(testCase.expected.DMC, 1);
  });

  it.each(testCases)('should calculate the DC', (testCase) => {
    expect(service.calcDC(testCase.Do, testCase.T, testCase.ro, testCase.month))
      .toBeCloseTo(testCase.expected.DC, 1);
  });

  it.each(testCases)('should calculate the ISI', (testCase) => {
    expect(service.calcISI(
      testCase.W,
      service.calcIntermediateFFMC(testCase.Fo, testCase.H, testCase.T, testCase.W, testCase.ro)
    ))
      .toBeCloseTo(testCase.expected.ISI, 1);
  });
});
