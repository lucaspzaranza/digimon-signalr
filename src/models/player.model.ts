import { Digicard } from "./digicard.model";

export interface Player {
    name: string,
    cards: Digicard[],
    hp: number,
    isLocal: boolean,
    id: string,
    isDueling: boolean
}

export const SetupNewPlayer = (): Player => (
    {
        name: '',
        cards: [],
        hp: 0,
        isLocal: false,
        id: '',
        isDueling: false
    }
)
