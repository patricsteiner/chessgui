import {Component, OnInit} from '@angular/core';
import {ChessBoardService} from '../chess-board.service';
import {catchError, filter, map, startWith, switchMap} from 'rxjs/operators';
import {combineLatest, merge, of, Subject} from 'rxjs';
import {Color, Position} from '../model';

@Component({
    selector: 'app-board',
    templateUrl: './board.page.html',
    styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

    constructor(private boardService: ChessBoardService) {
    }

    colorDebug: Color = 'WHITE';

    private selectedPosition: Position;

    private moveSubject = new Subject<{ from: Position, to: Position }>();

    private selectPositionSubject = new Subject<Position>();

    private board$ = merge(
        this.moveSubject.pipe(
            switchMap(({from, to}) => this.boardService.move(this.colorDebug, from, to).pipe(
                catchError((error, caught) => {
                    console.error(error.error.message);
                    return of(undefined);
                })
            )),
        ),
        this.boardService.board$,
    ).pipe(
        filter(board => !!board),
        map(board => {
                const matrix = new Array(8);
                for (let i = 0; i < 8; i++) {
                    matrix[i] = new Array(8);
                }
                for (const piece of board.pieces) {
                    matrix[piece.position.y][piece.position.x] = piece;
                }
                return matrix;
            }
        )
    );

    private possibleMovesForSelectedPosition$ = this.selectPositionSubject.pipe(
        switchMap(pos => {
            if (this.selectedPosition) {
                this.moveSubject.next({from: this.selectedPosition, to: pos});
                this.selectedPosition = null;
                return of([]);
            } else {
                this.selectedPosition = pos;
                return this.boardService.possibleMoves(pos);
            }
        }),
        startWith([])
    );

    boardAndPossibleMoves$ = combineLatest([this.board$, this.possibleMovesForSelectedPosition$]);
    toggleColor = () =>  this.colorDebug = this.colorDebug === 'WHITE' ? 'BLACK' : 'WHITE';

    ngOnInit() {

    }

    selectPosition(x: number, y: number) {
        const pos = {x, y};
        this.selectPositionSubject.next(pos);
    }

    contains(haystack: Position[], needle: Position) {
        return haystack.findIndex(pos => pos.x === needle.x && pos.y === needle.y) !== -1;
    }

}
