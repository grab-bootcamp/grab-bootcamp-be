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

  const effectiveDayLengthForDMC = {
    'Jan': 6.5,
    'Feb': 7.5,
    'Mar': 9,
    'Apr': 12.8,
    'May': 13.9,
    'June': 13.9,
    'July': 12.4,
    'Aug': 10.9,
    'Sept': 9.4,
    'Oct': 8.0,
    'Nov': 7.0,
    'Dec': 6,
  }

  const effectiveDayLengthForDC = {
    'Jan': -1.6,
    'Feb': -1.6,
    'Mar': -1.6,
    'Apr': 0.9,
    'May': 3.8,
    'June': 5.8,
    'July': 6.4,
    'Aug': 5,
    'Sept': 2.4,
    'Oct': 0.4,
    'Nov': -1.6,
    'Dec': -1.6,
  }

  const testCases = [{
    month: 'Apr',
    Fo: 85,
    Po: 6.0,
    Do: 15,
    H: 42,
    T: 17,
    W: 25,
    ro: 0,
    expected: {
      FFMC: 87.7,
      DMC: 8.5,
      DC: 19,
      ISI: 10.9,
    }
  }, {
    month: 'Apr',
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
    expect(service.calcDMC(testCase.Po, testCase.T, testCase.ro, testCase.H, effectiveDayLengthForDMC[testCase.month]))
      .toBeCloseTo(testCase.expected.DMC, 1);
  });

  it.each(testCases)('should calculate the DC', (testCase) => {
    expect(service.calcDC(testCase.Do, testCase.T, testCase.ro, effectiveDayLengthForDC[testCase.month]))
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
