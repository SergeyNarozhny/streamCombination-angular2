import { Component, Input, OnInit }	from '@angular/core';
import { Observable }				from 'rxjs/Observable';
import { Subject }					from 'rxjs/Subject';
import { BehaviorSubject }			from 'rxjs/BehaviorSubject';
import { AhSearchService }			from './app.ah-search.service';
import has							from 'lodash/has';
import unionBy						from 'lodash/unionBy';
import flatten						from 'lodash/flatten';
import concat						from 'lodash/concat';

@Component({
	selector: 'ah-search',
	templateUrl: './app.ah-search.component.html',
	styleUrls: [ './app.ah-search.component.css' ],
	providers: [ AhSearchService ]
})
export class AhSearchComponent implements OnInit {

	public ahs: Observable<Object[]> = Observable.of([]);
	public dropdownList = [];
	public query: string;
	private queryItems = new Subject<string>();
	private updatedItems = new BehaviorSubject<Object[]>([]);
	private baseCacheChangeState: string;

	constructor(private ahSearchService: AhSearchService) {}

	// Push a search query into the observable stream of Subject
	search(query: string): void {
		this.queryItems.next(query);
	}

	// Reset query when selected from dropdown
	resetQuery(drop: string): void {
		this.query = drop;
		this.search(this.query);
		this.dropdownList = [];
	}

	mpsSearch(ah: any, event): void {
		// Prevent from executing on children
		if (event.target.className.indexOf('search-result') === -1) {
			event.stopPropagation();
			return;
		}

		console.debug('id / level', ah.id, ah.level);

		ah.loadingState = true;
		this.ahSearchService.mpsSearch(ah.id, ah.level)
				.then(res => this.mpsSearchResultDeliver(res, ah))
				.catch(error => {
					// @todo real error handling
					console.warn(error);
					return Promise.reject(error.msg);
				});
	}

	// Collector of data, uses references of passed params
	mpsSearchEntityCollector(ah, entity): void {
		ah.nettingGroups[entity.id] = ah.nettingGroups[entity.id] || {
			name: entity.name || entity.generatedName,
			id: entity.altGroupId,
			status: entity.marginGroupStatus
		};
		ah.nettingGroups[entity.id].marginGroups = ah.nettingGroups[entity.id].marginGroups
				|| entity.marginGroups
						.filter(mg => {
							return mg.accounts.length;
						})
						.map(mg => {
							return {
								name: mg.generatedName || mg.name,
								id: mg.id,
								count: mg.accounts.length
							};
						});


		// For correct view we clear empty or one-nested groups
		// And if necessary assign marginGroups accounts count to nettingGroup
		if (!ah.nettingGroups[entity.id].marginGroups.length) {
			delete ah.nettingGroups[entity.id];
		}
		else if (ah.nettingGroups[entity.id].marginGroups.length === 1) {
			ah.nettingGroups[entity.id].count = ah.nettingGroups[entity.id].marginGroups[0].count;
			delete ah.nettingGroups[entity.id].marginGroups;
		}
	}

	// Mps search ajax response handler
	mpsSearchResultDeliver(res, ah): void {
		// Own ajax-loader image
		ah.loadingState = false;

		console.debug('param:', ah.id);
		console.debug('res:', res);

		// If new three data potentially has come
		// we need to push changed to updatedItems observable stream
		// to update the whole groups result
		if (has(res, 'investManagers')) {
			let mappedItems = [];

			// @hack preventing messing of cache data
			this.ahSearchService.baseCacheChange.emit('updated');

			// Adding level#1 cr
			mappedItems = concat(mappedItems, this.ahSearchService.mapBaseQuery(res, this.query));

			res.investManagers.forEach(im => {
				// Adding level#2 im
				mappedItems = concat(mappedItems, this.ahSearchService.mapBaseQuery(Object.assign({
						investManagerId: im.id
					}, im), this.query));

				// Adding level#3 funds
				mappedItems = concat(mappedItems, im.funds.map(item => {
					return this.ahSearchService.mapBaseQuery(Object.assign({
						fundId: item.id
					}, item), this.query);
				}));
			});
			// Push new changes to the stream
			this.updatedItems.next(mappedItems);
		}

		// Getting nettingGroups and marginGroups
		// For level#3
		if (has(res, 'profiles') && res.profiles.length) {
			res.profiles.forEach(pf => {
				pf.nettingGroups.forEach(ng => {
					this.mpsSearchEntityCollector(ah, ng);
				});
			});
		}
		else if (has(res, 'defaultNettingGroup.marginGroups') && res.defaultNettingGroup.marginGroups.length) {
			this.mpsSearchEntityCollector(ah, res.defaultNettingGroup);
		}

		// Add to result 'Non PB Marginable'
		// @hack to bottom these groups we use multiplied id * 10
		if (has(res, 'nonMarginableAccounts') && res.nonMarginableAccounts.length) {
			ah.nettingGroups[res.nonMarginableAttributes.nettingGroupId * 10] =
					ah.nettingGroups[res.nonMarginableAttributes.nettingGroupId * 10] || {
						name: 'Non PB Marginable',
						nettingGroupId: res.nonMarginableAttributes.nettingGroupId,
						id: res.nonMarginableAttributes.altGroupId,
						count: res.nonMarginableAccounts.length
					};
		}

		// Clear empty marginGroups for level#3 requests
		if (ah.level === 3 && !Object.keys(ah.nettingGroups).length) {
			ah.nettingGroups.empty = true;
		}

		console.debug('ah:', ah);
	}

	ngOnInit(): void {
		// Combine sources and subscribe
		Observable.combineLatest(
			this.queryItems
				.debounceTime(350)
				.distinctUntilChanged()
				// switch to new observable each time
				.switchMap(query => {
					if (query) {
						// return the http search observable
						return this.ahSearchService.search(query);
					}
					else {
						// or return the observable of empty object if no search query
						return Observable.of<Object[]>([]);
					}
				})
				.catch(error => {
					// @todo real error handling
					console.warn(error);
					return Observable.of<Object[]>([]);
				}),
			this.updatedItems.asObservable()
		).subscribe((data: any) => {
			console.debug('data came out:', data);
			console.debug('data came res unionBy flatten:', unionBy(flatten(data), 'id'));
			console.debug('baseCacheChangeState', this.baseCacheChangeState);

			// @hack preventing messing of data three
			if (this.baseCacheChangeState === 'updated') {
				this.ahs = Observable.of(data[1]);
			}
			else {
				this.ahs = Observable.of(unionBy(flatten(data), 'id'));
			}

		});

		// Dropdown matching
		this.queryItems.subscribe(val => {
			if (val) {
				this.dropdownList = Object.keys(this.ahSearchService.cache.base).filter((key) => {
					return key.indexOf(val) === 0;
				});
			}
		});

		// Make sure we clear second observable stream when 'notupdated' signal has come
		this.ahSearchService.baseCacheChange.subscribe(data => {
			this.baseCacheChangeState = data;
			if (data === 'notupdated') {
				this.updatedItems.next([]);
			}
		});
	}

}
