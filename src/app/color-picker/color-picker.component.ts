import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements OnInit {
  @Input()
  selectedColor: string = '';
  @Output()
  onColorChange:  EventEmitter<string> = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  changeColor(event: any) {
    this.onColorChange.emit(event);
  }
}
