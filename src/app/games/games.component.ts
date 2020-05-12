import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { PokeapiService } from '../_common/services/pokeapi.service';
import { SharedService } from '../_common/services/shared.service';
import { Subscription } from 'rxjs';
import { uniqBy } from 'lodash';


@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit, AfterViewInit, OnDestroy {

  entries: any[];
  all: any[];
  route: any;
  toggle: boolean;

  subscriptions: Subscription[];

  constructor(
    private cd: ChangeDetectorRef,
    private api: PokeapiService,
    public shared: SharedService
  ) { }

  ngOnInit(): void {
    
    this.route = {};
    this.toggle = false;
    this.subscriptions = [];

    this.subscriptions.push(this.shared.routeChange.subscribe((res) => {
      this.setupProcess = res;
    }));

    // this.api.pokemon_();
  }

  ngAfterViewInit() {

    this.subscriptions.push(this.shared.loadMore.subscribe((res) => {

      if (res === -1) {
        this.shared.updateLoadMoreSelection = 0;
        this.shared.loading = null;

        setTimeout(() => {
          this.entries = this.all;
        }, 150);
        
        return;
      }

      const full = this.entries.length === this.all.length;

      if (res !== 1 || full) return;
      
      this.shared.updateLoadMoreSelection = 0;
      
      this.entries = uniqBy(this.entries.concat(
        this.api.nextEntries(this.all)
      ), 'name');

      this.shared.loading = false;
      this.shared.updateIsLoadingSelection = false;

      // console.log(this.entries);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    })
  }

  select(entry: any) {

    this.shared.updateSelectedEntrySelection = this.toggle ? false : true;
    this.toggle = this.toggle ? false : true;
    this.shared.id = entry.id;
  }

  set setupProcess(res: any) {

    sessionStorage.setItem('route', JSON.stringify(res));
    const route = res.type;

    const isGames = route === 'pokedex' || route === 'generation' || route === 'version-group';
    const isItems = route === 'items';
    const isCategory = route === 'category';

    this.route['isGames'] = isGames;
    this.route['isItems'] = isItems;
    this.route['isCategory'] = isCategory;

    if (isGames) {
      this.setupEntries = res;
    } else if (isItems) {
      this.setupItems = res;
    } else if (isCategory) {
      this.setupCategory = res;
    }
  }

  set setupEntries(res: any) {

    let entries = [];
    
    if (res.type === 'pokedex' || res.type === 'version-group') {
      entries = this.shared.pokedex;
    } else if (res.type === 'generation') {
      entries = this.shared.generation;
    }

    if (!entries) {
      const session = sessionStorage.getItem('entries')

      this.entries = <any[]>JSON.parse(session);
      this.displayEntries();
      return;
    }

    if (res.id === -1) {

      this.entries = [].concat(
        (<any[]>entries.find(e => e['id'] === 12).entries),
        (<any[]>entries.find(e => e['id'] === 13).entries),
        (<any[]>entries.find(e => e['id'] === 14).entries)
      )
      
      this.displayEntries();
      return;
    }

    this.setView(entries, res);
  }

  set setupItems(res: any) {

    const entries = this.shared.item_attributes;

    if (!entries) {
      const session = sessionStorage.getItem('entries')

      this.entries = <any[]>JSON.parse(session);
      this.displayEntries();
      return;
    }

    this.setView(entries, res);
  }

  set setupCategory(res: any) {

    const entries = this.shared.item_categories;

    if (!entries) {
      const session = sessionStorage.getItem('entries')

      this.entries = <any[]>JSON.parse(session);
      this.displayEntries();
      return;
    }

    this.setView(entries, res);  
  }

  private setView(entries: any, res: any) {
    this.entries = entries.find(e => e['id'] === res.id).entries;
    this.displayEntries();
    sessionStorage.setItem('entries', JSON.stringify(this.all));
  }

  private displayEntries() {
    this.all = this.entries;
    this.entries = this.entries.slice(0, this.shared.defaultLength);

    const _length = this.all.length - 50;

    this.shared.item_meta = {
      // ceil: Math.ceil(this.all.length/this.shared.defaultLength),
      ceil: Math.ceil(_length/20) + 1,
      floor: Math.floor(this.all.length/this.shared.defaultLength)*this.shared.defaultLength
    };
  }

  trackByID(index: number, item: any) {
    return item ? item.id : null;
  }

}
