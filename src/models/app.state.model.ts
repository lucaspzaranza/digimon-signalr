import { Digicard } from "./digicard.model";
import { Digimon } from "./digimon.model";
import { Player } from "./player.model";

export interface AppState {
    players: Player[],
    digimons: Digimon[],
    localCard?: Digicard,
    networkPlayerCard?: Digicard,
    log: string,
    receivedChallenge: boolean,
    challengerPlayer?: Player,
    waitingPlayerResponse?: boolean,
    winner?: Player
    loser?: Player
}