import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { MathUtilsService } from 'src/app/services/math-utils.service';
import { SignalrService } from 'src/app/signalr.service';
import { AppState } from 'src/models/app.state.model';
import { Digicard } from 'src/models/digicard.model';
import { Player } from 'src/models/player.model';
import { setHP, setLocalPlayerCard, setLoser, setNetworkPlayerCard, setWinner, updateLogAction } from 'src/store/digi.actions';
import { localAndNetworkCardsSelector, localPlayerSelector, logSelector, 
  playerSelectorById, winnerSelector } from 'src/store/digi.selector';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-game-arena',
  templateUrl: './game-arena.component.html',
  styleUrls: ['./game-arena.component.css']
})
export class GameArenaComponent {
  localCard: Digicard | undefined;
  networkCard: Digicard | undefined;
  log$ = this.store.select(logSelector)

  constructor (
    private signalR: SignalrService, 
    private store: Store<AppState>, 
    private mathUtils: MathUtilsService, 
    private router: Router,
    public dialog: MatDialog) {
    this.store.select(localAndNetworkCardsSelector).subscribe(({localCard, networkCard}) => {
      this.localCard = localCard;
      this.networkCard = networkCard;
    })

    this.store.dispatch(updateLogAction({log: 'Select your Digimon to battle.'}));
  }

  drawBattle() {
    const id = this.signalR.networkPlayerId;
    this.store.dispatch(setLocalPlayerCard({digimon: undefined}))
    this.store.dispatch(setNetworkPlayerCard({playerID: id, cardIndex: -1})) // -1 means undefined

    this.signalR.notifyClientData(id, "ClientSelectedCard", {playerID: id, cardIndex: -1}); // -1 means undefined
    this.signalR.notifyClient(id, "DeleteLocalCard");    
  }

  localPlayerWins(networkPlayer: Player | undefined, difference: number) {
    let newHP: number = 0;
    this.store.dispatch(setNetworkPlayerCard({playerID: this.signalR.networkPlayerId, cardIndex: -1})) // -1 means undefined

    if(networkPlayer !== undefined) {
      newHP = this.mathUtils.Clamp(networkPlayer.hp - difference, 0, 100);
      this.store.dispatch(setHP({id: networkPlayer.id, value: newHP}))
    }

    this.signalR.notifyClient(networkPlayer?.id, "DeleteLocalCard");
    this.signalR.notifyClientData(this.signalR.networkPlayerId, "UpdateHP", {playerID: networkPlayer?.id, hp: newHP});
  }

  networkPlayerWins(localPlayer: Player | undefined, difference: number) {
    let newHP: number = 0;
    this.store.dispatch(setLocalPlayerCard({digimon: undefined}))

    if(localPlayer !== undefined) {
      newHP = this.mathUtils.Clamp(localPlayer.hp - difference, 0, 100);
      this.store.dispatch(setHP({id: localPlayer.id, value: newHP}))
    }

    const id = this.signalR.networkPlayerId;
    this.signalR.notifyClientData(id, "ClientSelectedCard", {playerID: id, cardIndex: -1}); // -1 means undefined
    this.signalR.notifyClientData(id, "UpdateHP", {playerID: localPlayer?.id, hp: newHP});
  }

