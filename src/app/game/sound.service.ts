import {Injectable} from '@angular/core';
import {Piece} from "../model";

@Injectable({
    providedIn: 'root'
})
export class SoundService {

    constructor() {
    }

    async moveSound(piece: Piece) {
        const pieceName = piece.type.substring(piece.type.lastIndexOf(".") + 1).toLowerCase();
        const audio = new Audio(`./assets/sound/${pieceName}.m4a`);
        audio.load();
        try {
            await audio.play();
        } catch (e) {
            console.error("cannot play sound: " + audio.src)
        }
    }

}
