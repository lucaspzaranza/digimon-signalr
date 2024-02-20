import { DigiLevel, Digimon } from "./digimon.model";

const digiAttacks : DigiLevel[] = [
    {
        level: 'Fresh',
        attack: 5
    },
    {
        level: 'In Training',
        attack: 10
    },
    {
        level: 'Rookie',
        attack: 15
    },
    {
        level: 'Armor',
        attack: 20
    },
    {
        level: 'Champion',
        attack: 25
    },
    {
        level: 'Ultimate',
        attack: 40
    },
    {
        level: 'Mega',
        attack: 50
    }
]

export class Digicard {
    digimon: Digimon
    attack: number
    selected: boolean

    public constructor(digimonToAssign: Digimon | undefined, isSelected: boolean = false) {
        this.digimon = digimonToAssign === undefined? {img: '', level: '', name: ''} : digimonToAssign;

        let index = digiAttacks.findIndex(digi => digi.level.includes(this.digimon.level));
        this.attack = (index > -1)? digiAttacks[index].attack : 0;

        this.selected = isSelected;
    }
}