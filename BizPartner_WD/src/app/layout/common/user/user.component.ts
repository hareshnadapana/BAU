import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';
import { Subject, Observable, pipe } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import { User } from 'src/app/core/user/user.types';
import { User } from '../../../core/user/user.types';
import { UserService } from '../../../core/user/user.service';
import { Store, select } from '@ngrx/store';
import { capitalize } from 'lodash';
import { insertUserData } from 'app/root-store.actions';
import CryptoJS from 'crypto-js';
import { UserDataService } from 'app/service/user/user-data.service';
import { MsalService } from '@azure/msal-angular';


@Component({
    selector       : 'user',
    templateUrl    : './user.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'user'
})
export class UserComponent implements OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = true;
    //user: User;
    user: string = 'wolve test';
    isLoadingUserData$: Observable<any> = this.store.pipe(select((state => state.commonStore.fullUserData)));
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    mobile = false;
    sizetemp: number;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
        private store: Store<{commonStore: any }>,
        private userFullData: UserDataService,
        private msalService: MsalService
    )
    {
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
    ngOnInit(): void
    {
        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                //this.user = user;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            this.fetchUserData();
    }

    fetchUserData() {
        this.userFullData.user.subscribe(result => {
            // let firstName = result?.retrieveDealerOutput?.listOfCelRetrieveDealerProfileResponse?.partnerContact[0].firstName.toLowerCase();
            // let lastName = result?.retrieveDealerOutput?.listOfCelRetrieveDealerProfileResponse?.partnerContact[0].lastName.toLowerCase();
            // this.user = firstName && lastName ? `${capitalize(firstName)} ${capitalize(lastName)}` : 'wolve test';
            this._changeDetectorRef.detectChanges();
        });

        if (window.screen.width < 769) { // 768px portrait
            this.mobile = true;
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the user status
     *
     * @param status
     */
    updateUserStatus(status: string): void
    {
        // Return if user is not available
        if ( !this.user )
        {
            return;
        }

        // Update the user
        // this._userService.update({
        //     ...this.user,
        //     status
        // }).subscribe();
    }

    /**
     * Sign out
     */
 
    signOut(): void {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('user_profile');
        sessionStorage.removeItem('id_token');
        this.msalService.logout();
    }
}
