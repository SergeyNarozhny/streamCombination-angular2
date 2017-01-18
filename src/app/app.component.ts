import { Component } from '@angular/core';
import { AhSearchService } from './app.ah-search.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	providers: [ AhSearchService ]
})
export class AppComponent { }
