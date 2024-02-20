import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { async, firstValueFrom } from 'rxjs';
import { SignalrService } from 'src/app/signalr.service';
import { AppState } from 'src/models/app.state.model';
import { Player, SetupNewPlayer } from 'src/models/player.model';
import { localPlayerSelector } from 'src/store/digi.selector';

@Component({
  selector: 'app-local-player',
  templateUrl: './local-player.component.html',
  styleUrls: ['./local-player.component.css', '../../app.component.css']
})
export class LocalPlayerComponent{
  localPlayer$ = this.store.select(localPlayerSelector);
  localPlayer: Player | undefined;

  constructor(public signalRService: SignalrService, private store: Store<AppState>) {
    (async () => {
      this.localPlayer = await firstValueFrom(this.localPlayer$)
    })()
  }
}
