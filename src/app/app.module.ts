import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CanvasComponent } from './canvas/canvas.component';
import { RulerModule } from '@ngx-canvas/ruler';

@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RulerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
