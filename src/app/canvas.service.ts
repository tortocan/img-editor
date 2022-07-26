import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Arrows } from './arrows/arrows.component';

export interface ICanvasItem {
  RotateTransformMatrix: DOMMatrix;
  Height: number;
  Width: number;
  Type: CanvasActions;
  OriginalHeight: any;
  OriginallWidth: any;
  IsExcluded: boolean;
  Image: any;
  Url: string
  Dx: number
  Dy: number,
  LayerIndex: number,
  GlobalCompositeOperation: GlobalCompositeOperation,
  FontOptions: CanvasTextDrawingStyles,
  Id: string,
  Actions: ICanvasAction[],
  Context: Context,
  IsVisible: boolean,
  IsSelectable: boolean,
  Color: any
}
export enum CanvasActions {
  NewItem,
  DrawImage,
  DrawText,
  Rotate,
  Resize,
  Move,
  Align,
  MaskColor
}
export enum Context {
  Action,
  Display
}


export interface ICanvasAction {
  IsRendered: boolean;
  Name: string;
  Value: any,
  CurrentValue: any,
  IsPainted: boolean
}


export interface ICanvasItemViewModel {
  Url: string
  Dx: number
  Dy: number,
  LayerIndex: number,
  Width: number,
  Height: number
  GlobalCompositeOperation: string
  FontOptions: CanvasTextDrawingStyles,
  Id: string
  Actions: ICanvasAction[],
  IsVisible: boolean
}

export enum rgba {
  Red,
  Green,
  Blue,
  Alpha
}

