import { Component, EventEmitter, Input, Output } from '@angular/core';

export enum Arrows {
  Top,
  Bottom,
  Left,
  Right,
  TopRight,
  BottomRight,
  BottomLeft,
  TopLeft,
  Center
}

@Component({
  selector: 'app-arrows',
  templateUrl: './arrows.component.html',
  styleUrls: ['./arrows.component.scss']
})
export class ArrowsComponent {
  @Input()
  title: string = '';
  @Input()
  disable: Arrows[] = [];
  @Output()
  onClick: EventEmitter<Arrows> = new EventEmitter();

  public isDisabled(arrow: Arrows):boolean {
    return this.disable.find(x=>x == arrow) !== undefined;
  }

  public get arrows(): typeof Arrows {
    return Arrows;
  }

  arrow(arrow: Arrows) {
    this.onClick.emit(arrow);
  }
}
