import {Injectable, NgZone} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Game, Player, Position} from './model';
import {Observable} from 'rxjs';
import {shareReplay} from "rxjs/operators";

const URL = 'http://localhost:8080/game/';

@Injectable({
    providedIn: 'root'
})
export class GameService {

    game$ = this.fromEventSource<Game>(URL + '1').pipe(shareReplay(1));

    constructor(private http: HttpClient, private zone: NgZone) {
    }

    applyMove(gameId: string, player: Player, from: Position, to: Position): Observable<Game> {
        return this.http.post<Game>(URL + gameId, {player, from, to});
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
