import {Component, Input, OnInit} from '@angular/core';
import {Piece, Position} from "../../model";
import {catchError, map, startWith, switchMap, tap} from "rxjs/operators";
import {combineLatest, Observable, of, Subject} from "rxjs";
import {GameService} from "../../game.service";
import {ToastController} from "@ionic/angular";
import {SoundService} from "../sound.service";

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {

    @Input()
    private colorToken: string;

    constructor(private gameService: GameService, private toastController: ToastController, private soundService: SoundService) {
    }

    ngOnInit() {
    }

    game$ = this.gameService.game$;

    selectedPosition: Position;

    private selectPositionSubject = new Subject<Position>();

    private matrix$: Observable<Piece[][]> = this.game$.pipe(map(game => game.board.asMatrix))

    private possibleMovesForSelectedPosition$: Observable<Position[]> = this.selectPositionSubject.pipe(
        switchMap(pos => {
            if (this.selectedPosition) {
                this.move(this.selectedPosition, pos);
                this.selectedPosition = null;
                return of([]);
            } else {
                this.selectedPosition = pos;
                return this.gameService.possibleMoves(pos).pipe(
                    catchError(() => of([]))
                )
            }
        }),
        startWith([]),
    );

    matrixAndPossibleMoves$ = combineLatest([this.matrix$, this.possibleMovesForSelectedPosition$]);

    selectPosition(x: number, y: number) {
        const pos = {x, y} as Position;
        this.selectPositionSubject.next(pos);
    }

    async move(from: Position, to: Position) {
        this.gameService.applyMove(this.colorToken, from, to).pipe(
            tap(game => {
                const piece = game.board.pieces.find(piece => piece.position.x === to.x && piece.position.y === to.y);
                // this.soundService.moveSound(piece);
            }),
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
