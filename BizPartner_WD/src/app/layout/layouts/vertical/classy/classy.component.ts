import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from '../../../../core/navigation/navigation.types';
import { NavigationService } from '../../../../core/navigation/navigation.service';
import { User } from '../../../../core/user/user.types';
import { UserService } from '../../../../core/user/user.service';
// import { ApiService } from 'projects/order-app/src/app/shared/services/api.service';
import { Store } from '@ngrx/store';
// import { CommonStoreSelectors, RootStoreState } from 'src/app/root-store';
// import packageInfo from '../../../../../../package.json';

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    version: string; // for package.json version
    isloading: boolean = false;
    isScreenSmall: boolean;
    navigation: Navigation;
    user: User;
    @Output() cartActionSearch: EventEmitter<any> = new EventEmitter<any>();
    @Input() cartItemCount: number;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user1: string;
    mobile = false;
    sizetemp: number;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        // private api: ApiService,
        // private store: Store<RootStoreState.State>,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    @HostListener('window:resize', ['$event'])
     onResize(event) {
        this.sizetemp = window.innerWidth;
        this.mobile = this.sizetemp < 769 ? true : false;
     }

    /**
     * On init
     */
    ngOnInit(): void {
        // this.version = packageInfo.version;
        // Subscribe to navigation data
       /* this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            }); */
            this._navigationService.get()
            .subscribe((navigation: Navigation) => {
                    this.navigation = navigation;
                });
        //calling api to get data from apiConfig.js {{nancy}}
        //  this.store.select(CommonStoreSelectors.selectNavigationMenu).subscribe(nav => {
        //     if (nav != null) {
        //         this.navigation = nav;
        //         console.log("this.navigation--->", this.navigation)
        //     }
        // })
        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                this.user = user;
            });

        // this.user1 = this.api.getloggedInUser().name;
        console.log("user--toolbar->", this.user);

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
        // this.store.select(CommonStoreSelectors.selectLoading).subscribe(data => {
        //     if (data != null) {
        //         console.log("setting loading flag to ui --->", data);
        //         this.isloading = data;
        //     }
        // })
        if (window.screen.width < 769) { // 768px portrait
            this.mobile = true;
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    cartAction() {
        this.cartActionSearch.emit();


    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}
