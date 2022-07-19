import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Font, FontInterface, FontPickerService } from 'ngx-font-picker';
import { Arrows } from '../arrows/arrows.component';
import { CanvasActions, CanvasService, Context, ICanvasAction, ICanvasItem, ICanvasItemViewModel } from '../canvas.service';
import * as WebFont from 'webfontloader';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas')
  private canvas: ElementRef = {} as ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasAction')
  private canvasAction: ElementRef = {} as ElementRef<HTMLCanvasElement>;

  public context: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
  public contextAction: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;

  constructor(private canvasService: CanvasService, private fontPickerService: FontPickerService) { }
  items: ICanvasItem[] = [];
  resizeStep: number = 10;
  zoomPercentage: number = 0;
  pzoomPercentage: number = 0;
  rotateStep: number = 5;
  canvasHeight: number = 500;
  canvasWidth: number = 250;
  selectedFiles?: FileList;
  currentFile?: File;
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


  changeText(event: any) {
    event.stopPropagation();
    this.selectedItem.Actions[CanvasActions.DrawText].Value = event.target.value;
    this.canvasService.resetContext();
    this.canvasService.renderItems();
  }


  changeFont(font: FontInterface) {
    font.size = this.selectedItem.Height + "px";
    this.selectedItem.FontOptions.font = this.selectedItem.Height + "px " + font.family
    this.canvasService.resetContext();
    this.canvasService.renderItems();

  }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  loadFile(): void {
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
      if (file) {
        this.currentFile = file;
        this.canvasService.loadFile(this.currentFile).then(() => {
          this.canvasService.renderItems();
        });
      }
      this.selectedFiles = undefined;
    }
  }

  public get enableEditor(): boolean {
    return this.selectedItem?.Type != undefined && this.selectedItem.IsVisible;
  }

  public get resizePercentage(): number {
    return this.canvasService.selectedItem?.Actions[CanvasActions.Resize]?.Value ? this.canvasService.selectedItem.Actions[CanvasActions.Resize].Value : 0;
  }
  public get angle(): number {
    return this.canvasService.selectedItem?.Actions[CanvasActions.Rotate]?.Value ? this.canvasService.selectedItem.Actions[CanvasActions.Rotate].Value : 0;
  }
  public get selectedItemIsVisible(): boolean {
    return this.canvasService?.selectedItem?.IsVisible ?? false;
  }
  public get selectedItem(): ICanvasItem {
    return this.canvasService?.selectedItem ?? {} as ICanvasItem;
  }

  public get actions(): typeof CanvasActions {
    return CanvasActions;
  }

  public get direction(): typeof Arrows {
    return Arrows;
  }

  public get alignment(): typeof Arrows {
    return Arrows;
  }

  changeTextColor(color: any) {
    this.selectedItem.Color = color;
    this.canvasService.resetContext();
    this.canvasService.renderItems();
  }

  white2transparent() {
    if (this.canvasService.selectedItem) {
      this.canvasService.white2transparent(this.canvasService.selectedItem);
    }
  }


  visibility(item: ICanvasItem) {
    item.IsVisible = !item.IsVisible;
    this.render();
  }

  align(align: Arrows) {
    if (this.canvasService.selectedItem) {
      this.canvasService.align(this.canvasService.selectedItem, align);
    }
    this.canvasService.renderItems();
  }

  move(direction: Arrows) {
    if (this.canvasService.selectedItem) {
      this.canvasService.move(this.canvasService.selectedItem, direction);
    }
    this.canvasService.renderItems();
  }

  zoom($element: any) {
    let value = $element.target.valueAsNumber;
    if (value == 0) {
      this.canvasHeight = 1000
    } else if (value == 0 || value > this.pzoomPercentage) {
      this.canvasHeight /= (value / 100) + 1;
    } else {
      this.canvasHeight *= (value / 100) + 1;
    }
    this.canvasWidth = this.canvasHeight;
    this.zoomPercentage = value;
    this.pzoomPercentage = this.zoomPercentage;
    this.context.canvas.width = this.canvasWidth;
    this.context.canvas.height = this.canvasHeight;
    this.canvasService.setCanvasDisplayContext(this.context);
    this.canvasService.resetContext();
    this.render();
  }

  loadItem() {
    if (this.canvasService.selectedItem) {
      this.canvasService.renderItem(this.canvasService.selectedItem);
    }
  }

  clear() {
    this.canvasService.resetContext();
  }

  deleteItem() {
    if (this.canvasService.selectedItem) {
      this.items = this.canvasService.removeItem(this.canvasService.selectedItem.Id);
    }
  }

  selectItem(item: ICanvasItem) {
    this.canvasService.selectItem(item);
    this.font.family = item.FontOptions.font;
    this.font.size = item.Height + 'px';
  }

  save() {
    this.canvasService.save();
  }

  restore() {
    this.zoomPercentage = 0;
    this.canvasService.selectedItem = {} as ICanvasItem;
    this.canvasService.restore();
  }

  render() {
    this.canvasService.resetContext();
    this.canvasService.renderItems();
  }

  resize($element: any) {
    $element.stopPropagation();
    if (this.canvasService.selectedItem) {
      let item = this.canvasService.selectedItem;
      if (!item.Actions[CanvasActions.Resize]) {
        item.Actions[CanvasActions.Resize] = {} as ICanvasAction;
      }
      item.Actions[CanvasActions.Resize].Value = $element.target.valueAsNumber;
      this.canvasService.resize(item);
      this.render();
    }
  }

  rotate($element: any) {
    $element.stopPropagation();
    if (this.canvasService.selectedItem) {
      let item = this.canvasService.selectedItem;
      item.Actions[CanvasActions.Rotate] = item.Actions[CanvasActions.Rotate] ? item.Actions[CanvasActions.Rotate] : { Value: this.angle } as ICanvasAction;
      item.Actions[CanvasActions.Rotate].Value = $element.target.value;
      this.canvasService.rotateItem(item);
      this.render();
    }
  }

  download() {
    this.canvasService.download();
  }

  actionToViewModel(x: ICanvasAction): ICanvasAction {
    if (!x) return {} as ICanvasAction;
    return {
      Value: x.Value.length > 25 ? x.Value.substring(0, 25) : x.Value,
      CurrentValue: x?.CurrentValue?.length > 25 ? x?.CurrentValue?.substring(0, 25) : x?.CurrentValue,
      Name: x.Name,
      IsPainted: x.IsPainted,
      IsRendered: x.IsRendered
    }
  }
  actionsToViewModel(item: ICanvasItem): ICanvasAction[] {
    let actionsViewModel: ICanvasAction[] = [];
    item.Actions.forEach(x => {
      actionsViewModel.push(this.actionToViewModel(x))
    })
    return actionsViewModel;
  }
  toViewModel(item: ICanvasItem): ICanvasItemViewModel {
    let actionsViewModel = this.actionsToViewModel(item);
    return {
      IsVisible: item.IsVisible,
      Type: CanvasActions[item.Type],
      Color: item?.Color,
      Dx: item?.Dx,
      Dy: item?.Dy,
      LayerIndex: item?.LayerIndex,
      Width: item.Width,
      Height: item.Height,
      Url: item?.Url,
      GlobalCompositeOperation: item?.GlobalCompositeOperation,
      FontOptions: item?.FontOptions,
      Id: item?.Id,
      Actions: actionsViewModel
    } as ICanvasItemViewModel;
  }

  ngAfterViewInit(): void {

    this.context = this.canvas.nativeElement.getContext('2d');
    this.contextAction = this.canvasAction.nativeElement.getContext('2d');


    this.canvasService.setCanvasDisplayContext(this.context);
    this.canvasService.setCanvasActionContext(this.contextAction);



    let loading = {
      LayerIndex: -1,
      Type: CanvasActions.DrawText,
      Context: Context.Display,
      IsVisible: true
    } as ICanvasItem
    loading.Actions = [];
    loading.Actions[loading.Type] = {
      Value: 'Loading...',
      IsPainted: false
    } as ICanvasAction
    this.canvasService.pushItem(loading);
    this.canvasService.renderItem(loading);

    let phone = {
      Url: 'assets/phone.png',
      LayerIndex: 2,
      Context: Context.Display,
      IsVisible: false
    } as ICanvasItem;
    phone.Actions = [];
    phone.Actions[CanvasActions.DrawImage] = {
      IsPainted: false
    } as ICanvasAction

    let mask = {
      Url: "assets/phonet.png",
      LayerIndex: 998,
      Context: Context.Display,
      IsVisible: false
    } as ICanvasItem
    mask.Actions = [];
    mask.Actions[CanvasActions.DrawImage] = {
      IsPainted: false
    } as ICanvasAction

    let draw = {
      Url: "assets/index.png",
      LayerIndex: 3,
      Context: Context.Display,
      IsVisible: true
    } as ICanvasItem
    draw.Actions = [];
    draw.Actions[CanvasActions.DrawImage] = {
      IsPainted: false
    } as ICanvasAction

    draw.Actions[CanvasActions.Align] = {
      IsPainted: false,
      Value: Arrows.TopRight
    } as ICanvasAction

    let text = {
      LayerIndex: 4,
      Context: Context.Display,
      IsVisible: true
    } as ICanvasItem
    text.Actions = [];
    text.Actions[CanvasActions.DrawText] = {
      Value: 'Apple',
      IsPainted: false
    } as ICanvasAction
    text.Actions[CanvasActions.Resize] = {
      IsPainted: false,
      Value: 160
    } as ICanvasAction
    text.Actions[CanvasActions.Align] = {
      IsPainted: false,
      Value: Arrows.Center
    } as ICanvasAction
    this.canvasService.pushItem(text)


    let imagesTasks = [
      this.canvasService.getImageFromUrl(phone),
      this.canvasService.getImageFromUrl(mask),
      this.canvasService.getImageFromUrl(draw)
    ]

    Promise.all(imagesTasks).then(() => {
      this.context.canvas.width = phone.Image.width;
      this.context.canvas.height = phone.Image.height;
      this.canvasService.removeItem(loading.Id)
      this.items = this.canvasService.getSortedItems();
      this.canvasService.renderItems();
    })
  }

}
