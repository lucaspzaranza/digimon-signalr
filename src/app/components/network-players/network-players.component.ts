import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { SignalrService } from 'src/app/signalr.service';
import { AppState } from 'src/models/app.state.model';
import { Player } from 'src/models/player.model';
import { setWaitingPlayerResponseAction } from 'src/store/digi.actions';
import { localPlayerSelector, playersSelector } from 'src/store/digi.selector';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-network-players',
  templateUrl: './network-players.component.html',
  styleUrls: ['./network-players.component.css']
})
export class NetworkPlayerComponent {
  allPlayers$ = this.store.select(playersSelector)
  localPlayer$ = this.store.select(localPlayerSelector)

  constructor(private signalRService: SignalrService, private store: Store<AppState>, private dialog: MatDialog) { }

  async challenge(player: Player) {
    if(player.isDueling) {
      this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: `${player.name} is not available!`,
          text: `${player.name} is in duel now, please select an idle player.`
        }
      })
    }
    else {
      let localPlayer = await firstValueFrom(this.localPlayer$);
      this.store.dispatch(setWaitingPlayerResponseAction({value: true}));
      this.signalRService.notifyClientData(player.id, "ReceiveChallenge", {playerId: localPlayer?.id, accepted: true});
    }
  }
}
