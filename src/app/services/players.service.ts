import { Injectable } from '@angular/core';
import { DigiCardsService } from './digicards.service';
import { Player } from 'src/models/player.model';
import { Store } from '@ngrx/store';
import { AppState } from 'src/models/app.state.model';
import { resetAllCardsToDefaultState, setDueling, setHP, setLocalPlayerCard, setLoser, setNetworkPlayerCard, setWinner } from 'src/store/digi.actions';
import { SignalrService } from '../signalr.service';

const INITIAL_HP = 100;

@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  constructor(private digiCardService: DigiCardsService, private store: Store<AppState>, private signalR: SignalrService) { }

  createNewPlayer(playerName: string, playerID: string): Player {
    let digiCards = this.digiCardService.selectDigiCards();

    return {
      name: playerName,
      cards: digiCards,
      hp : INITIAL_HP,
      isLocal: true,
      id: playerID,
      isDueling: false
    };
  }

  public resetPlayerFromDuel(player: Player) {
    this.store.dispatch(setDueling({playerId: player.id, value: false}));
    this.store.dispatch(resetAllCardsToDefaultState());
    this.store.dispatch(setHP({id: player.id, value: 100}));
    this.store.dispatch(setHP({id: this.signalR.networkPlayerId, value: 100}));
    this.store.dispatch(setLocalPlayerCard({digimon: undefined}));
    this.store.dispatch(setNetworkPlayerCard({cardIndex: -1, playerID: this.signalR.networkPlayerId}));
    this.store.dispatch(setWinner({player: undefined}));
    this.store.dispatch(setLoser({player: undefined}));

    this.signalR.notifyOthersData("UpdateDuelStatus", {playerId: player.id, value: false});
  }
}
