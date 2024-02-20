import { createAction, props } from "@ngrx/store";
import { Digimon } from "src/models/digimon.model";
import { Player } from "src/models/player.model";

export const getDigimons = createAction('[Digimon] Get All Digimons');
export const setDigimons = createAction('[Digimon] Set All Digimons', props<{ digimons: Digimon[] }>());
export const getDigimonsSuccess = createAction('[Digimon] Get All Digimons Succeeded');

export const addPlayer = createAction('[Player] Add Player', props<{ newPlayer: Player}>());
export const removePlayer = createAction('[Player] Remove Player', props<{ playerId: string}>());
export const setDueling = createAction('[Player] Setting isDueling', props<{ playerId: string, value: boolean}>());
export const setHP = createAction('[Player] Setting Player HP', props<{id: string, value: number}>());

export const setLocalPlayerCard = createAction('[Player] Set Local Client Card', props<{digimon: Digimon | undefined}>());
export const setNetworkPlayerCard = createAction('[Player] Set Network Client Card', props<{playerID: string, cardIndex: number}>());
export const resetAllCardsToDefaultState = createAction('[Player] Reset All Cards');

export const updateLogAction = createAction('[Player] Update Log', props<{log: string}>());

export const receivedChallengeAction = createAction('[Player] Received Challenge', props<{value: boolean, otherPlayer?: Player}>());
export const setWaitingPlayerResponseAction = createAction('[Player] Set Waiting for Player Response', props<{value: boolean}>());

export const setWinner = createAction('[Player] Set Winner', props<{player?: Player}>());
export const setLoser = createAction('[Player] Set Loser', props<{player?: Player}>());
