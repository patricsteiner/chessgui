import {Injectable, NgZone} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Game, GameAndTokens, Position} from './model';
import {Observable, ReplaySubject} from 'rxjs';
import {filter, shareReplay, switchMap} from "rxjs/operators";

//const URL = 'http://localhost:8080/game/';
const URL = 'https://chessenginex.herokuapp.com/game/';

@Injectable({
    providedIn: 'root'
})
export class GameService {

    constructor(private http: HttpClient, private zone: NgZone) {
    }

    loadGameIdSubject = new ReplaySubject<string>();

    game$ = this.loadGameIdSubject.pipe(
        filter(id => !!id),
        switchMap(id => this.fromEventSource<Game>(URL + id)),
        shareReplay({bufferSize: 1, refCount: true}),
    );

    loadGame(gameId: string) {
        this.loadGameIdSubject.next(gameId);
    }

    createNewGame(): Observable<GameAndTokens> {
        return this.http.post<GameAndTokens>(URL, {});
    }

    applyMove(gameId: string, colorToken: string, from: Position, to: Position): Observable<Game> {
        const params = {colorToken};
        return this.http.post<Game>(URL + gameId, {from, to}, {params: params as any});
    }

    possibleMoves(gameId: string, from: Position): Observable<Position[]> {
        const params = {x: from.x, y: from.y};
        return this.http.get<Position[]>(URL + gameId + '/possibleMoves', {params: params as any});
    }

    private fromEventSource<T>(url: string): Observable<T> {
        return new Observable<T>(observer => {
            const eventSource = new EventSource(url);
            eventSource.onmessage = event => {
                this.zone.run(() => {
                    observer.next(JSON.parse(event.data));
                });
            };
            eventSource.onerror = error => {
                this.zone.run(() => {
                    observer.error(error);
                });
            };
            return () => eventSource.close();
        });
    }

}
