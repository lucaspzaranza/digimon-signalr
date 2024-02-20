import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { first, firstValueFrom } from 'rxjs';
import { SignalrService } from 'src/app/signalr.service';
import { AppState } from 'src/models/app.state.model';
import { Digicard } from 'src/models/digicard.model';
import { setDueling, setLocalPlayerCard, updateLogAction } from 'src/store/digi.actions';
import { localCardSelector, localPlayerSelector, networkCardSelector, 
  playerSelectorById, playersSelector } from 'src/store/digi.selector';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { Router } from '@angular/router';
import { PlayersService } from 'src/app/services/players.service';

@Component({
  selector: 'app-in-game',
  templateUrl: './in-game.component.html',
  styleUrls: ['./in-game.component.css', '../../app.component.css']
})
export class InGameComponent {
  players$ = this.store.select(playersSelector);
  localPlayer$ = this.store.select(localPlayerSelector);
  netWorkPlayer$ = this.store.select(playerSelectorById(this.signalR.networkPlayerId));
  modalOpen: boolean = false;

  constructor (
    private store: Store<AppState>,
    private signalR: SignalrService,
    public dialog: MatDialog,
    private router: Router,
    private playerService: PlayersService) {
      (async () => {
        const localPlayer = await firstValueFrom(this.localPlayer$);
        const networkPlayer = await firstValueFrom(this.netWorkPlayer$);

        if(localPlayer !== undefined && networkPlayer !== undefined) {
          this.store.dispatch(setDueling({playerId: localPlayer.id, value: true}));
          this.store.dispatch(setDueling({playerId: networkPlayer.id, value: true}));
        }
      })();

      this.players$.subscribe(async (players) => {
        let networkPlayer = await firstValueFrom(this.netWorkPlayer$);
        //console.log(this.modalOpen);
        
        if(networkPlayer === undefined && !this.modalOpen) {
          this.dialog.open(ConfirmationModalComponent, {
            data: {
              title: "Your opponent has left the game!",
              text: 'So this is your victory. Press accept to come back to the lobby.',
              acceptButton: true,
              hideCloseButton: true,
              acceptCallback: () => this.goBackToLobby(),
            },
            disableClose: true
          });
        }
      })
  }

  async goBackToLobby() {
    this.modalOpen = true;
    const localPlayer = await firstValueFrom(this.localPlayer$);
    if(localPlayer !== undefined) {
      this.playerService.resetPlayerFromDuel(localPlayer);
    }
    this.router.navigate(['lobby']);
    this.dialog.closeAll();
  }

  async chooseDigimon(digiCard: Digicard) {
    if(await this.canSelectCard(digiCard)) {
      this.store.dispatch(setLocalPlayerCard({digimon: digiCard.digimon}));
  
      const player = await firstValueFrom(this.localPlayer$)
      if(player !== undefined) {
        let card = player.cards.find(playerCard => playerCard.digimon.name === digiCard.digimon.name);
  
        if(card !== undefined) {
          let cardIndex = player.cards.indexOf(card);
          this.signalR.notifyClientData(this.signalR.networkPlayerId, "ClientSelectedCard", {playerID: player.id, cardIndex});
          let networkCard = await firstValueFrom(this.store.select(networkCardSelector));
  
          let log = networkCard === undefined ? `You selected ${digiCard.digimon.name}. Please wait your enemy to select his card.` : 
          `You selected ${digiCard.digimon.name}. Press Fight button to initiate the battle.`
          
          this.store.dispatch(updateLogAction({log}));
          const networkPlayer = await firstValueFrom(this.netWorkPlayer$);
          this.signalR.notifyClient(networkPlayer?.id, "CloseDialogBox");
        }
      }
    }
  }

  async canSelectCard(digiCard: Digicard) {
    if(digiCard.selected) {
      this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: "Card selected!",
          text: 'This card was already selected.'
        }
      });
      
      return false;
    }
    else {
      const localCard = await firstValueFrom(this.store.select(localCardSelector));

      if(localCard !== undefined) {
        this.dialog.open(ConfirmationModalComponent, {
          data: {
            title: "You already selected a card!",
            text: `You already selected a card in the field. 
              You can only select another card when your card in the field be destroyed.`
          }
        });

        return false;
      }
    }
    
    return true;
  }
}