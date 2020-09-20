import { Component, OnInit } from '@angular/core';
import {GameService} from "../game.service";
import {ToastController} from "@ionic/angular";
import {Color, Position} from "../model";
import {combineLatest, of, Subject} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {

  constructor(public gameService: GameService, private toastController: ToastController) {
  }

  currentTurn: Color = 'WHITE'; // only for testing

  private selectedPosition: Position;

  private selectPositionSubject = new Subject<Position>();

  game$ = this.gameService.game$;

  private matrix$ = this.game$.pipe(map(game => game.board.asMatrix))

  private possibleMovesForSelectedPosition$ = this.selectPositionSubject.pipe(
      switchMap(pos => {
        if (this.selectedPosition) {
          this.move(this.selectedPosition, pos);
          this.selectedPosition = null;
          return of([]);
        } else {
          this.selectedPosition = pos;
          return this.gameService.possibleMoves('1', this.currentTurn, pos).pipe(
              catchError(() => of([]))
          )
        }
      }),
      startWith([]),
  );

  matrixAndPossibleMoves$ = combineLatest([this.matrix$, this.possibleMovesForSelectedPosition$]);

  ngOnInit() {
    this.game$.subscribe(game => this.currentTurn = game.turn);
  }

  selectPosition(x: number, y: number) {
    const pos = {x, y};
    this.selectPositionSubject.next(pos);
  }

  move(from: Position, to: Position) {
    this.gameService.applyMove('1', {id: '1', color: this.currentTurn}, from, to).pipe(
        catchError(err => {
          this.toastController.create({
            message: err.error.message,
            duration: 2000,
            color: 'danger'
          }).then(toast => toast.present());
          return of(null)
        })
    ).subscribe();
  }

  contains(haystack: Position[], needle: Position) {
    return haystack.findIndex(pos => pos.x === needle.x && pos.y === needle.y) !== -1;
  }

}
