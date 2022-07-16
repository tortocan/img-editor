import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ICanvasItem {
  RotateTransformMatrix: DOMMatrix;
  Height: number;
  Width: number;
  Type: CanvasActions;
  OriginalHeight: any;
  OriginallWidth: any;
  IsExcluded: boolean;
  Image: any;
  IsYAxisCentered: boolean;
  IsXAxisCentered: boolean;
  IsHigher: boolean;
  IsWider: boolean;
  Url: string
  Dx: number
  Dy: number,
  LayerIndex: number,
  GlobalCompositeOperation: string,
  FontOptions: CanvasTextDrawingStyles,
  Id: string,
  Actions: ICanvasAction[],
  Context: Context,
  IsVisible: boolean
}
export enum CanvasActions {
  NewItem,
  DrawImage,
  DrawText,
  Rotate,
  Resize,
  Move,
  SelectItem,
  Align
}
export enum Context {
  Action,
  Display
}

export enum CanvasItemAlign {
  Up,
  Down,
  Left,
  Right,
  UpRight,
  DownRight,
  DowLeft,
  UpLeft,
  Center
}

export enum CanvasItemDirection {
  Up,
  Down,
  Left,
  Right,
  UpRight,
  DownRight,
  DowLeft,
  UpLeft
}

export interface ICanvasAction {
  IsRendered: boolean;
  Name: string;
  Value: any,
  CurrentValue: any,
  IsPainted: boolean
}


export interface ICanvasItemViewModel {
  IsYAxisCentered: boolean;
  IsXAxisCentered: boolean;
  IsHigher: boolean;
  IsWider: boolean;
  Url: string
  Dx: number
  Dy: number,
  LayerIndex: number,
  Width: number,
  Height: number
  GlobalCompositeOperation: string
  FontOptions: CanvasTextDrawingStyles,
  Id: string
  Actions: ICanvasAction[]
}

