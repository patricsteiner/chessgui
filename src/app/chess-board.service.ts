import {Injectable, NgZone} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ChessBoard, Color} from './model';
import {Observable} from 'rxjs';
import {Position} from './model';

const URL = 'http://localhost:8080/';

@Injectable({
    providedIn: 'root'
})
export class ChessBoardService {

    board$ = this.fromEventSource<ChessBoard>(URL + 'board');

    constructor(private http: HttpClient, private zone: NgZone) {
    }

    move(color: Color, from: Position, to: Position): Observable<ChessBoard> {
        return this.http.post<ChessBoard>(URL, {color, from, to});
    }

    possibleMoves(from: Position): Observable<Position[]> {
        const params = {x: from.x, y: from.y};
        return this.http.get<Position[]>(URL + 'possibleMoves', {params});
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
