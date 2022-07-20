import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CanvasComponent } from './canvas/canvas.component';
import { RangeComponent } from './range/range.component';
import { ArrowsComponent } from './arrows/arrows.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { FontPickerModule } from 'ngx-font-picker';
import { FONT_PICKER_CONFIG } from 'ngx-font-picker';
import { FontPickerConfigInterface } from 'ngx-font-picker';
import { FontEditorComponent } from './font-editor/font-editor.component';

const DEFAULT_FONT_PICKER_CONFIG: FontPickerConfigInterface = {
  // Change this to your Google API key
  apiKey: 'AIzaSyAN2vx-YXH754r6pkumEjmii7OCZcCOMkQ'
};


@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    RangeComponent,
    ArrowsComponent,
    ColorPickerComponent,
    FontEditorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ColorPickerModule,
    FontPickerModule
  ],
  providers: [{
    provide: FONT_PICKER_CONFIG,
    useValue: DEFAULT_FONT_PICKER_CONFIG
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }