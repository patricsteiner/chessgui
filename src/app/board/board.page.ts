import {Component, OnInit} from '@angular/core';
import {GameService} from '../game.service';
import {catchError, filter, map, startWith, switchMap} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, of, Subject} from 'rxjs';
import {Color, Position} from '../model';

@Component({
    selector: 'app-board',
    templateUrl: './board.page.html',
    styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

    constructor(private gameService: GameService) {
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
                return this.gameService.possibleMoves('1', pos);
            }
        }),
        startWith([])
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
                console.error(err.error.message);
                return of(null)
            })
        ).subscribe();
    }

    contains(haystack: Position[], needle: Position) {
        return haystack.findIndex(pos => pos.x === needle.x && pos.y === needle.y) !== -1;
    }

}
