import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameService} from "../game.service";
import {AlertController, NavController, ToastController} from "@ionic/angular";
import {Position} from "../model";
import {combineLatest, of, Subject} from "rxjs";
import {catchError, filter, map, shareReplay, startWith, switchMap, take, takeUntil} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-game',
    templateUrl: './game.page.html',
    styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit, OnDestroy {

    constructor(public gameService: GameService, private toastController: ToastController, private navCtrl: NavController, private activatedRoute: ActivatedRoute, private alertController: AlertController) {
    }

    colorToken$ = this.activatedRoute.queryParams.pipe(
        map(params => params.colorToken),
        filter(colorToken => !!colorToken)
    );

    gameId$ = this.activatedRoute.params.pipe(
        map(params => params.id),
        filter(id => !!id)
    );

    colorToken: string;
    gameId: string;
    destroy$ = new Subject();

    private selectedPosition: Position;

    private selectPositionSubject = new Subject<Position>();

    game$ = this.gameId$.pipe(
        switchMap(id => this.gameService.getGame$(id)), // TODO need to unsubscribe, opens too many sse connections (i think) --> build a store or sth
        shareReplay({bufferSize: 1, refCount: true})
    );

    private matrix$ = this.game$.pipe(map(game => game.board.asMatrix))

    private possibleMovesForSelectedPosition$ = this.selectPositionSubject.pipe(
        switchMap(pos => {
            if (this.selectedPosition) {
                this.move(this.selectedPosition, pos);
                this.selectedPosition = null;
                return of([]);
            } else {
                this.selectedPosition = pos;
                return this.gameService.possibleMoves(this.gameId, pos).pipe(
                    catchError(() => of([]))
                )
            }
        }),
        startWith([]),
    );

    matrixAndPossibleMoves$ = combineLatest([this.matrix$, this.possibleMovesForSelectedPosition$]);

    ngOnInit() {
        this.gameId$.pipe(takeUntil(this.destroy$)).subscribe(gameId => this.gameId = gameId);
        this.colorToken$.pipe(takeUntil(this.destroy$)).subscribe(colorToken => this.colorToken = colorToken);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    async createNewGame() {
        const gameAndTokens = await this.gameService.createNewGame().pipe(take(1)).toPromise();
        await this.navCtrl.navigateForward('/game/' + gameAndTokens.game.id + '?colorToken=' + gameAndTokens.whiteToken);

        const blackUrl = window.location.href.replace(gameAndTokens.whiteToken, gameAndTokens.blackToken);
        const alert = await this.alertController.create({
            cssClass: 'alertDialog',
            header: 'URL für di Kolleg',
            inputs: [
                {
                    name: 'url',
                    type: 'text',
                    value: blackUrl,
                },
            ],
            buttons: [
                {
                    text: 'Geilomatico',
                }]
        });
        await alert.present();
    }

    selectPosition(x: number, y: number) {
        const pos = {x, y};
        this.selectPositionSubject.next(pos);
    }

    async move(from: Position, to: Position) {
        this.gameService.applyMove(this.gameId, this.colorToken, from, to).pipe(
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
