import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { PlayersService } from 'src/app/services/players.service';
import { SignalrService } from 'src/app/signalr.service';
import { AppState } from 'src/models/app.state.model';
import { resetAllCardsToDefaultState, setDueling, setHP, setLocalPlayerCard, setLoser, setNetworkPlayerCard, setWinner } from 'src/store/digi.actions';
import { localPlayerSelector, loserSelector, 
  playersSelector, winnerSelector } from 'src/store/digi.selector';

@Component({
  selector: 'app-end-game',
  templateUrl: './end-game.component.html',
  styleUrls: ['./end-game.component.css']
})
export class EndGameComponent implements OnInit {
  constructor(
    private store: Store<AppState>, 
    private signalR: SignalrService, 
    private router: Router,
    private dialog: MatDialog,
    private playerService: PlayersService) {}

  $winner = this.store.select(winnerSelector);
  $loser = this.store.select(loserSelector);

  isWinner: boolean = false;

  ngOnInit(): void {
    this.getWinnerAndLoser();
    this.dialog.closeAll();
  }
  
  async getWinnerAndLoser() {
    let localPlayer = await firstValueFrom(this.store.select(localPlayerSelector));
    this.isWinner = (await firstValueFrom(this.$winner))?.id === localPlayer?.id;
  }

  async backToArena() {
    const localPlayer = await firstValueFrom(this.store.select(localPlayerSelector));

    if(localPlayer !== undefined) {
      this.playerService.resetPlayerFromDuel(localPlayer);
      // this.store.dispatch(setDueling({playerId: localPlayer.id, value: false}));
      // this.store.dispatch(resetAllCardsToDefaultState());
      // this.store.dispatch(setHP({id: localPlayer.id, value: 100}));
      // this.store.dispatch(setHP({id: this.signalR.networkPlayerId, value: 100}));
      // this.store.dispatch(setLocalPlayerCard({digimon: undefined}));
      // this.store.dispatch(setNetworkPlayerCard({cardIndex: -1, playerID: this.signalR.networkPlayerId}));
      // this.store.dispatch(setWinner({player: undefined}));
      // this.store.dispatch(setLoser({player: undefined}));

      // this.signalR.notifyOthersData("UpdateDuelStatus", {playerId: localPlayer.id, value: false});
    }

    this.router.navigate(['lobby']);
  }
}
