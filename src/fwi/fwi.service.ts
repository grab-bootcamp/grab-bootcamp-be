import { Injectable } from '@nestjs/common';
import { FwiForsestData } from 'src/statistic/entities';

@Injectable()
export class FwiService {

  private effectiveDayLength = [6.5, 7.5, 9, 12.8, 13.9, 13.9, 12.4, 10.9, 9.4, 8.0, 7.0, 6]
  private dayLengthFactor = [-1.6, -1.6, -1.6, 0.9, 3.8, 5.8, 6.4, 5, 2.4, 0.4, -1.6, -1.6]

  /**
   * Calculate the Intermediate Fine Fuel Moisture Code (FFMC)
   * 
   * Warning: this function return the Intermediate FFMC, not the FFMC because [m] is required for some other calculations
   * @param Fo Fine Fuel Moisture Code (FFMC) at previous time step
   * @param H 24h fuel moisture content
   * @param T Temperature
   * @param W Wind speed
   * @param ro Rainfall
   * @returns Intermediate Fine Fuel Moisture Code (FFMC) at current time step
   */
  calcIntermediateFFMC(Fo: number, H: number, T: number, W: number, ro: number) {
    // mo = 147.2 * (101. - Fo) / (59.5 + Fo)
    let mo = 147.2 * (101. - Fo) / (59.5 + Fo)

    //rf = where(ro .gt. .5, ro - .5, -1.)
    let rf = ro - 0.5

    // mo = where(rf .gt. 0., 
    //        where(mo .gt. 150., 
    //          mo + 42.5 * rf * exp(-100./(251.-mo)) * (1 - exp(-6.93 / rf)) + .0015 * ((mo - 150.)^2) * sqrt(rf), 
    //          mo + 42.5 * rf * exp(-100./(251.-mo)) * (1 - exp(-6.93 / rf))), mo)
    if (ro > 0.5) {
      if (mo > 150) {
        mo = mo + 42.5 * rf * Math.exp(-100. / (251. - mo)) * (1. - Math.exp(-6.93 / rf)) + 0.0015 * (mo - 150.) ** 2 * Math.sqrt(rf)
      } else {
        mo = mo + 42.5 * rf * Math.exp(-100. / (251. - mo)) * (1. - Math.exp(-6.93 / rf))
      }
    }

    // Ed = .942 * H^0.679 + 11 * exp((H - 100.)/10.) + 0.18 * (21.1 - T) * (1 - exp(-.115 * H))
    const Ed = 0.942 * H ** 0.679 + 11. * Math.exp((H - 100.) / 10.) + 0.18 * (21.1 - T) * (1. - Math.exp(-0.115 * H))

    // Ew = .618 * H^.753 + 10 * exp((H-100.)/10.) + 0.18 * (21.1 - T) * (1 - exp(-.115 * H))
    const Ew = 0.618 * H ** 0.753 + 10. * Math.exp((H - 100.) / 10.) + 0.18 * (21.1 - T) * (1. - Math.exp(-0.115 * H))

    // ko1 = where(mo .gt. Ed, 
    //  0.424 * (1 - (H / 100)^1.7)+ 0.0694 * sqrt(W) * (1 - (H / 100)^8.), 
    //  0.424 * (1 - ((100 - H) / 100)^1.7) + 0.0694 * sqrt(W) * (1 - ((100 - H) / 100)^8))
    let ko1: number
    if (mo > Ed) {
      ko1 = 0.424 * (1. - (H / 100.) ** 1.7) + 0.0694 * Math.sqrt(W) * (1. - (H / 100.) ** 8)
    } else {
      ko1 = 0.424 * (1. - ((100. - H) / 100.) ** 1.7) + 0.0694 * Math.sqrt(W) * (1. - ((100. - H) / 100.) ** 8)
    }

    // kdw = ko1 * 0.581 * exp(0.0365 * T)
    const kdw = ko1 * 0.581 * Math.exp(0.0365 * T)

    // m = where(mo .gt. Ed, Ed + (mo - Ed) * 10^(-kdw), mo)
    // m = where(mo .lt. Ew, Ew - (Ew - mo) * 10^(-kdw), m)
    let m = mo
    if (mo > Ed) {
      m = Ed + (mo - Ed) * 10. ** -kdw
    } else if (mo < Ew) {
      m = Ew - (Ew - mo) * 10. ** -kdw
    }

    // m = m < 250.0
    // m = m > 0.0
    m = Math.min(Math.max(m, 0), 250)

    return m;
  }

  /**
   * Calculate the Fine Fuel Moisture Code (FFMC)
   * @param m Intermediate Fine Fuel Moisture Code (FFMC)
   * @returns Fine Fuel Moisture Code (FFMC)
   */
  calcFFMC(m: number) {
    return 59.5 * (250. - m) / (147.2 + m)
  }

