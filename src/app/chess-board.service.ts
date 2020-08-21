import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {shareReplay} from "rxjs/operators";
import {ChessBoard} from "./model";
import {Observable} from "rxjs";
import {Position} from "./model";

const URL = 'http://localhost:8080'

@Injectable({
    providedIn: 'root'
})
export class ChessBoardService {

    board$ = this.http.get<ChessBoard>(URL)

    constructor(private http: HttpClient) {
    }

    move(from: { x: number, y: number }, to: { x: number, y: number }): Observable<ChessBoard> {
        return this.http.post<ChessBoard>(URL, {from, to})
    }

}
