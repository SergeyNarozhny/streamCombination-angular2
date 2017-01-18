import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { AhSearchComponent } from './app.ah-search.component';
import { AhSearchService } from './app.ah-search.service';
import './rxjs-extensions';

@NgModule({
  declarations: [ AppComponent, AhSearchComponent ],
  imports: [ BrowserModule, FormsModule, HttpModule ],
  providers: [ AhSearchService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
