import { createReducer, on } from '@ngrx/store';
import { setDigimons, addPlayer, setDueling, setNetworkPlayerCard, setLocalPlayerCard, updateLogAction, setHP, receivedChallengeAction, setWaitingPlayerResponseAction, setWinner, setLoser, resetAllCardsToDefaultState, removePlayer } from './digi.actions';
import { AppState } from 'src/models/app.state.model';
import { Digicard } from 'src/models/digicard.model';
import { Player } from 'src/models/player.model';

export const initialState: AppState = { digimons: [], players: [], log: '', receivedChallenge: false};

function returnPlayerArrayWithSelectedCard(players: Player[], playerIndex: number, cardIndex: number): Player[] {
    return players.map((player: Player, playerIndexMap) => ({
        ...player,
        cards: player.cards.map((card, cardIndexMap) => (
            new Digicard(card.digimon, 
            ((playerIndexMap === playerIndex && cardIndexMap === cardIndex)? true : card.selected))))
    }));
}

function returnPlayerArrayWithAlteredHP(players: Player[], playerID: string, newHP: number): Player[] {
    return players.map((player: Player) => ({
        ...player,
        hp: player.id === playerID? newHP : player.hp
    }))
}

function returnPlayersWithResetCards(players: Player[]) {
    return players.map(player => ({
        ...player,
        cards: player.cards.map(card => ({
            ...card,
            selected: false
        }))
    }));
}

export const AppReducer = createReducer(initialState, 
    on(setDigimons, (state, action) => {
        return {
            ...state,
            digimons: action.digimons 
        }
    }),

    on(addPlayer, (state, action) => {
        let currentArray: Array<Player> = state.players;

        if(!currentArray.find(player => player.id === action.newPlayer.id)) {
            currentArray = [...currentArray, action.newPlayer];
        }

        return {
            ...state,
            players: currentArray
        }
    }),

    on(removePlayer, (state, action) => {
        return {
            ...state,
            players: state.players.filter(player => player.id !== action.playerId)
        }
    }),

    on(setDueling, (state, action) => ({
        ...state,
        players: state.players.map((player, index) => ({
            ...player,
            isDueling: player.id === action.playerId? action.value : player.isDueling
        }))
    })),

    on(setLocalPlayerCard, (state, action) => {
        let playerIndex = state.players.findIndex(player => player.isLocal);
        let cardIndex = state.players[playerIndex].cards.findIndex(card => card.digimon.name === action.digimon?.name);
        let playersWithSelectedCard = returnPlayerArrayWithSelectedCard(state.players, playerIndex, cardIndex)

        return {
            ...state,
            players: playersWithSelectedCard,
            localCard: action.digimon === undefined? undefined : 
                new Digicard(state.digimons.find(digimon => digimon.name === action.digimon?.name), true)
        }
    }),

    on(setNetworkPlayerCard, (state, action) => {
        let playersWithSelectedCard = state.players;

        if(action.cardIndex > 0) { // -1 means undefined
            let playerIndex = state.players.findIndex(player => player.id === action.playerID);
            let digiCard = state.players[playerIndex].cards[action.cardIndex];
            let cardIndex = state.players[playerIndex].cards.findIndex(card => card.digimon.name === digiCard.digimon.name);
            playersWithSelectedCard = returnPlayerArrayWithSelectedCard(state.players, playerIndex, cardIndex);
        }

        return {
            ...state,
            players: playersWithSelectedCard,
            networkPlayerCard: action.cardIndex < 0 ? undefined : new Digicard(
                state.players.find(player => player.id === action.playerID)
                ?.cards[action.cardIndex].digimon, true)
        }
    }),

    on(resetAllCardsToDefaultState, (state, action) => {
        return {
            ...state,
            players: returnPlayersWithResetCards(state.players)
        }
    }),

    on(updateLogAction, (state, action) => ({
        ...state,
        log: action.log
    })),

    on(setHP, (state, action) => ({
        ...state,
        players: returnPlayerArrayWithAlteredHP(state.players, action.id, action.value)
    })),

    on(receivedChallengeAction, (state, action) => ({
        ...state,
        receivedChallenge: action.value,
        challengerPlayer: action.otherPlayer
    })),

    on(setWaitingPlayerResponseAction, (state, action) => ({
        ...state,
        waitingPlayerResponse: action.value
    })),

    on(setWinner, (state, action) => ({
        ...state,
        winner: action.player
    })),

    on(setLoser, (state, action) => ({
        ...state,
        loser: action.player
    }))
)