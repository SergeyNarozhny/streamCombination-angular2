import { Injectable, Output, EventEmitter }	from '@angular/core';
import { Http, Response, Headers }		from '@angular/http';
import { Observable }				from 'rxjs';

@Injectable()
export class AhSearchService {

 	private headers = new Headers({'Range': 'items=0-24'});
	private tmp = {
		getKeys: obj => {
			return Object.keys(obj);
		}
	};
	public loadingState: boolean = false;
	@Output() baseCacheChange = new EventEmitter();
 	public cache: any = {
 		base: {},
 		mps: {}
 	};

	constructor(private http: Http) {}

	returnUrls(options): string {
		if (options.type === 'base') {
			return `/ui/ah?search=${options.query}`;
		}
		else if (options.type === 'mps') {
			return `/ui/mpsClient/${options.param}/${options.level}`;
		}
		else {
			return ``;
		}
	}

	// Base input query search with caching
	search(query: string): Observable<Object[]> {
		if (this.cache.base[query]) {
			this.loadingState = false;

			// Base request has changed, emit event
			// We need to clear updatedItems stream
			this.baseCacheChange.emit('notupdated');
			return Observable.of(this.cache.base[query]);
		}
		else {
			this.loadingState = true;
			return this.http
				.get(this.returnUrls({ type: 'base', query: query }), {
					headers: this.headers
				})
				// @todo there is no data property wrap for received funds (see java response)
				.map((r: Response) => {
					this.loadingState = false;
					return r.json().map(item => this.mapBaseQuery(item, query));
				});
		}
	}

	// Mps funds search, based on click
	mpsSearch(param: string | number, level: number): Promise<any> {
		if (this.cache.mps[param]) {
			return Promise.resolve(this.cache.mps[param]);
		}
		else {
			return this.http
					.get(this.returnUrls({ type: 'mps', param: param, level: level }), {
						headers: this.headers
					})
					.map((r: Response) => {
						return r.json().map(item => this.mapMpsQuery(item, param, level))[0];
					})
					.toPromise();
		}
	}

	// Three generator function
	mapBaseGenerateSwitch(item) {
		let tmp: any = Object.create(this.tmp);
		tmp.nettingGroups = {};

		if (item.fundId) {
			tmp.type = 'f';
			tmp.name = item.fundName || item.name;
			tmp.gfcId = item.fundGfcId || item.gfcId;
			tmp.id = item.fundId;
			tmp.level = 3;
		}
		else if (item.investManagerId) {
			tmp.type = 'im';
			tmp.name = item.investManagerName || item.name;
			tmp.gfcId = item.investManagerGfcId || item.gfcId;
			tmp.id = item.investManagerId;
			tmp.level = 2;
		}
		else {
			tmp.type = 'cr';
			tmp.name = item.clientName || item.name;
			tmp.id = item.clientId || item.id;
			tmp.level = 1;
		}

		return tmp;
	}

	// Base search query result mapper
	mapBaseQuery(item, query) {
		const tmp = this.mapBaseGenerateSwitch(item);

		// cache data
		this.cache.base[query] = this.cache.base[query] || [];

		// If it is new query request, emit event
		if (!this.cache.base[query].length) {
			this.baseCacheChange.emit('notupdated');
		}

		// @hack clear cache when new data is received
		if (this.cache.base[query].length === 1 && tmp.level === 1) {
			this.cache.base[query] = [];
		}

		// Doubles will be handled by lodash unionBy 'id' function
		this.cache.base[query].push(tmp);
		return tmp;
	}

	// Mps search result mapper
	mapMpsQuery(item, param, level) {
		// caching
		this.cache.mps[item.id] = this.cache.mps[item.id] || item;
		item.investManagers.forEach(low => {
			// Level#2, we should keep connection with level#1 (with item, not with low)
			// Otherwise mixed cache won't be resolved correctly
			this.cache.mps[low.id] = this.cache.mps[item.id] || item;
			low.funds.forEach(lowest => {
				// Level#3, funds
				this.cache.mps[lowest.id] = this.cache.mps[lowest.id] || lowest;
			});
		});

		return item;
	}
}
