import { Component, Input, OnInit } from '@angular/core';
import { Digicard } from 'src/models/digicard.model';

@Component({
  selector: 'app-digicard',
  templateUrl: './digicard.component.html',
  styleUrls: ['./digicard.component.css']
})
export class DigicardComponent implements OnInit {

  @Input() inDuel: boolean = false;
  @Input() digiCard?: Digicard = {attack: 0, digimon: {name: '', level: '', img: ''}, selected: false};
  @Input() index: number = 0;
  @Input() invibisle: boolean = true;
  
  duelClassName: string = 'card-container-duel'

  ngOnInit(): void {
    if(this.inDuel) {
      if(this.index === 0) {
        this.duelClassName += '-left'
      }
      else if(this.index < 4) {
        this.duelClassName += '-middle'
      }
    }
  }
}
