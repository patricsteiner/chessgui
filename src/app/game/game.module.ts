import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamePageRoutingModule } from './game-routing.module';

import { GamePage } from './game.page';
import {PieceComponent} from "./piece/piece.component";
import {BoardComponent} from "./board/board.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamePageRoutingModule
  ],
  declarations: [GamePage, PieceComponent, BoardComponent]
})
export class GamePageModule {}
