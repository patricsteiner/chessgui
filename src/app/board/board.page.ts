import {Component, OnInit} from '@angular/core';
import {ChessBoardService} from "../chess-board.service";
import {catchError, map, switchMap, tap} from "rxjs/operators";
import {merge, of, Subject} from "rxjs";

@Component({
    selector: 'app-board',
    templateUrl: './board.page.html',
    styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

    selectedPosition: { x: number, y: number }

    moveSubject = new Subject<{ from: { x: number, y: number }, to: { x: number, y: number } }>()

    board$ = merge(
        this.moveSubject.pipe(
            switchMap(({from, to}) => this.boardService.move(from, to)),
            catchError((err, caught) => caught)
        ),
        this.boardService.board$
    ).pipe(
        map(board => {
                const matrix = new Array(8)
                for (let i = 0; i < 8; i++) {
                    matrix[i] = new Array(8)
                }
                for (let piece of board.pieces) {
                    matrix[piece.position.y][piece.position.x] = piece
                }
                return matrix
            }
        ),
        tap(console.log)
    )

    constructor(private boardService: ChessBoardService) {
    }

    ngOnInit() {

    }

    selectPosition(x: number, y: number) {
        const pos = {x, y}
        if (this.selectedPosition) {
            this.moveSubject.next({from : this.selectedPosition, to: pos});
            this.selectedPosition = null
        } else {
            this.selectedPosition = pos
        }
    }

}
