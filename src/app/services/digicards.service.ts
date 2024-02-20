import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/models/app.state.model';
import { Digicard } from 'src/models/digicard.model';
import { Digimon } from 'src/models/digimon.model';
import { digimonsSelector } from 'src/store/digi.selector';
import { MathUtilsService } from './math-utils.service';

const MAX_CARDS = 5;

@Injectable({
  providedIn: 'root'
})
export class DigiCardsService {
  
  constructor(private store:Store<AppState>, private mathUtils: MathUtilsService) { }

  selectDigiCards(): Digicard[] {
    let digimons: Digimon[] = [];
    let digicards: Digicard[] = [];

    this.store.select(digimonsSelector).subscribe(digimonsStore => {
      digimons = digimonsStore;
    });

    for(let i = 0; i < MAX_CARDS; i++) {
      let randomIndex = this.mathUtils.GetRandomInteger(0, digimons.length);
      let randomDigimon = digimons[randomIndex];
      let randomCard = new Digicard(randomDigimon);
      
      digicards.push(randomCard);
    }
    
    return digicards;
  }
}
