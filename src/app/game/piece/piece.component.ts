import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-piece',
    templateUrl: './piece.component.html',
    styleUrls: ['./piece.component.scss'],
})
export class PieceComponent implements OnInit {

    @Input()
    private type: string;

    @Input()
    color: string;

    imageSrc: string;

    constructor() {
    }

    ngOnInit() {
        this.imageSrc = 'assets/img/' + this.type.substring(this.type.lastIndexOf('.')+1).toLowerCase() + '.png';
    }

}
