import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LobbyComponent } from "./components/lobby/lobby.component";
import { HomePageComponent } from "./components/home-page/home-page.component";
import { InGameComponent } from "./components/in-game/in-game.component";
import { EndGameComponent } from "./components/end-game/end-game.component";

const routes: Routes = [
    {
        path: '',
        component: HomePageComponent
    },
    {
        path: 'lobby',
        component: LobbyComponent
    },
    {
        path: 'ingame',
        component: InGameComponent
    },
    {
        path: 'endgame',
        component: EndGameComponent
    }
]

@NgModule({
    declarations: [],
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {}