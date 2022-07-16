import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { delay } from 'rxjs';
import { CanvasActions, CanvasItemAlign, CanvasItemDirection, CanvasService, Context, ICanvasAction, ICanvasItem, ICanvasItemViewModel } from '../canvas.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  private canvas: ElementRef = {} as ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasAction')
  private canvasAction: ElementRef = {} as ElementRef<HTMLCanvasElement>;

  public context: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
  public contextAction: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;

  constructor(private canvasService: CanvasService) { }
  items: ICanvasItem[] = [];
  angle: number = 0;
  resizePercentage: number = 0;
  zoomPercentage: number = 0;
  pzoomPercentage: number = 0;
  rotateStep: number = 5;
  canvasHeight: number = 500;
  canvasWidth: number = 250;

  selectedItem: ICanvasItem = {} as ICanvasItem;

  ngOnInit(): void {

  }

  public get direction(): typeof CanvasItemDirection {
    return CanvasItemDirection;
  }
  public get alignment(): typeof CanvasItemAlign {
    return CanvasItemAlign;
  }

  white2transparent() {
    if(this.selectedItem){
      this.canvasService.white2transparent(this.selectedItem);
    }
  }

  visibility(){
    this.selectedItem.IsVisible = !this.selectedItem.IsVisible;
    this.render();
  }

  align(align:CanvasItemAlign) {
    if(this.selectedItem){
      this.canvasService.align(this.selectedItem,align);
    }
    this.canvasService.renderItems(this.canvasService.items);
  }

  move(direction:CanvasItemDirection) {
    if(this.selectedItem){
      this.canvasService.move(this.selectedItem,direction);
    }
    this.canvasService.renderItems(this.canvasService.items);
  }

  zoom($element: any) {
    var value = $element.target.valueAsNumber;
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
    this.canvasService.renderItem(this.selectedItem);
  }

  clear() {
    this.canvasService.resetContext();
  }

  deleteItem() {
    this.items = this.canvasService.removeItem(this.selectedItem.Id);
  }

  selectItem(item: ICanvasItem) {
    this.selectedItem = item;
    this.angle = item?.Actions[CanvasActions.Rotate]?.Value ? item.Actions[CanvasActions.Rotate].Value : 0;
    this.resizePercentage = item?.Actions[CanvasActions.Resize]?.Value ? item.Actions[CanvasActions.Resize].Value : 0;
    this.canvasService.selectItem(item);
    this.items = this.canvasService.items;
    this.canvasService.switchContext(Context.Action);
    this.canvasService.resetContext();
    this.white2transparent();
    this.canvasService.switchContext(Context.Display);
  }

  save() {
    this.canvasService.save();
  }

  restore() {
    this.angle = 0;
    this.resizePercentage = 0;
    this.zoomPercentage = 0;
    this.selectedItem = {} as ICanvasItem;
    this.canvasService.restore();
    this.items = this.canvasService.items;
  }

  render() {
    this.canvasService.renderItems(this.items);
  }

  resize($element: any) {
    $element.stopPropagation();
    var item = this.selectedItem;
    this.resizePercentage = $element.target.valueAsNumber;
    if (!item.Actions[CanvasActions.Resize]) {
      item.Actions[CanvasActions.Resize] = {} as ICanvasAction;
    }
    item.Actions[CanvasActions.Resize].Value = this.resizePercentage;
    this.canvasService.resize(item);
    this.items = this.canvasService.items
    this.render();
  }

  rotate($element: any) {
    $element.stopPropagation();
    var item = this.selectedItem;
    this.angle = $element.target.value;
    item.Actions[CanvasActions.Rotate] = item.Actions[CanvasActions.Rotate] ? item.Actions[CanvasActions.Rotate] : { Value: this.angle } as ICanvasAction;
    item.Actions[CanvasActions.Rotate].Value = this.angle;
    this.canvasService.rotateItem(item);
    this.render();
  }

  download() {
    this.canvasService.download();
  }

  toViewModel(item: ICanvasItem): ICanvasItemViewModel {
    var actionsViewModel: ICanvasAction[] = [];
    item.Actions.forEach(x => {
      actionsViewModel.push({
        Value: x.Value.length > 25 ? x.Value.substring(0, 25) : x.Value,
        CurrentValue: x?.CurrentValue?.length > 25 ? x?.CurrentValue?.substring(0, 25) : x?.CurrentValue,
        Name: x.Name,
        IsPainted: x.IsPainted,
        IsRendered: x.IsRendered
      } as ICanvasAction)
    })
    var model = {
      Type: CanvasActions[item.Type],
      IsHigher: item?.IsHigher,
      IsWider: item?.IsWider,
      IsXAxisCentered: item?.IsXAxisCentered,
      IsYAxisCentered: item?.IsYAxisCentered,
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
    return model;
  }

  ngAfterViewInit(): void {

    this.context = this.canvas.nativeElement.getContext('2d');
    this.contextAction = this.canvasAction.nativeElement.getContext('2d');

    this.canvasService.setCanvasDisplayContext(this.context);
    this.canvasService.setCanvasActionContext(this.contextAction);

    var loading = {
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

    var phone = {
      Url: 'assets/phone.png',
      LayerIndex: 2,
      Context: Context.Display,
      IsVisible: true
    } as ICanvasItem;
    phone.Actions = [];
    phone.Actions[CanvasActions.DrawImage] = {
      IsPainted: false
    } as ICanvasAction

    var mask = {
      Url: "assets/phonet.png",
      LayerIndex: 998,
      Context: Context.Display,
      IsVisible: true
    } as ICanvasItem
    mask.Actions = [];
    mask.Actions[CanvasActions.DrawImage] = {
      IsPainted: false
    } as ICanvasAction

    var draw = {
      Url: "assets/draw.jpg",
      LayerIndex: 3,
      Context: Context.Display,
      IsVisible: true
    } as ICanvasItem
    draw.Actions = [];
    draw.Actions[CanvasActions.DrawImage] = {
      IsPainted: false
    } as ICanvasAction

    var text = {
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
    this.canvasService.pushItem(text)


    var imagesTasks = [
      this.canvasService.getImageFromUrl(phone),
      this.canvasService.getImageFromUrl(mask),
      this.canvasService.getImageFromUrl(draw)
    ]

    Promise.all(imagesTasks).then(x => {
      this.context.canvas.width = phone.Image.width;
      this.context.canvas.height = phone.Image.height;
      this.canvasService.removeItem(loading.Id)
      this.items = this.canvasService.items;
      this.canvasService.renderItems(this.canvasService.items);
    })
  }

}
