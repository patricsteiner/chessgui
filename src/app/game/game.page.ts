import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameService} from "./game.service";
import {AlertController, NavController} from "@ionic/angular";
import {Subject} from "rxjs";
import {filter, map, take, takeUntil} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-game',
    templateUrl: './game.page.html',
    styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit, OnDestroy {

    constructor(public gameService: GameService, private navCtrl: NavController, private activatedRoute: ActivatedRoute, private alertController: AlertController) {
    }

    colorToken$ = this.activatedRoute.queryParams.pipe(
        map(params => params.colorToken),
        filter(colorToken => !!colorToken)
    );

    gameId$ = this.activatedRoute.params.pipe(
        map(params => params.id),
        filter(id => !!id)
    );

    destroy$ = new Subject();

    game$ = this.gameService.game$;

    ngOnInit() {
        this.gameId$.pipe(takeUntil(this.destroy$)).subscribe(gameId => {
            this.gameService.gameId$.next(gameId);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    async createNewGame() {
        const requireColorTokens = false; // TODO make UI option
        const gameAndTokens = await this.gameService.createNewGame(requireColorTokens).pipe(take(1)).toPromise();
        await this.navCtrl.navigateForward('/game/' + gameAndTokens.game.id + '?colorToken=' + gameAndTokens.whiteToken);

        if (requireColorTokens) {
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
                    }
                ]
            });
            await alert.present();
        }
    }

}
