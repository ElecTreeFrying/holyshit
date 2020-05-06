import { Component, ViewChild, OnInit, OnDestroy, ElementRef, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { PokeapiService } from '../_common/services/pokeapi.service';
import { SharedService } from '../_common/services/shared.service';
import { ComponentSelectorService } from '../_common/services/component-selector.service';
import { SnotifyService } from '../_common/services/snotify.service';


@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PokemonComponent implements OnInit, OnDestroy {

  @ViewChild('genus') genus: ElementRef;

  pokemon: any;
  moves: any;
  isLoading: boolean;
  sections: any[];
  subSections: any[];

  subscriptions: Subscription[];

  constructor(
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private api: PokeapiService,
    public shared: SharedService,
    private componentSelector: ComponentSelectorService,
    private snotify: SnotifyService
  ) { }

  private initial() {
    this.moves = {};
    this.isLoading = true;
    this.sections = this.shared.sections;
    this.subSections = this.shared.subSections;
    this.subscriptions = [];
  }

  ngOnInit(): void {
    this.initial();

    this.subscriptions.push(this.api.pokemon.subscribe((res) => {
      
      this.pokemon = res;
      
      console.log('loaded all pokémon', res);

      if (this.moves.hasOwnProperty('physical')) {
        this.displayToView();
      }
    }));
    
    this.subscriptions.push(this.api.moves.subscribe((res) => {
      
      this.moves.physical = res.filter(e => e['damage_class']['name'] === 'physical');
      this.moves.special = res.filter(e => e['damage_class']['name'] === 'special');
      this.moves.status = res.filter(e => e['damage_class']['name'] === 'status');
      
      // console.log('Loaded all moves', res);
      
      if (this.pokemon) {
        this.displayToView();
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  showDetails(data: any, type: string) {

    this.shared.dialogIsOpened = true;

    const component = this.componentSelector.dialogComponent({ data, type });

    const ref = this.dialog.open(component, {
      id: type,
      closeOnNavigation: true,
      autoFocus: false,
      data: { data, entry: this.pokemon },
      minHeight: '100vh',
      minWidth: '100vw',
    });
  }

  section(i: number, option: boolean = true) {
    if (option) {
      this.sections[i] = this.sections[i] ? false : true;
    } else {
      this.subSections[i] = this.subSections[i] ? false : true;
    }
  }
  
  private displayToView() {
    this.isLoading = false;
    this.cd.detectChanges();
  }

}
