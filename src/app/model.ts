export type Color = 'WHITE' | 'BLACK';

export interface Game {
    id: string;
    player1: Player;
    player2: Player;
    turn: Color;
    winner?: Color;
    draw?: Boolean;
    check?: Color;
    board: ChessBoard;
}

export interface Player {
    id: string;
    color: Color;
}

export interface ChessBoard {
    ranks: number;
    pieces: Piece[];
    asMatrix: Piece[][];
}

export interface Piece {
    id: string;
    type: string;
    moveCount: number;
    char: string;
    color: Color;
    unicodeSymbol: string;
    position: Position;
}

export interface Position {
    file?: string;
    rank?: number;
    x: number;
    y: number;
}


