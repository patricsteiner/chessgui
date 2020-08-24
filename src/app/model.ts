export type Color = 'WHITE' | 'BLACK'

export interface ChessBoard {
    turn: Color;
    pieces: Piece[];
}

export interface Piece {
    type: string;
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


