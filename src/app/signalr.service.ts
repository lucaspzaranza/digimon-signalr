import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { Store, props } from '@ngrx/store';
import { AppState } from 'src/models/app.state.model';
import { addPlayer, receivedChallengeAction, removePlayer, setDueling, setHP, setLocalPlayerCard, 
  setLoser, setNetworkPlayerCard, setWaitingPlayerResponseAction, setWinner, updateLogAction } from 'src/store/digi.actions';
import { Player } from 'src/models/player.model';
import { Router } from '@angular/router';
import { localCardSelector, localPlayerSelector, networkCardSelector,
  playerSelectorById, playersSelector, winnerSelector } from 'src/store/digi.selector';
import { first, firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  public hubConnection = new signalR.HubConnectionBuilder()
  .withUrl('http://localhost:5000/digihub', {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets
  })
  .configureLogging(signalR.LogLevel.Information)
  .build();

  public localIndex = 0;
  public networkPlayerIndex = 1;
  public networkPlayerId: string = '';

  constructor(
    private store: Store<AppState>,
    private router: Router,
    public dialog: MatDialog) { }

  startConnection() {
    this.hubConnection
    .start()
    .then(() => {
      console.log('Hub Connection Started!');
      this.serverListenersSetup();
    })
    .catch(err => console.log('Error while starting connection: ' + err))
  }

  serverListenersSetup() {
    this.hubConnection?.on("ServerResponse", (someText: string) => {
      console.log(someText)
    });

    this.hubConnection?.on("handShake", (newPlayer: Player) => {
      console.log(`${newPlayer.name} has joined the game`);
      newPlayer.isLocal = false;
      this.store.dispatch(addPlayer({newPlayer}));
    });

    this.hubConnection?.on("ReceiveChallenge", ({playerId, accepted}) => {
      let otherPlayer: Player | undefined;

      this.store.select(playersSelector).subscribe(players => {
        const index = players.findIndex(player => player.id === playerId);
        otherPlayer = players[index];
      }).unsubscribe()

      if(otherPlayer !== undefined) {
        this.store.dispatch(receivedChallengeAction({value: accepted, otherPlayer}));
      }
    });

    this.hubConnection?.on("CancelWaiting", () => {
      this.store.dispatch(setWaitingPlayerResponseAction({value: false}));
    })
    
    this.hubConnection?.on("StartDuel", (playerId: string) => {
      this.store.dispatch(setWaitingPlayerResponseAction({value: false}));
      this.store.select(playersSelector).subscribe(players => {
        this.networkPlayerId = playerId;

        const index = players.findIndex(player => player.id === playerId);

        this.localIndex = players.findIndex(player => player.isLocal);
        this.networkPlayerIndex = index;

        const localPlayer = players[this.localIndex];
        
        this.notifyOthersData("UpdateDuelStatus", {playerId: localPlayer.id, value: true});
        this.router.navigate(['ingame']);
      }).unsubscribe()
    });

    this.hubConnection?.on("UpdateDuelStatus", async ({playerId, value}) => {
      const players = await firstValueFrom(this.store.select(playersSelector));
      const player = await firstValueFrom(this.store.select(playerSelectorById(playerId)));

      console.log(`updating the player ${player?.name} to be in duel`);

      if(player !== undefined) {
        this.store.dispatch(setDueling({playerId: player.id, value}))
      }
    });

    this.hubConnection?.on("ClientSelectedCard", async ({playerID, cardIndex}) => {
      this.store.dispatch(setNetworkPlayerCard({playerID, cardIndex}));

      let localCard = await firstValueFrom(this.store.select(localCardSelector));
      let networkCard = await firstValueFrom(this.store.select(networkCardSelector));
      
      let log = localCard === undefined ? `Your oponent selected ${networkCard?.digimon.name}. Please select yours for battle.` : 
      `Now press Fight button to initiate the battle.`
      
      this.store.dispatch(updateLogAction({log}))
    });

    this.hubConnection?.on("DeleteLocalCard", () => {
      this.store.dispatch(setLocalPlayerCard({digimon: undefined}))
    });

    this.hubConnection?.on("UpdateLog", (log: string) => {
      this.store.dispatch(updateLogAction({log}))
    });

    this.hubConnection?.on("UpdateHP", ({playerID, hp}) => {
      this.store.dispatch(setHP({id: playerID, value: hp}))
    });

    this.hubConnection?.on("ShowDialogBox", ({title, text}) => {
      this.dialog.open(ConfirmationModalComponent, {
        data: {
          title,
          text
        }
      });
    });

    this.hubConnection?.on("CloseDialogBox", () => {
      this.dialog.closeAll();
    });

    this.hubConnection?.on("OnDisconnected", (playerId:string) => {
      this.store.dispatch(removePlayer({playerId}))
    });

    this.hubConnection?.on("GetYourPlayer", async (callerPlayerId: string) => {
      let localPlayer = await firstValueFrom(this.store.select(localPlayerSelector))
      this.notifyClientData(callerPlayerId, 'ReceivedPlayer', localPlayer);
    });

    this.hubConnection?.on("ReceivedPlayer", (player: Player) => {
      if(player !== null) {
        this.store.dispatch(addPlayer({newPlayer: {...player, isLocal: false}}));
      }
    });

    //GoToEndGameScreen
    this.hubConnection?.on("GoToEndGameScreen", async ({winner}) => {
      let localPlayer = await firstValueFrom(this.store.select(localPlayerSelector));
      let networkPlayer = await firstValueFrom(this.store.select(playerSelectorById(this.networkPlayerId)));
      let isThereAnyWinner = await firstValueFrom(this.store.select(winnerSelector)) !== undefined;

      if(!isThereAnyWinner) {
        if(winner.id === localPlayer?.id && networkPlayer !== undefined) {
          this.store.dispatch(setLoser({player: networkPlayer}));
        }
        this.store.dispatch(setWinner({player: winner}));
        this.router.navigate(['endgame']);
      }
    });
  }

  getAllPlayers(callerPlayerId: string) {
    this.hubConnection?.invoke("NotifyOthersData", "GetYourPlayer", callerPlayerId)
    .catch(err => console.log(err));
  }

  getPlayerId(): Promise<string> | undefined {
    return this.hubConnection?.invoke("GetPlayerId");
  }

  notifyServerAll(msg: string, data: any) {
    this.hubConnection?.invoke("NotifyAll", msg, data)
    .catch(err => console.log(err));
  }

  notifyClient(playerId: string | undefined, msg: string) {
    this.hubConnection?.invoke("NotifyClient", playerId, msg)
    .catch(err => console.log(err));
  }

  notifyClientData(playerID: string | undefined, msg: string, data: any) {
    this.hubConnection?.invoke("NotifyClientData", playerID, msg, data)
    .catch(err => console.log(err));
  }

  notifyOthers(msg: string) {
    this.hubConnection?.invoke("NotifyOthers", msg)
    .catch(err => console.log(err));
  }

  notifyOthersData(msg: string, data: any) {
    this.hubConnection?.invoke("NotifyOthersData", msg, data)
    .catch(err => console.log(err));
  }
}