export interface rgb2rgba {
  overflow: boolean,
  sr: number,
  sg: number,
  sb: number,
  dr: number,
  dg: number,
  db: number,
  da: number,
}
class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16 | 0,
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

  private items: ICanvasItem[] = [];
  private canvasContext: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
  private canvasActionContext: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
  private canvasDisplayContext: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
  constructor(private http: HttpClient) { }

  public getSortedItems(): ICanvasItem[] {
    return this.items.sort((a, b) => b.LayerIndex > a.LayerIndex ? 1 : -1);
  }

  align(item: ICanvasItem, align: Arrows) {
    this.createAction(item, CanvasActions.Align);
    let action = item.Actions[CanvasActions.Align];
    let relativeTo = this.canvasContext.canvas;
    action.IsRendered = true;
    action.IsPainted = false;
    action.Value = Arrows[align];

    switch (align) {
      case Arrows.Top:
        item.Dy = item.Height / 2;
        if (item.Actions[CanvasActions.DrawText]?.Value) {
          item.Dy = (item.Height / 2);
        } else {
          item.Dy = 0;
        }
        break;
      case Arrows.Bottom:
        item.Dy = relativeTo.height;
        if (item.Actions[CanvasActions.DrawText]?.Value) {
          item.Dy -= (item.Height / 2);
        } else {
          item.Dy -= (item.Height);
        }
        break;
      case Arrows.Right:
        item.Dx = relativeTo.width;
        if (item.Actions[CanvasActions.DrawText]?.Value) {
          item.Dx -= (item.Width / 2);
        } else {
          item.Dx -= (item.Width);
        }
        break;
      case Arrows.TopRight:
        this.align(item, Arrows.Right);
        this.align(item, Arrows.Top);
        break;
      case Arrows.BottomRight:
        this.align(item, Arrows.Bottom);
        this.align(item, Arrows.Right);
        break;
      case Arrows.Left:
        item.Dx = item.Width / 2;
        if (item.Actions[CanvasActions.DrawImage]?.Value) {
          item.Dx = 0;
        }
        break;
      case Arrows.TopLeft:
        this.align(item, Arrows.Top);
        this.align(item, Arrows.Left);
        break;
      case Arrows.BottomLeft:
        this.align(item, Arrows.Bottom);
        this.align(item, Arrows.Left);
        break;
      case Arrows.Center:
        item.Dy = relativeTo.height / 2;
        item.Dx = relativeTo.width / 2;
        if (item.Actions[CanvasActions.DrawImage]?.Value) {
          item.Dy -= item.Height / 2;
          item.Dx -= item.Width / 2;
        }
        break;
    }
    action.IsPainted = true;
  }

  move(item: ICanvasItem, direction: Arrows) {
    this.createAction(item, CanvasActions.Move);
    let action = item.Actions[CanvasActions.Move];
    action.IsRendered = true;
    action.IsPainted = false;
    action.Value = Arrows[direction];
    switch (direction) {
      case Arrows.Top:
        item.Dy--;
        break;
      case Arrows.TopRight:
        item.Dy--;
        item.Dx++;
        break;
      case Arrows.Left:
        item.Dx--;
        break;
      case Arrows.TopLeft:
        item.Dy--;
        item.Dx--;
        break;
      case Arrows.Bottom:
        item.Dy++;
        break;
      case Arrows.BottomLeft:
        item.Dy++;
        item.Dx--;
        break;
      case Arrows.BottomRight:
        item.Dy++;
        item.Dx++;
        break;
      case Arrows.Right:
        item.Dx++;
        break;
    }
    action.IsPainted = true;
  }

  removeItem(id: string) {
    this.items = this.getSortedItems().filter(x => x.Id != id);
    return this.items;
  }

  rotateItem(item: ICanvasItem) {
    let action = CanvasActions.Rotate;
    item.Actions[action].IsPainted = false;
    if (item?.Actions[action].Value == 0 || item?.Actions[action].Value == 360) {
      item.Actions[action].Value = 360;
    }
    this.canvasContext.save();
    let w = item.Width;
    let h = item.Height;
    let oDx = item.Dx + w / 2;
    let oDy = item.Dy + h / 2;
    let noDx = -item.Dx - w / 2;
    let noDy = -item.Dy - h / 2;
    if (item.Type == CanvasActions.DrawText) {
      oDx = item.Dx;
      oDy = item.Dy;
      noDx = -item.Dx;
      noDy = -item.Dy;
    }
    let rad = item.Actions[action].Value * (Math.PI / 180);
    this.canvasContext.translate(oDx, oDy);
    this.canvasContext.rotate(rad)
    this.canvasContext.translate(noDx, noDy);
    if (item?.Actions[action].Value == 0 || item?.Actions[action].Value == 360) {
      item.Actions[action].Value = 0;
    }
    this.createAction(item, action);
    item.RotateTransformMatrix = this.canvasContext.getTransform();
    this.canvasContext.restore();
  }

  resize(item: ICanvasItem) {
    let action = CanvasActions.Resize;
    let resizeValue = item.Actions[action].Value;
    let currentValue = item.Actions[action]?.CurrentValue;
    if (currentValue === undefined) {
      item.OriginallWidth = item.Width;
      item.OriginalHeight = item.Height;
    }
    if (item.Actions[CanvasActions.DrawImage]) {
      let w = item.Width;
      let h = item.Height;
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
      this.createAction(item, action);
    } else if (item.Actions[CanvasActions.DrawText]) {
      item.FontOptions = item.FontOptions ?? { font: '0px Arial', textBaseline: 'middle', textAlign: 'center' } as CanvasTextDrawingStyles;
      let fontSize: number = +item.FontOptions.font.split(' ')[0].split('px')[0];
      if (resizeValue == 0) {
        fontSize = item.OriginalHeight;
      } else {
        fontSize = resizeValue;
      }
      let fonstStyle: string = item.FontOptions.font.split(' ')[1];
      item.FontOptions.font = fontSize + "px " + fonstStyle;
      this.createAction(item, action);
    } else {

      throw (new Error("Unkown item type!"))
    }
  }

  getCursorPosition(event: any) {
    const rect = this.canvasContext.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / (rect.right - rect.left)) * this.canvasContext.canvas.width,
      y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * this.canvasContext.canvas.height,
    };
  }

  isPointInPath(x: ICanvasItem, event: any) {
    let pos = this.getCursorPosition(event)
    let dx = x.Dx;
    let dy = x.Dy;
    let mdx = dx + x.Width;
    let mdy = dy + x.Height;
    if (x.Type == CanvasActions.DrawText) {
      mdy = dy + x.Height / 2;
      mdx = dx + x.Width / 2;
      dx -= x.Width / 2
      dy -= x.Height / 2
    }
    let isInXAxis = pos.x >= dx && pos.x <= mdx;
    let isInYAxis = pos.y >= dy && pos.y <= mdy;
    return {
      isInXAxis,
      isInYAxis,
      posX: pos.x,
      posY: pos.y
    }
  }
  setCanvasDisplayContext(canvasContext: CanvasRenderingContext2D) {
    this.canvasDisplayContext = canvasContext; this.canvasContext = canvasContext;
    let moveItem = false;
    // Listen for mouse moves
    this.canvasContext.canvas.addEventListener('mousedown', (event: any) => {
      event.stopPropagation();
      moveItem = true;
      if (this.selectedItem) {
        this.removeAction(this.selectedItem, CanvasActions.Align);
        this.removeAction(this.selectedItem, CanvasActions.Move);
        let isInPath = this.isPointInPath(this.selectedItem, event);
        if (!isInPath.isInXAxis && !isInPath.isInYAxis) {
          this.selectedItem = undefined;
          this.resetContext();
          this.renderItems();
        }
      }
    });

    this.canvasContext.canvas.addEventListener('mouseup', (event: any) => {
      event.stopPropagation();
      moveItem = false;
      let pos = this.getCursorPosition(event)
      let imgData = this.canvasContext.getImageData(pos.x, pos.y, 1, 1);
      let filterItems = this.items.filter(x => x.IsSelectable && x.IsVisible && x.Id != this?.selectedItem?.Id);

      filterItems.sort((a, b) => (a.LayerIndex < b.LayerIndex) ? 1 : -1).every(x => {
        let isInPath = this.isPointInPath(x, event);
        if (x.Id != this?.selectedItem?.Id && isInPath.isInXAxis && isInPath.isInYAxis) {
          this.selectItem(x);
          return false;
        }
        return true;
      });
    });

    this.canvasContext.canvas.addEventListener('mouseleave', (event: any) => {
      event.stopPropagation();
      moveItem = false;
    });

    this.canvasContext.canvas.addEventListener('mousemove', (event: any) => {
      event.stopPropagation();
      if (this.selectedItem && moveItem) {
        let isInPath = this.isPointInPath(this.selectedItem, event);

        if (isInPath.isInXAxis && isInPath.isInYAxis) {
          this.selectedItem.Dx = isInPath.posX
          this.selectedItem.Dy = isInPath.posY
          if (this.selectedItem?.Actions[CanvasActions.DrawImage]?.Value) {
            this.selectedItem.Dx -= (this.selectedItem.Width / 2)
            this.selectedItem.Dy -= (this.selectedItem.Height / 2)
          }
          this.renderItems()
        }

      }
    });


  }

  setCanvasActionContext(canvasActionContext: CanvasRenderingContext2D) { this.canvasActionContext = canvasActionContext; }

  getImageFromUrl(item: ICanvasItem): Promise<ICanvasItem> {
    return new Promise<ICanvasItem>((resolve) => {
      this.getBlobImage(item.Url).subscribe((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          item.Actions[CanvasActions.DrawImage].Value = reader.result?.toString() ?? '';
          this.loadImage(item).then(() => {
            this.pushItem(item);
            resolve(item);
          });
        }
      });
    })
  }

  loadFile(file: File): Promise<ICanvasItem> {
    let layerIndexes = this.items.filter(x => x.LayerIndex < 900).map(x => x.LayerIndex);
    return new Promise<ICanvasItem>((resolve) => {
      let item = {
        LayerIndex: Math.max(...layerIndexes) + 1,
        Context: Context.Display,
        IsVisible: true
      } as ICanvasItem
      item.Actions = [];
      item.Actions[CanvasActions.DrawImage] = {
        IsPainted: false
      } as ICanvasAction
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        item.Actions[CanvasActions.DrawImage].Value = reader.result?.toString() ?? '';
        this.loadImage(item).then(() => {
          item.Url = "assets/" + file.name;
          this.pushItem(item);
          resolve(item);
        });
      }
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
    }
  }

  private removeAction(item: ICanvasItem, action: CanvasActions) {
    if (item?.Actions[action]) {
      this.undoAction(item, action);
      item.Actions.splice(action, 1);
    }
  }

  restore() {
    this.items.forEach(x => {
      this.removeAction(x, CanvasActions.Resize)
      this.removeAction(x, CanvasActions.Rotate)
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


  private drawImage(item: ICanvasItem): void {
    this.canvasContext.save();
    this.canvasContext.setTransform(item.RotateTransformMatrix);
    if (!item?.Image.src) {
      item.Image.src = item.Actions[CanvasActions.DrawImage].Value;
      item.OriginallWidth = item.Image.width;
      item.OriginalHeight = item.Image.height;
    }
    item.Dx = item.Dx ?? 0;
    item.Dy = item.Dy ?? 0;
    this.canvasContext.globalCompositeOperation = item.GlobalCompositeOperation ?? this.canvasContext.globalCompositeOperation;
    this.canvasContext.drawImage(item.Image, item.Dx, item.Dy, item.Width, item.Height);
    item.GlobalCompositeOperation = this.canvasContext.globalCompositeOperation;
    item.Type = CanvasActions.DrawImage;
    this.createAction(item, CanvasActions.DrawImage);
    this.canvasContext.restore();
  }

  download(fileName: string = "my-image.png") {
    let image = this.canvasContext.canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
    let link = document.createElement('a');
    link.download = fileName;
    link.href = image;
    link.click();
  }

  pushItem(item: ICanvasItem) {
    item.Id = item.Id ? item.Id : Guid.newGuid();

    if (!this.items.find(x => x.Id === item.Id)) {
      this.items.push(item);
      this.items = this.getSortedItems();
    }
  }

  private drawText(item: ICanvasItem) {
    this.canvasContext.save();
    this.canvasContext.setTransform(item.RotateTransformMatrix);
    item.Dx = item.Dx ?? this.canvasContext.canvas.width / 2;
    item.Dy = item.Dy ?? this.canvasContext.canvas.height / 2;
    item.FontOptions = item.FontOptions ?? { font: 'Italic 30px Arial', textBaseline: 'middle', textAlign: 'center' } as CanvasTextDrawingStyles;
    item.GlobalCompositeOperation = this.canvasContext.globalCompositeOperation;

    this.fiilText(item)
    this.canvasContext.restore();
  }

  private fiilText(item: ICanvasItem) {
    this.canvasContext.font = item.FontOptions.font;
    this.canvasContext.textBaseline = item.FontOptions.textBaseline;
    this.canvasContext.textAlign = item.FontOptions.textAlign;
    item.Color = item.Color ?? this.canvasContext.fillStyle ?? 'black';
    this.canvasContext.fillStyle = item.Color;
    item.Height = +item.FontOptions.font.split('px')[0];
    item.Width = this.canvasContext.measureText(item.Actions[CanvasActions.DrawText].Value).width
    let txt = item.Actions[CanvasActions.DrawText].Value;
    this.canvasContext.fillText(txt, item.Dx, item.Dy);
    item.Type = CanvasActions.DrawText;
    this.createAction(item, CanvasActions.DrawText);
  }

  private createAction(item: ICanvasItem, action: CanvasActions) {
    item.Actions[action] = item.Actions[action] ? item.Actions[action] : {} as ICanvasAction
    item.Actions[action].CurrentValue = item.Actions[action].Value;
    item.Actions[action].Name = CanvasActions[action];
  }


  selectItem(item: ICanvasItem) {

    if (!item.IsSelectable || this.selectedItem && this.selectedItem?.Id == item.Id) {
      return;
    }

    this.selectedItem = item;
    if (item.IsVisible) {
      // this.drawSelect(item)
      this.resetContext();
      this.renderItems();
    }
  }

  private drawSelect(item: ICanvasItem) {

    this.canvasContext.save()
    this.canvasContext.setTransform(item.RotateTransformMatrix);
    this.canvasContext.strokeStyle = "#0d6efd";
    this.canvasContext.lineWidth = 10;
    let dx = item.Dx;
    let dy = item.Dy;
    if (item.Type == CanvasActions.DrawText) {
      dx -= item.Width / 2
      dy -= item.Height / 2
    }
    let w = item.Width;
    let h = item.Height;
    let circleSize = 15;
    this.canvasContext.strokeRect(dx, dy, w, h);
    this.canvasContext.beginPath();
    this.canvasContext.fillStyle = "#0d6efd";
    let topLeftDx = dx;
    let topRightDx = dx + w;
    let centerDx = w / 2;
    let itemCenterDx = centerDx + dx
    let centerDy = h / 2;
    let itemCenterDy = centerDy + dy
    let bottomDy = h + dy;

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

  renderItems() {
    let filter = this.items.filter(x => x.LayerIndex >= 0).sort((x, y) => x.LayerIndex - y.LayerIndex)
    this.clearContext();
    filter.forEach(x => {
      this.renderItem(x);
    });
    this.switchContext(Context.Display)
  }

  validateAction(item: ICanvasItem, action: CanvasActions): boolean {
    if (item?.Actions[action]) {
      if (item.Actions[action].IsPainted === undefined) {
        console.trace()
        throw (new Error("IsPainted is required"));
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
    }
  }

  maskColor(item: ICanvasItem) {
    if (item.Type == CanvasActions.DrawText) {
      this.drawText(item);
      return;
    }

    let imageData = this.canvasContext.getImageData(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
    let pixelData = imageData.data;
    let rgb2rgba = item.Actions[CanvasActions.MaskColor].Value as rgb2rgba;

    for (let x = 0, w = this.canvasContext.canvas.width; x < w; ++x) {
      for (let y = 0, h = this.canvasContext.canvas.height; y < h; ++y) {
        let pixel = (y * w + x) * 4;
        if (rgb2rgba.overflow && y <= item.Dy
          || rgb2rgba.overflow && y >= item.Dy + item.Height - 5
          || rgb2rgba.overflow && x <= item.Dx
          || rgb2rgba.overflow && x >= item.Dx + item.Width - 5
          || pixelData[pixel + rgba.Red] >= rgb2rgba.sr
          && pixelData[pixel + rgba.Green] >= rgb2rgba.sg
          && pixelData[pixel + rgba.Blue] >= rgb2rgba.sb) {
          pixelData[pixel + rgba.Red] = rgb2rgba.dr ?? pixelData[pixel + rgba.Red]
          pixelData[pixel + rgba.Blue] = rgb2rgba.db ?? pixelData[pixel + rgba.Blue]
          pixelData[pixel + rgba.Green] = rgb2rgba.dg ?? pixelData[pixel + rgba.Green]
          pixelData[pixel + rgba.Alpha] = rgb2rgba.da ?? pixelData[pixel + rgba.Alpha];
        }
      }
    }
    this.canvasContext.putImageData(imageData, 0, 0);
    this.createAction(item, CanvasActions.MaskColor);
  }

  renderItem(item: ICanvasItem) {
    this.switchContext(item.Context);


    if (this.validateAction(item, CanvasActions.Align)) {
      this.align(item, item.Actions[CanvasActions.Align].Value as Arrows);
      item.Actions[CanvasActions.Align].IsRendered = true;
    }

    if (this.validateAction(item, CanvasActions.Move)) {
      this.move(item, item.Actions[CanvasActions.Move].Value as Arrows);
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

    if (this.validateAction(item, CanvasActions.MaskColor)) {
      this.maskColor(item)
      item.Actions[CanvasActions.MaskColor].IsRendered = true;
    }

    if (this.validateAction(item, CanvasActions.DrawText)) {
      this.drawText(item);
      item.Actions[CanvasActions.DrawText].IsRendered = true;
    }

    if (item.IsSelectable && item.Id == this.selectedItem?.Id) {
      this.drawSelect(item);
    }
    if (item.Context == Context.Action) this.toDisplayContext(item);
  }

}