  async fight() {
    const networkPlayer = await firstValueFrom(this.store.select(playerSelectorById(this.signalR.networkPlayerId)));
    const localPlayer = await firstValueFrom(this.store.select(localPlayerSelector));

    let textToLog = '';

    if(this.localCard !== undefined && this.networkCard !== undefined) {
      let localAttack = this.localCard.attack;
      let networkAttack = this.networkCard.attack;
  
      localAttack = this.mathUtils.Clamp(this.mathUtils.GetRandomInteger(localAttack - 10, localAttack + 10), 0, localAttack + 10);
      networkAttack = this.mathUtils.Clamp(this.mathUtils.GetRandomInteger(networkAttack - 10, networkAttack + 10), 0, networkAttack + 10);
      let difference = Math.abs(localAttack - networkAttack);

      textToLog = `${this.localCard.digimon.name}: ${localAttack} 🗡️`
      textToLog += `\n${this.networkCard.digimon.name}: ${networkAttack} 🗡️`

      if(localAttack === networkAttack) {
        textToLog += '\nDraw! Both digimons were destroyed.';
        const modalTitle: string = 'Draw!';
        const modalText: string = `Both digimons were destroyed.`;

        this.signalR.notifyClient(networkPlayer?.id, "CloseDialogBox");
        this.signalR.notifyClientData(networkPlayer?.id, "ShowDialogBox", {title: modalTitle, text: modalText});

        this.dialog.open(ConfirmationModalComponent, {
          data: {
            title: modalTitle,
            text: modalText
          }
        });

        this.drawBattle();
      }
      else if(localAttack > networkAttack) {
        const textToUpdateLog = `\n${this.localCard.digimon.name} wins the battle. It'll inflict ${difference} damage on the enemy.`;
        textToLog += textToUpdateLog;

        const modalText: string = `${this.localCard.digimon.name} wins the battle.`

        this.signalR.notifyClient(networkPlayer?.id, "CloseDialogBox");
        this.signalR.notifyClientData(networkPlayer?.id, "ShowDialogBox", 
          {title: 'The enemy player monster wins.', text: modalText});

        this.dialog.open(ConfirmationModalComponent, {
          data: {
            title: 'Your monster wins.',
            text: modalText
          }
        });

        this.localPlayerWins(networkPlayer, difference);
      }
      else if(localAttack < networkAttack) {
        const textToUpdateLog = `\n${this.networkCard.digimon.name} wins the battle. It'll inflict ${difference} damage on the enemy.`;
        textToLog += textToUpdateLog;

        const modalText: string = `${this.networkCard.digimon.name} wins the battle.`

        this.signalR.notifyClient(networkPlayer?.id, "CloseDialogBox");
        this.signalR.notifyClientData(networkPlayer?.id, "ShowDialogBox", 
          {title: 'Your monster wins.', text: modalText});

        this.dialog.open(ConfirmationModalComponent, {
          data: {
            title: 'The enemy player monster wins.',
            text: modalText
          }
        });

        this.networkPlayerWins(localPlayer, difference);
      }

      this.store.dispatch(updateLogAction({log: textToLog}));
      this.signalR.notifyClientData(networkPlayer?.id, "UpdateLog", textToLog);

      if(localPlayer !== undefined && networkPlayer !== undefined) {
        await this.matchEndVerification();
      }
    }
  }

  async matchEndVerification() {
    const networkPlayer = await firstValueFrom(this.store.select(playerSelectorById(this.signalR.networkPlayerId)));
    const localPlayer = await firstValueFrom(this.store.select(localPlayerSelector));
    let textToLog = '';
    
    if(localPlayer !== undefined && networkPlayer !== undefined) {
      if(localPlayer.hp <= 0 || localPlayer.cards.every(card => card.selected)) {
        this.store.dispatch(updateLogAction({log: `${networkPlayer.name} is the winner.`}))
        textToLog = `${networkPlayer.name} is the winner.`;
        this.signalR.notifyClientData(networkPlayer?.id, "UpdateLog", textToLog);
        this.store.dispatch(setWinner({player: networkPlayer}));
        this.store.dispatch(setLoser({player: localPlayer}));
      }
      else if(networkPlayer.hp <= 0 || networkPlayer.cards.every(card => card.selected)) {
        textToLog = `${localPlayer.name} is the winner.`;
        this.store.dispatch(updateLogAction({log: `${localPlayer.name} is the winner.`}))
        this.signalR.notifyClientData(networkPlayer?.id, "UpdateLog", textToLog);
        this.store.dispatch(setWinner({player: localPlayer}));
        this.store.dispatch(setLoser({player: networkPlayer}));
      }

      const winner = await firstValueFrom(this.store.select(winnerSelector));
      if(winner !== undefined) {     
        setTimeout(() => {
          this.router.navigate(['endgame']);
          this.signalR.notifyClientData(this.signalR.networkPlayerId, "GoToEndGameScreen", {winner});
        }, 1000);        
      }
    }
  }
}
