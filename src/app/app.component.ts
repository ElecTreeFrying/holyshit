import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatSidenav } from '@angular/material/sidenav';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { 
  Overlay,
  OverlayRef
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import SimpleBar from 'simplebar';

import { AppInitializationComponent } from './_components/app-initialization/app-initialization.component';
import { SearchComponent } from './_components/search/search.component';

import { SharedService } from './_common/services/shared.service';
import { RouteService } from './_common/services/route.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('toolbar') private toolbar: MatToolbar;
  @ViewChild('drawerContent') private drawerContent: ElementRef;
  @ViewChild('drawer') private drawer: MatSidenav;
  @ViewChild('search') private search: MatSidenav;
  @ViewChild('details') private details: MatSidenav;

  overlayRef: OverlayRef;
  routerStyle: any;
  simplebar: any;
  isLoading: boolean;
  isShowDetails: boolean;
  sideDrawerState: { drawer: boolean, details: boolean };
  toolbarHeight: number;

  constructor(
    private router: Router, 
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private bottomSheet: MatBottomSheet,
    private cd: ChangeDetectorRef,
    public shared: SharedService,
    public route: RouteService
  ) {}

  ngOnInit() {
    
    this.initial();
  }

  ngAfterViewInit() {

    this.routerStyle = this.routerStyleProcess;

    this.simplebar = new SimpleBar(this.drawerContent.nativeElement);
    
    this.scrollListener();
    this.pageListeners();
  }

  initial() {
    this.routerStyle = {};
    this.isLoading = false;
    this.isShowDetails = false;
    this.sideDrawerState = { drawer: true, details: false };
    this.toolbarHeight = 0;

    this.shared.initializationComplete = false;
  }

  scrollListener() {

    this.simplebar.getScrollElement().addEventListener('scroll', (response: any) => {

      const target = <HTMLElement>response.target;
      const maxScroll = target.scrollHeight - target.clientHeight;
      const scrollValue = target.scrollTop;
      const isInitial = (scrollValue === 0) && (maxScroll === 0)
  
      this.shared.updateScrollValueSelection = scrollValue;

      const full = this.shared.item_meta.ceil === this.shared.index.count;
      
      if (this.shared.bottomSheetIsOpened || this.shared.loading === null || isInitial) return;

      if (scrollValue >= maxScroll && !full && !this.shared.loading) {
        this.shared.loading = true;
        this.shared.updateIsLoadingSelection = true;
        setTimeout(() => {
          this.shared.updateLoadMoreSelection = 1;
        }, 400);
      }
    });
  }

  pageListeners() {

    this.toolbarHeight = this.toolbar._elementRef.nativeElement.clientHeight;
    this.cd.detectChanges();

    const complete = () => {
      this.attachOverlay = false
      this.shared.initializationComplete = true;      
    }

    this.shared.appInitialization.subscribe((res: number) => {
      res === 1 ? this.attachOverlay = true : 
      res === 2 ? this.shared.updateAppInitializationSelection = 3 :
      res === 4 ? complete() : 0;
    });

    this.shared.routeChange.subscribe((res: any) => {
      if (!res) return;
      this.simplebar.getScrollElement().scrollTop = 0;
    });

    this.shared.hideLoadMore.subscribe((res) => {
      if (res === null) return;
      this.bottomSheet.dismiss();
    });

    this.shared.navigationState.subscribe((res) => {
    
      if (res) {
        setTimeout(() => this.sidenavToggle(false), 350);
      } else {
        setTimeout(() => {
          if (!this.drawer.opened) return;
          this.sidenavToggle(true);
        }, 350);
      }

    });

    this.details.openedChange.subscribe((res: boolean) => {

      if (!res && (this.shared.id || this.shared.selectionData)) {
        this.drawer.close();
        this.details.open();
        this.sideDrawerState = { drawer: false, details: true };
        return;
      }

      if (!res && (!this.shared.id || !this.shared.selectionData)) {
        this.sidenavToggle(false);
      }

    });

    this.shared.selectedEntry.subscribe((res) => {

      if (res === undefined) return;

      const drawer = this.sideDrawerState.drawer;
      const details = this.sideDrawerState.details;
      
      if ((drawer && !details) || (!drawer && !details)) {
        this.drawer.close();
        this.details.open();
        this.sideDrawerState = { drawer: false, details: true };
      } 
      
      if (!drawer && details) {
        this.details.close();
        this.drawer.open();
        this.sideDrawerState = { drawer: true, details: false };
      }

      this.cd.detectChanges();
    });

    this.shared.isSearch.subscribe((res) => {
    
      if (!res) return;

      setTimeout(() => {
        this.drawer.close();
        this.details.close();
        this.sideDrawerState = { drawer: false, details: false };
      }, 150);
      
    });

    this.shared.scrollTest.subscribe((res: any) => {

      res = res ? 99999999999999999999999 : 0;
      
      this.simplebar.getScrollElement().scrollTop = res;
      
    });

  }

  private _bottomSheetRef: MatBottomSheetRef<SearchComponent>;

  openSearch() {

    if (this._bottomSheetRef) {
      this._bottomSheetRef.dismiss();
      this._bottomSheetRef = undefined;
      this.shared.updateSearchSelection = '-1';
      this.shared.bottomSheetIsOpened = false;
      return;
    }
    
    this.shared.bottomSheetIsOpened = true;
    this.shared.updateSearchSelection = '';

    this._bottomSheetRef = this.bottomSheet.open(SearchComponent, {
      autoFocus: true,
      closeOnNavigation: true,
      hasBackdrop: false
    })
    
    this._bottomSheetRef.afterDismissed().subscribe(() => {
      if (!this._bottomSheetRef) return;
      this._bottomSheetRef = undefined;
      this.shared.updateSearchSelection = '-1';
      this.shared.bottomSheetIsOpened = false;
    });
  }

  sidenavToggle(event: boolean) {

    this.shared.id = undefined;
    this.shared.selectionData = undefined;
    const drawer = this.sideDrawerState.drawer;

    if (event) {
      this.drawer.toggle();
      this.details.close();
      this.sideDrawerState = { drawer: drawer ? false : true, details: false };
    } else {
      this.drawer.open();
      this.details.close();
      this.sideDrawerState = { drawer: true, details: false };
    }

    this.cd.detectChanges();
  }

  toggleEntries() {

    this.bottomSheet.dismiss();
    this.shared.updateScrollValueSelection = 100;
    
    this.simplebar.getScrollElement().scrollTop = 0;
    this.shared.updateHideLoadMoreSelection = true;

    if (this.shared.isLoadAll) {
      
      this.shared.updateLoadMoreSelection = -1;
      this.shared.isLoadAll = false;
      
      setTimeout(() => {
        this.shared.updatedLoadedAllSelection = true;
      }, 150);
    } else {
      
      this.shared.updateLoadMoreSelection = -2;
      this.shared.isLoadAll = true;

      setTimeout(() => {
        this.shared.updatedLoadedAllSelection = false;
        this.shared.updateLoadMoreSelection = -8;
      }, 150);
    }
  }

  set attachOverlay(option: boolean) {
    switch(option) {
      case true: {
        const portal = new ComponentPortal(AppInitializationComponent, this.viewContainerRef);
        this.overlayRef = this.overlay.create({ disposeOnNavigation: true });
        this.overlayRef.attach(portal);
        break;
      }
      case false: {
        this.overlayRef.detach();
        this.overlayRef.dispose();
        break;
      }
    }
  }

  loadingIsOpened(emit: boolean) {
    if (!emit) return;
    const element = this.simplebar.getScrollElement();
    element.scrollTop = element.scrollHeight - element.clientHeight - 1;
  }

  toggleDetails(option: boolean) {
    this.isShowDetails = option;
    this.cd.detectChanges();
  }

  routeTo(route: string) {
    this.shared.updateNavigationStateSelection = route === null;
    this.shared.updateIsLoadingSelection = true;
    
    if (route === null) {
      return this.router.navigate([ '/' ]).then(() => {
        this.shared.updateIsLoadingSelection = false;
      });
    }

    if (this.router.url.includes('search') || this.router.url.includes('explore')) {
      return this.router.navigate([ '/', route ]).then(() => {
        this.shared.updateIsLoadingSelection = false;
      });
    }

    const $ = this.drawer.openedChange.subscribe((res: boolean) => {
      if (res) return;
      
      this.router.navigate([ '/', route ]).then(() => {
        this.shared.updateIsLoadingSelection = false;
      });

      $.unsubscribe();
    });
  }
  
  private get routerStyleProcess() {
    const toolbarHeight = this.toolbar._elementRef.nativeElement.clientHeight;
    this.shared.toolbarHeight = toolbarHeight;
    return { 
      'height': `calc(100vh - ${toolbarHeight}px)`, 
      'max-height': `calc(100vh - ${toolbarHeight}px)`, 
      'min-height': `calc(100vh - ${toolbarHeight}px)` 
    }
  }

}
