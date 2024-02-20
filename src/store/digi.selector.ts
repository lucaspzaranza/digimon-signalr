import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AppState } from "src/models/app.state.model";

export const applicationSelector = createFeatureSelector<AppState>('application');

export const digimonsSelector = createSelector(
    applicationSelector,
    state => state.digimons
)

export const playersSelector = createSelector(
    applicationSelector,
    state => [...state.players].sort((a, b) => {
        if(a.isLocal) return -1;
        if(b.isLocal) return 1;
        return 0;
    })
)

export const localPlayerSelector = createSelector(
    applicationSelector,
    state => state.players.find(player => player.isLocal)
)

export const playerSelectorById = (playerId: string) => createSelector(
    applicationSelector,
    state => state.players.find(player => player.id === playerId)
)

export const localCardSelector = createSelector(
    applicationSelector,
    state => state.localCard
)

export const networkCardSelector = createSelector(
    applicationSelector,
    state => state.networkPlayerCard
)

export const localAndNetworkCardsSelector = createSelector(
    applicationSelector,
    state => ({
        localCard: state.localCard,
        networkCard: state.networkPlayerCard
    })
)

export const logSelector = createSelector(
    applicationSelector,
    state => state.log
)

export const receivedChallengeSelector = createSelector(
    applicationSelector,
    state => ({
        receivedChallenge: state.receivedChallenge,
        challengerPlayer: state.challengerPlayer
    })
)

export const waitingForPlayerResponseSelector = createSelector(
    applicationSelector,
    state => state.waitingPlayerResponse
)

export const winnerSelector = createSelector(
    applicationSelector,
    state => state.winner
)

export const loserSelector = createSelector(
    applicationSelector,
    state => state.loser
)