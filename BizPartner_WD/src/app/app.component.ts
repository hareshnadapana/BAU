import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Subject } from 'rxjs';
import { MsalService } from '@azure/msal-angular';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent implements OnInit {
    /**
     * Constructor
     */
    isUserLoggedIn: boolean = false;
    previousUrl: string = null;
    currentUrl: string = null;

    constructor(
        private router: Router,
        private _fuseNavigationService: FuseNavigationService,
        private msalService: MsalService
    ) {}

    ngOnInit(): void {
        this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.previousUrl = this.currentUrl;
            this.currentUrl = event.url;
            const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');
            if (navigation?.opened) {
                navigation.toggle();
            }
        })

        this.msalService.instance.handleRedirectPromise().then(res => {
            if (res != null && res.account != null) {
                this.msalService.instance.setActiveAccount(res.account);
                sessionStorage.setItem('id_token', res.idToken);
                sessionStorage.setItem('user_profile', JSON.stringify(res.account));
                this.router.navigate(['/dashboard/dealer']);
            }
        })
        const params = new URLSearchParams(window.location.search);
        if (params.has('id_token')) {
            const idToken = params.get('id_token');
            sessionStorage.setItem('id_token', idToken);
            this.router.navigate(['/dashboard/dealer']);
        }
    }
}
