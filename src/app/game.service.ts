import {Injectable, NgZone} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Game, GameAndTokens, Position} from './model';
import {Observable} from 'rxjs';
import {shareReplay} from "rxjs/operators";

//const URL = 'http://localhost:8080/game/';
const URL = 'https://chessenginex.herokuapp.com/game/';

@Injectable({
    providedIn: 'root'
})
export class GameService {

    constructor(private http: HttpClient, private zone: NgZone) {
    }

    createNewGame(): Observable<GameAndTokens> {
        return this.http.post<GameAndTokens>(URL, {});
    }

    // TODO potential memory leak...
    getGame$(gameId: string): Observable<Game> {
        return this.fromEventSource<Game>(URL + gameId).pipe(
            shareReplay({bufferSize: 1, refCount: true})
        );
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
        return new Observable<any>(observer => {
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
        });
    }

}