class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  selectedItem?: ICanvasItem;
  count: number = 0;
  clearContext() {
    this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height)
  }

  resetContext() {
    this.clearContext();
    this.items.forEach(x => {
      x.Actions.forEach(y => {
        y.IsPainted = false;
        y.IsRendered = false;
      });
    });
  }


  public items: ICanvasItem[] = [];
  private canvasContext: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
  private canvasActionContext: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
  private canvasDisplayContext: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
  constructor(private http: HttpClient) { }

  private getSortedItems(): ICanvasItem[] {
    return this.items.sort((a, b) => b.LayerIndex - a.LayerIndex);
  }

  align(item: ICanvasItem, align: CanvasItemAlign) {

    this.saveAction(item, CanvasActions.Align);
    var action = item.Actions[CanvasActions.Align];
    action.IsRendered = true;
    action.IsPainted = false;
    action.Value = CanvasItemAlign[align];
    console.log(item.Dx, item.Dy)
    switch (align as CanvasItemAlign) {
      case CanvasItemAlign.Up:
        item.Dy = item.Height / 2;
        break;
      case CanvasItemAlign.Down:
        item.Dy = this.canvasContext.canvas.height - (item.Height / 2);
        break;
      case CanvasItemAlign.Right:
        item.Dx = this.canvasContext.canvas.width - (item.Width / 2);
        break;
      case CanvasItemAlign.UpRight:
        item.Dy = item.Height / 2;
        item.Dx = this.canvasContext.canvas.width - (item.Width / 2);
        break;
      case CanvasItemAlign.DownRight:
        item.Dy = this.canvasContext.canvas.height - (item.Height / 2);
        item.Dx = this.canvasContext.canvas.width - (item.Width / 2);
        break;
      case CanvasItemAlign.Left:
        item.Dx = item.Width / 2;
        break;
      case CanvasItemAlign.UpLeft:
        item.Dy = item.Height / 2;
        item.Dx = item.Width / 2;
        break;
      case CanvasItemAlign.DowLeft:
        item.Dy = this.canvasContext.canvas.height - (item.Height / 2);
        item.Dx = (item.Width / 2);
        break;
      case CanvasItemAlign.Center:
        item.Dy = this.canvasContext.canvas.height / 2;
        item.Dx = this.canvasContext.canvas.width / 2;
        break;
    }
    action.IsPainted = true;
    console.log(item.Dx, item.Dy)
  }

  move(item: ICanvasItem, direction: CanvasItemDirection) {

    this.saveAction(item, CanvasActions.Move);
    var action = item.Actions[CanvasActions.Move];
    action.IsRendered = true;
    action.IsPainted = false;
    action.Value = CanvasItemDirection[direction];
    console.log(item.Dx, item.Dy)
    switch (direction as CanvasItemDirection) {
      case CanvasItemDirection.Up:
        item.Dy--;
        break;
      case CanvasItemDirection.Down:
        item.Dy++;
        break;
      case CanvasItemDirection.Right:
        item.Dx++;
        break;
      case CanvasItemDirection.UpRight:
        item.Dy--;
        item.Dx++;
        break;
      case CanvasItemDirection.DownRight:
        item.Dy++;
        item.Dx++;
        break;
      case CanvasItemDirection.Left:
        item.Dx--;
        break;
      case CanvasItemDirection.UpLeft:
        item.Dy--;
        item.Dx--;
        break;
      case CanvasItemDirection.DowLeft:
        item.Dy--;
        item.Dx++;
        break;
    }
    action.IsPainted = true;
    console.log(item.Dx, item.Dy)
  }

  removeItem(id: string) {
    this.items = this.getSortedItems().filter(x => x.Id != id);
    return this.items;
  }

  rotateItem(item: ICanvasItem) {
    var action = CanvasActions.Rotate;
    item.Actions[action].IsPainted = false;
    if (item?.Actions[action].Value == 0 || item?.Actions[action].Value == 360) {
      item.Actions[action].Value = 360;
    }
    this.canvasContext.save();
    if (item.Type != CanvasActions.DrawText) this.centerItem(item);
    var w = item.Width;
    var h = item.Height;
    var oDx = item.Dx + w / 2;
    var oDy = item.Dy + h / 2;
    var noDx = -item.Dx - w / 2;
    var noDy = -item.Dy - h / 2;
    if (item.Type == CanvasActions.DrawText) {
      oDx = item.Dx;
      oDy = item.Dy;
      noDx = -item.Dx;
      noDy = -item.Dy;
    }
    var rad = item.Actions[action].Value * (Math.PI / 180);
    this.canvasContext.translate(oDx, oDy);
    this.canvasContext.rotate(rad)
    this.canvasContext.translate(noDx, noDy);
    if (item?.Actions[action].Value == 0 || item?.Actions[action].Value == 360) {
      item.Actions[action].Value = 0;
    }
    this.saveAction(item, action);
    item.RotateTransformMatrix = this.canvasContext.getTransform();
    this.canvasContext.restore();
    console.log(item.Actions[action].Value)
  }

  resize(item: ICanvasItem) {
    var action = CanvasActions.Resize;
    var resizeValue = item.Actions[action].Value;
    var currentValue = item.Actions[action]?.CurrentValue;
    // this.clearContext();
    if (currentValue === undefined) {
      item.OriginallWidth = item.Width;
      item.OriginalHeight = item.Height;
    }
    if (item.Actions[CanvasActions.DrawImage]) {
      var w = item.Width;
      var h = item.Height;
      console.log(w, h)
      if (resizeValue == 0) {
        w = item.OriginallWidth;
        h = item.OriginalHeight;
      } else if (!currentValue || currentValue < resizeValue) {
        w += resizeValue;
        h += resizeValue;
      } else if (!currentValue || currentValue > resizeValue) {
        w -= resizeValue;
        h -= resizeValue;
      }
      item.Width = w;
      item.Height = h;
      console.log(w, h)
      this.saveAction(item, action);
    } else if (item.Actions[CanvasActions.DrawText]) {
      item.FontOptions = item.FontOptions ?? { font: '0px Arial', textBaseline: 'middle', textAlign: 'center' } as CanvasTextDrawingStyles;
      var fontSize: number = +item.FontOptions.font.split(' ')[0].split('px')[0];
      var diffVal: number = resizeValue;
      if (resizeValue == 0) {
        fontSize = item.OriginalHeight;
      } else {
        fontSize = resizeValue;
      }
      var fonstStyle: string = item.FontOptions.font.split(' ')[1];
      item.FontOptions.font = fontSize + "px " + fonstStyle;
      console.log(fontSize)
      this.saveAction(item, action);
    } else {

      throw ("Unkown item type!")
    }
  }

  setCanvasDisplayContext(canvasContext: CanvasRenderingContext2D) { this.canvasDisplayContext = canvasContext; this.canvasContext = canvasContext };
  setCanvasActionContext(canvasActionContext: CanvasRenderingContext2D) { this.canvasActionContext = canvasActionContext };

  getImageFromUrl(img: ICanvasItem): Promise<ICanvasItem> {
    return new Promise<ICanvasItem>((resolve) => {
      this.getBlobImage(img.Url).subscribe((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          img.Actions[CanvasActions.DrawImage].Value = reader.result?.toString() ?? '';
          this.loadImage(img).then(x => {
            this.pushItem(img);
            resolve(img);
          });
        }
      });
    })
  }

  getBlobImage(url: string): Observable<Blob> {
    if (this.items.length == 0 || !this.items.find(x => x.Url === url)) {
      return this.http.get(url, {
        headers: { 'Content-Type': 'application/octet-stream' },
        responseType: 'blob'
      })
    }
    return {} as Observable<Blob>;
  }
  private undoAction(item: ICanvasItem, action: CanvasActions) {
    switch (action) {
      case CanvasActions.Resize:
        item.Width = item.OriginallWidth;
        item.Height = item.OriginalHeight;
        break
      case CanvasActions.Rotate:
        item.Actions[action].Value = 0;
        break
      case CanvasActions.SelectItem:
        this.items = this.items.filter(x => x.Type != CanvasActions.SelectItem)
        this.selectedItem = undefined;
        break
    }
  }
  private removeAction(item: ICanvasItem, action: CanvasActions) {
    if (item.Actions[action]) {
      this.undoAction(item, action);
      item.Actions.splice(action, 1);
    }
  }

  restore() {
    this.items.forEach(x => {
      this.removeAction(x, CanvasActions.Resize)
      this.removeAction(x, CanvasActions.Rotate)
      this.removeAction(x, CanvasActions.SelectItem)
    })
    this.canvasContext.restore();
  }

  save() {
    this.canvasContext.save();
  }

  loadImage(item: ICanvasItem): Promise<ICanvasItem> {
    return new Promise<ICanvasItem>((resolve) => {
      item.Image = item.Image ? item.Image : new Image();
      item.Id = item.Id ? item.Id : Guid.newGuid();
      item.Image.onload = () => {
        item.Image.onload = null
        item.Height = item.Image.height;
        item.Width = item.Image.width;
        resolve(item);
      };
      item.Image.src = item.Actions[CanvasActions.DrawImage].Value;
    })
  }

  private centerItem(item: ICanvasItem) {
    var canvas = this.canvasContext.canvas;
    item.IsWider = canvas.width < item.Width;
    item.IsHigher = canvas.height < item.Height;
    var dxCenter = (canvas.width / 2) - (item.Width / 2);
    var dyCenter = (canvas.height / 2) - (item.Height / 2);
    if (item.Dx != dxCenter) {
      //Center Item
      item.Dx = dxCenter;
      item.IsXAxisCentered = true;
    } else { item.IsXAxisCentered = false; }

    if (item.Dy != dyCenter) {
      //Center Item
      item.Dy = dyCenter;
      item.IsYAxisCentered = true;
    } else { item.IsYAxisCentered = false; }
  }

  private drawImage(item: ICanvasItem): void {
    this.canvasContext.save();
    this.canvasContext.setTransform(item.RotateTransformMatrix);
    if (!item?.Image.src) {
      item.Image.src = item.Actions[CanvasActions.DrawImage].Value;
      item.OriginallWidth = item.Image.width;
      item.OriginalHeight = item.Image.height;
    }

    this.centerItem(item)
    this.canvasContext.drawImage(item.Image, item.Dx, item.Dy, item.Width, item.Height);
    // this.canvasContext.drawImage(item.Image, 0, 0, item.Width, item.Height,     // source rectangle
    // 0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height); // destination rectangle
    item.GlobalCompositeOperation = this.canvasContext.globalCompositeOperation;
    item.Type = CanvasActions.DrawImage;
    this.saveAction(item, CanvasActions.DrawImage);
    this.canvasContext.restore();
  }

  download(fileName: string = "my-image.png") {
    var image = this.canvasContext.canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = fileName;
    link.href = image;
    link.click();
  }

  pushItem(item: ICanvasItem) {
    item.Id = item.Id ? item.Id : Guid.newGuid();

    if (!this.items.find(x => x.Id === item.Id)) {
      this.items.push(item);
    }
  }

  private drawText(item: ICanvasItem) {
    this.canvasContext.save();
    this.canvasContext.setTransform(item.RotateTransformMatrix);
    item.Dx = item.Dx ?? this.canvasContext.canvas.width / 2;
    item.Dy = item.Dy ?? this.canvasContext.canvas.height / 2;
    item.FontOptions = item.FontOptions ?? { font: '30px Arial', textBaseline: 'middle', textAlign: 'center' } as CanvasTextDrawingStyles;
    item.GlobalCompositeOperation = this.canvasContext.globalCompositeOperation;

    this.fiilText(item)
    this.canvasContext.restore();
  }

  private fiilText(item: ICanvasItem) {
    this.canvasContext.font = item.FontOptions.font;
    this.canvasContext.textBaseline = item.FontOptions.textBaseline;
    this.canvasContext.textAlign = item.FontOptions.textAlign;
    item.Height = +item.FontOptions.font.split('px')[0];
    item.Width = this.canvasContext.measureText(item.Actions[CanvasActions.DrawText].Value).width
    var txt = item.Actions[CanvasActions.DrawText].Value;
    this.canvasContext.fillText(txt, item.Dx, item.Dy);
    item.Type = CanvasActions.DrawText;
    this.saveAction(item, CanvasActions.DrawText);
  }

  private saveAction(item: ICanvasItem, action: CanvasActions) {
    item.Actions[action] = item.Actions[action] ? item.Actions[action] : {} as ICanvasAction
    item.Actions[action].CurrentValue = item.Actions[action].Value;
    item.Actions[action].Name = CanvasActions[action];
    item.Actions[action].IsPainted = true;
    this.pushItem(item);
  }

  selectItem(item: ICanvasItem) {

    if (item.Type == CanvasActions.SelectItem) return;
    if (this.selectedItem?.Type) {
      this.removeAction(this.selectedItem, CanvasActions.SelectItem);
      this.renderItems(this.items)
    }

    var select = {
      LayerIndex: 9999,
      Width: item.Width,
      Height: item.Height,
      Dx: item.Dx,
      Dy: item.Dy,
      Type: CanvasActions.SelectItem,
      Context: Context.Display
    } as ICanvasItem
    select.Actions = [];
    select.Actions[select.Type] = {
      Value: item.Id,
      IsPainted: false,
    } as ICanvasAction
    item.Actions[select.Type] = select.Actions[select.Type];
    this.selectedItem = item;
    this.drawSelect(item)
    this.saveAction(item, CanvasActions.SelectItem);
  }

  private drawSelect(item: ICanvasItem) {
    if (!item.Actions[CanvasActions.SelectItem].Value) return;
    this.canvasContext.save()
    this.canvasContext.setTransform(item.RotateTransformMatrix);
    this.canvasContext.strokeStyle = "#0d6efd";
    this.canvasContext.lineWidth = 10;
    var dx = item.Dx;
    var dy = item.Dy;
    if (item.Type == CanvasActions.DrawText) {
      dx -= item.Width / 2
      dy -= item.Height / 2
    }
    var w = item.Width;
    var h = item.Height;
    var circleSize = 15;
    this.canvasContext.strokeRect(dx, dy, w, h);
    this.canvasContext.beginPath();
    this.canvasContext.fillStyle = "#0d6efd";
    var topLeftDx = dx;
    var topRightDx = dx + w;
    var centerDx = w / 2;
    var itemCenterDx = centerDx + dx
    var centerDy = h / 2;
    var itemCenterDy = centerDy + dy
    var bottomDy = h + dy;

    this.canvasContext.arc(topLeftDx, dy, circleSize, 0, 2 * Math.PI);
    this.canvasContext.moveTo(itemCenterDx, dy)
    this.canvasContext.arc(itemCenterDx, dy, circleSize, 0, 2 * Math.PI);

    this.canvasContext.moveTo(topRightDx, dy)
    this.canvasContext.arc(topRightDx, dy, circleSize, 0, 2 * Math.PI);
    this.canvasContext.moveTo(topRightDx, itemCenterDy)
    this.canvasContext.arc(topRightDx, itemCenterDy, circleSize, 0, 2 * Math.PI);
    this.canvasContext.moveTo(topRightDx, bottomDy)
    this.canvasContext.arc(topRightDx, bottomDy, circleSize, 0, 2 * Math.PI);

    this.canvasContext.moveTo(itemCenterDx, itemCenterDy)
    this.canvasContext.arc(itemCenterDx, itemCenterDy, circleSize, 0, 2 * Math.PI);
    this.canvasContext.moveTo(itemCenterDx, bottomDy)
    this.canvasContext.arc(itemCenterDx, bottomDy, circleSize, 0, 2 * Math.PI);

    this.canvasContext.moveTo(dx, bottomDy)
    this.canvasContext.arc(dx, bottomDy, circleSize, 0, 2 * Math.PI);
    this.canvasContext.moveTo(dx, itemCenterDy)
    this.canvasContext.arc(dx, itemCenterDy, circleSize, 0, 2 * Math.PI);

    this.canvasContext.stroke();
    this.canvasContext.fill();
    this.canvasContext.closePath();
    this.canvasContext.restore();
  }

  toDisplayContext(item: ICanvasItem) {
    this.canvasDisplayContext.drawImage(this.canvasContext.canvas, 0, 0);
    this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height)
    if (item.Type == CanvasActions.DrawImage) {
      item.Actions[item.Type].Value = this.canvasContext.canvas.toDataURL();
    }
  }

  renderItems(items: ICanvasItem[]) {
    var filter = items.filter(x => x.LayerIndex >= 0).sort((x, y) => x.LayerIndex - y.LayerIndex)
    this.items = filter;
    this.clearContext();
    filter.forEach(x => {
      this.renderItem(x)
    });
    this.switchContext(Context.Display)
  }

  validateAction(item: ICanvasItem, action: CanvasActions): boolean {
    var textAction = CanvasActions[action]
    if (item.Actions[action]) {
      console.log(textAction);
      if (item.Actions[action].IsPainted === undefined) {
        console.trace()
        throw ("IsPainted is required");
      }
      return item.IsVisible;
    }
    return false;
  }

  switchContext(context: Context) {
    switch (context) {
      case Context.Action:
        this.canvasContext = this.canvasActionContext;
        break
      case Context.Display:
        this.canvasContext = this.canvasDisplayContext;
        break
      // default:
      //   this.canvasContext = this.canvasActionContext;
      //   break
    }
  }

  white2transparent(item: ICanvasItem) {
    if(item.Type ==  CanvasActions.DrawText) {
      this.drawText(item);
      return;
    }
    var ctx = this.canvasContext;
    var canvas = ctx.canvas;
    var img = item.Image;
    var w = img.width, h = img.height;

    canvas.width = w;
    canvas.height = h;


    ctx.drawImage(img, 0, 0, w, h);
    var imageData = ctx.getImageData(0, 0, w, h);
    var pixel = imageData.data;

    var red = 0, green = 1, blue = 2, alpha = 3;
    for (var p = 0; p <= pixel.length; p += 4) {
      if (pixel[p + red] >= 255
        && pixel[p + green] >= 255
        && pixel[p + blue] >= 255) // if white then change alpha to 0
      {
        pixel[p + alpha] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // img.src = canvas.toDataURL('image/png');
  }
  renderItem(item: ICanvasItem) {
    // item.Actions = item?.Actions ? item.Actions : [];
    this.switchContext(item.Context);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

    if (this.validateAction(item, CanvasActions.Align)) {
      // this.align(item, item.Actions[CanvasActions.Align].Value as CanvasItemAlign);
      item.Actions[CanvasActions.Align].IsRendered = true;
    }

    if (this.validateAction(item, CanvasActions.Move)) {
      this.move(item, item.Actions[CanvasActions.Move].Value as CanvasItemDirection);
      item.Actions[CanvasActions.Move].IsRendered = true;
    }

    if (this.validateAction(item, CanvasActions.Resize)) {
      this.resize(item);
      item.Actions[CanvasActions.Resize].IsRendered = true;
    }

    if (this.validateAction(item, CanvasActions.Rotate)) {
      this.rotateItem(item);
      item.Actions[CanvasActions.Rotate].IsRendered = true;
    }

    if (this.validateAction(item, CanvasActions.DrawImage)) {
      this.drawImage(item)
      item.Actions[CanvasActions.DrawImage].IsRendered = true;
    }

    if (this.validateAction(item, CanvasActions.DrawText)) {
      this.drawText(item);
      item.Actions[CanvasActions.DrawText].IsRendered = true;
    }

    if (this.validateAction(item, CanvasActions.SelectItem)) {
      this.drawSelect(item);
      item.Actions[CanvasActions.SelectItem].IsRendered = true;
    }

    console.log("\n" + CanvasActions[item.Type] + " " + item.Id + " => " + this.count + "\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n")
    this.count++;
    if (item.Context == Context.Action) this.toDisplayContext(item);
  }

}