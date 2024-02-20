import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { getDigimons, setDigimons, getDigimonsSuccess } from './digi.actions';
import { map, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Digimon } from 'src/models/digimon.model';
import { AppState } from 'src/models/app.state.model';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class DigiEffectService {
  baseUrl: string = 'https://digimon-api.vercel.app/api/digimon';
  constructor(private actions: Actions, private http: HttpClient, private store: Store<AppState>) { }

  loadDigimons = createEffect(
    () => this.actions.pipe(
      ofType(getDigimons),
      switchMap(() => this.http.get<Digimon[]>(this.baseUrl)),
      tap(digimons => {
        this.store.dispatch(setDigimons({ digimons: digimons}))
      }),
      map(() => getDigimonsSuccess())
    )
  )
}
