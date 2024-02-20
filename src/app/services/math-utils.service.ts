import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MathUtilsService {

  constructor() { }

  public Clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  public GetRandomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }
}
