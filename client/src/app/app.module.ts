import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import * as ngpb from '@angular/platform-browser';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AuthModule } from './auth';
import { QualificationModule } from './qualification';
import { LayoutModule } from './layout';
import { BrowserModule } from './browser';
import { SimpleNotificationsModule } from 'angular2-notifications';


@NgModule({
  imports: [
    ngpb.BrowserModule,
    AuthModule.forRoot(),
    QualificationModule.forRoot(),
    SharedModule.forRoot(),
    LayoutModule,
    BrowserModule,
    SimpleNotificationsModule,
    AppRoutingModule
  ],
  providers: [ ],
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
