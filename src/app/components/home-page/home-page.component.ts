import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { PlayersService } from 'src/app/services/players.service';
import { SignalrService } from 'src/app/signalr.service';
import { AppState } from 'src/models/app.state.model';
import { addPlayer, getDigimons } from 'src/store/digi.actions';
import { playersSelector } from 'src/store/digi.selector';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy{
  title = 'Digimon Card Battle';

  constructor(
    public signalRService: SignalrService,
    public playerService: PlayersService,
    private store: Store<AppState>,
    private router: Router,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.signalRService.startConnection();
    this.store.dispatch(getDigimons());
  }

  async signUp(form: NgForm) {
    if(!form.valid) {
      this.openDialogBox('Name input field is empty', 'Please input your nickname.')
      return;
    }

    let name: string = form.value.name;
    const players = await firstValueFrom(this.store.select(playersSelector));

    if(players.length > 0 && players.find(player => player.name === name) !== undefined) {
      this.openDialogBox('Name already being used!', `${name} name already exists, please select another one.`)
    }
    else {
      this.signalRService.getPlayerId()?.then(playerId => {
        let newPlayer = this.playerService.createNewPlayer(name, playerId);
        this.store.dispatch(addPlayer({newPlayer}));
        this.signalRService.notifyOthersData('handShake', newPlayer);
        this.signalRService.getAllPlayers(newPlayer.id);

        //this.signalRService.getAllConnections();
        this.router.navigate(['lobby']);
      });
    }
  }

  openDialogBox(title: string, text: string) {
    this.dialog.open(ConfirmationModalComponent, {
      data: {
        title,
        text
      }
    })
  }

  ngOnDestroy(): void {
    this.signalRService.hubConnection?.off("askServerResponse");
  }
}
