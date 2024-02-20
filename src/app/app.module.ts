import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app.routing.module';

import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { AppReducer } from 'src/store/digi.reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { DigiEffectService } from 'src/store/digi.effect.service';
import { LobbyComponent } from './components/lobby/lobby.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LocalPlayerComponent } from './components/local-player/local-player.component';
import { NetworkPlayerComponent } from './components/network-players/network-players.component';
import { InGameComponent } from './components/in-game/in-game.component';
import { DigicardComponent } from './components/digicard/digicard.component';
import { GameArenaComponent } from './components/game-arena/game-arena.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { EndGameComponent } from './components/end-game/end-game.component';

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    HomePageComponent,
    LocalPlayerComponent,
    NetworkPlayerComponent,
    InGameComponent,
    DigicardComponent,
    GameArenaComponent,
    ConfirmationModalComponent,
    EndGameComponent,
  ],
  imports: [
    StoreModule.forRoot({ application: AppReducer }),
    StoreDevtoolsModule.instrument({logOnly: environment.production}),
    EffectsModule.forRoot([DigiEffectService]),
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ModalModule.forRoot(),
    FormsModule,
    BrowserAnimationsModule,    
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
