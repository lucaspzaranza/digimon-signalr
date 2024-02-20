import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SignalrService } from 'src/app/signalr.service';
import { AppState } from 'src/models/app.state.model';
import { Player } from 'src/models/player.model';
import { localPlayerSelector, receivedChallengeSelector, waitingForPlayerResponseSelector } from 'src/store/digi.selector';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { receivedChallengeAction, setWaitingPlayerResponseAction } from 'src/store/digi.actions';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  $receivedChallenge = this.store.select(receivedChallengeSelector);
  $waitingPlayerResponse = this.store.select(waitingForPlayerResponseSelector);
  challengerPlayer: Player | undefined;

  constructor(private store:Store<AppState>, 
    private signalR: SignalrService, 
    private router: Router,
    public dialog: MatDialog) { }
    
    private firstRender: boolean = true;

  ngOnInit(): void {
    this.$receivedChallenge.subscribe(received => {
      if(this.challengerPlayer === undefined) {
        this.challengerPlayer = received.challengerPlayer;

        if(received.receivedChallenge) {
          this.dialog.open(ConfirmationModalComponent, {
            data: {
              title: 'Challenge Received!',
              text: `${this.challengerPlayer?.name} wants to challenge you to a duel.`,
              acceptButton: true,
              acceptCallback: () => this.acceptDuel(),
              closeCallback: () => this.closeModal()
            },
            disableClose: true
          })
        }
      }
    })

    this.$waitingPlayerResponse.subscribe(waiting => {
      if(waiting) {        
        this.dialog.open(ConfirmationModalComponent, {
          data: {
            title: 'Please wait...',
            text: `Waiting for player response.`,
            hideCloseButton: true,
            loading: true
          },
          disableClose: true
        })
      }
      else if(!this.firstRender) {
        this.dialog.closeAll();
        this.dialog.open(ConfirmationModalComponent, {
          data: {
            title: 'The player denied your challenge.',
            text: `Try again :(`,
          },
        })
      }
    })

    if(this.firstRender) {
      this.firstRender = false;
    }
  }

  async acceptDuel() {
    if(this.challengerPlayer !== undefined) {
      this.store.dispatch(receivedChallengeAction({value: false}));
      const localPlayer = await firstValueFrom(this.store.select(localPlayerSelector));
      
      if(localPlayer !== undefined) {
        this.signalR.notifyOthersData("UpdateDuelStatus", {playerId: localPlayer.id, value: true});
        this.signalR.notifyClient(this.challengerPlayer?.id, "StartDuel");
        this.signalR.networkPlayerId = this.challengerPlayer?.id;
        this.router.navigate(['ingame']);
      }
    }
  }

  closeModal() {
    this.dialog.closeAll();
    this.store.dispatch(receivedChallengeAction({value: false}));
    this.signalR.notifyClient(this.challengerPlayer?.id, "CancelWaiting");
    this.challengerPlayer = undefined;
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }
}
