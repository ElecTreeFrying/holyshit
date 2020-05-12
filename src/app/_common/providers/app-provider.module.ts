import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LazyLoadImageModule } from 'ng-lazyload-image';

import { AppInitializationComponentModule } from '../modules/app-initialization-component.module';
import { DialogComponentModule } from '../modules/dialog-component.module';
import { IdToImagePipeModule } from '../modules/id-to-image-pipe.module';
import { PokemonDetailsPipeModule } from '../modules/pokemon-details-pipe.module';
import { TypeColorPipeModule } from '../modules/type-color-pipe.module';

import { DrawerComponent } from '../../_components/drawer/drawer.component';
import { PokemonComponent } from '../../pokemon/pokemon.component';
import { LoadingComponent } from '../../_components/loading/loading.component';

import { NormalizePipe } from '../pipes/normalize.pipe';

import { KeyboardDirective } from '../directives/keyboard.directive';
import { TransitionEventDirective } from '../directives/transition-event.directive';

import { pokemonDialogComponents } from '../services/component-selector.service';


@NgModule({
  declarations: [
    DrawerComponent,      // components
    PokemonComponent,
    LoadingComponent,
    NormalizePipe,        // pipes
    KeyboardDirective,    // directives
    TransitionEventDirective
  ],
  entryComponents: [
    ...pokemonDialogComponents
  ],
  imports: [
    CommonModule,         // angular
    MatRippleModule,      // material modules
    MatDividerModule,
    MatExpansionModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressBarModule,
    DialogComponentModule,// import components
    IdToImagePipeModule,  // import declarations
    PokemonDetailsPipeModule,
    TypeColorPipeModule,
    LazyLoadImageModule   // third party modules
  ],
  exports: [
    ScrollingModule,      // material modules
    OverlayModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AppInitializationComponentModule,   // export components
    DialogComponentModule,              // export declarations
    SnotifyModule,         // third party modules
    

    DrawerComponent,       // components
    PokemonComponent,
    LoadingComponent,
    NormalizePipe,         // pipes
    KeyboardDirective,     // directives
    TransitionEventDirective
  ],
  providers: [
    SnotifyService,
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults }
  ]
})
export class AppProviderModule { }
