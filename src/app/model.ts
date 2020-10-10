export type Color = 'WHITE' | 'BLACK';

export interface GameAndTokens {
    game: Game;
    whiteToken: string;
    blackToken: string;
}

export interface Game {
    id: string;
    turn: Color;
    winner?: Color;
    draw?: Boolean;
    check?: Color;
    board: ChessBoard;
    latestMove?: {from: Position, to: Position};
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