  /**
   * Calculate the Duff Moisture Code (DMC)
   * @param Po Duff Moisture Code (DMC) at previous time step
   * @param T Temperature 
   * @param ro Rainfall 
   * @param H 24h fuel moisture content 
   * @param month Month of the year (0 - 11)
   * @returns Duff Moisture Code (DMC) at current time step
   */
  calcDMC(Po: number, T: number, ro: number, H: number, month: number) {
    // T_dmc = T > -1.1

    // re = where(ro .gt. 1.5, .92 * ro - 1.27, 0)    ;adjust precip
    const re = ro > 1.5 ? 0.92 * ro - 1.27 : 0

    // Mo = 20. + exp(5.6348 - (Po / 43.43))
    const Mo = 20 + Math.exp(5.6348 - (Po / 43.43))

    // b = 14. - 1.3 * log(Po)
    let b = 14 - 1.3 * Math.log(Po)

    // b = where(Po .gt. 65., 6.2 * log(Po) - 17.2, b)
    if (Po > 65) {
      b = 6.2 * Math.log(Po) - 17.2
    }

    // b = where(Po .lt. 33., 100. / (.5 + .3 * Po) , b)
    if (Po < 33) {
      b = 100 / (0.5 + 0.3 * Po)
    }

    // Mr = where(re .gt. 0, Mo + (1000. * re / (48.77 + b * re)), 0) ;only if there's precip
    const Mr = re > 0 ? Mo + (1000 * re / (48.77 + b * re)) : 0

    // Po = where(re .gt. 0, 244.72 - 43.43 * log(Mr - 20.), Po)       ;only if there's precip
    if (re > 0) {
      Po = 244.72 - 43.43 * Math.log(Mr - 20)
    }

    // Po = Po > 0.0
    Po = Math.max(Po, 0)

    // K = 1.894 * (T_dmc + 1.1) * (100 - H) * Le * 10^(-6)
    const K = 1.894 * (T + 1.1) * (100 - H) * this.effectiveDayLength[month] * Math.pow(10, -6)

    // P = (Po + 100 * K) > 0.0
    const P = Math.max(Po + 100 * K, 0)

    return P
  }

  /**
   * Calculate the Drought Code (DC)
   * @param ro Rainfall
   * @param T Temperature
   * @param Do Drought Code (DC) at previous time step
   * @param month Month of the year (0 - 11)
   * @returns Drought Code (DC) at current time step
   */
  calcDC(Do: number, T: number, ro: number, month: number) {
    // T_dc = T > -2.8

    // rd = where(ro .gt. 2.8, 0.83 * ro - 1.27, -1)   ;adjust precip
    const rd = ro > 2.8 ? 0.83 * ro - 1.27 : -1
    // Qo = 800 * exp(-Do / 400.)
    const Qo = 800 * Math.exp(-Do / 400)

    // Qr = Qo + (3.937 * rd)
    const Qr = Qo + (3.937 * rd)

    // Dr = where(rd .gt. 0., 400. * log(800. / Qr), Do)       ;only if precip
    let Dr = rd > 0 ? 400 * Math.log(800 / Qr) : Do

    // Dr = Dr > 0.0
    Dr = Math.max(Dr, 0)

    // V = (.36 * (T_dc + 2.8)) + Lf
    let V = (.36 * (T + 2.8)) + this.dayLengthFactor[month]

    // V = V > 0
    V = Math.max(V, 0)

    // Drou = (Dr + .5 * V) > 0.0
    return Math.max(Dr + 0.5 * V, 0)
  }

  /**
   * Calculate the Initial Spread Index (ISI)
   * @param W Wind speed
   * @param m Intermediate parameter from calcFFMC
   * @returns Initial Spread Index (ISI) at current time step
   */
  calcISI(W: number, m: number) {
    // fw = exp(.05039 * W)
    const fw = Math.exp(0.05039 * W)

    // ff = 91.9 * exp(-0.1386 * m) * (1 + (m^5.31 / (4.93 * 10^7)))
    const ff = 91.9 * Math.exp(-0.1386 * m) * (1 + (m ** 5.31 / (4.93 * 10 ** 7)))

    // r = (0.208 * fw * ff) > 0.0
    return Math.max(0.208 * fw * ff, 0)
  }

  _mainCalculation(
    humidity: number, temperature: number, windSpeed: number, rainFall: number,
    lastRecord: FwiForsestData,
    currentMonth: number
  ) {
    const intermediateFFMC = this.calcIntermediateFFMC(
      lastRecord.Po,
      humidity,
      temperature,
      windSpeed,
      rainFall,
    )

    const mFFMC = this.calcFFMC(intermediateFFMC);
    const mDMC = this.calcDMC(
      lastRecord.Po,
      temperature,
      rainFall,
      humidity,
      currentMonth
    );
    const mDC = this.calcDC(
      lastRecord.Do,
      temperature,
      rainFall,
      currentMonth
    );
    const mISI = this.calcISI(windSpeed, intermediateFFMC);

    return {
      mFFMC,
      mDMC,
      mDC,
      mISI,
    }
  }
}
