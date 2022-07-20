import { Component, Input, OnInit } from '@angular/core';
import { Font, FontInterface } from 'ngx-font-picker';
import { CanvasActions, CanvasService, ICanvasItem } from '../canvas.service';

@Component({
  selector: 'app-font-editor',
  templateUrl: './font-editor.component.html',
  styleUrls: ['./font-editor.component.scss']
})
export class FontEditorComponent implements OnInit {
  public get selectedItem(): ICanvasItem {
    return this.canvasService?.selectedItem ?? {} as ICanvasItem;
  }

  font: FontInterface = new Font({
    family: 'Roboto',
    size: '140px',
    style: 'regular',
    styles: ['regular']
  }) as FontInterface;
  public sizeSelect: boolean = false;
  public styleSelect: boolean = false;
  private _presetFonts = ['Arial', 'Times', 'Courier', 'Lato', 'Open Sans', 'Roboto Slab'];
  public presetFonts = this._presetFonts;

  constructor(private canvasService: CanvasService) { }



  public get actions(): typeof CanvasActions {
    return CanvasActions;
  }

  ngOnInit(): void {
    this.font.family = this?.selectedItem?.FontOptions?.font?.split('px')[1] ?? ''
  }

  changeText(event: any) {
    event.stopPropagation();
    this.selectedItem.Actions[CanvasActions.DrawText].Value = event.target.value;
    this.canvasService.resetContext();
    this.canvasService.renderItems();
  }

  changeTextColor(color: any) {
    this.selectedItem.Color = color;
    this.canvasService.resetContext();
    this.canvasService.renderItems();
  }

  changeFont(font: FontInterface) {
    this.selectedItem.FontOptions.font = this.selectedItem.Height + "px " + font.family
    this.canvasService.resetContext();
    this.canvasService.renderItems();
  }
}
