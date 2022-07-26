import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';

// @formatter:off
// tslint:disable:max-line-length
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'example'},

    // Redirect signed in user to the '/example'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'example'},

    // Auth routes for guests
    // {
    //     path: '',
    //     canActivate: [NoAuthGuard],
    //     canActivateChild: [NoAuthGuard],
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children: [
    //         {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule)},
    //         {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule)},
    //         {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule)},
    //         {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule)},
    //         {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)}
    //     ]
    // },
    // {
    //     path       : 'miscellaneous',
    //     canActivate: [NoAuthGuard],
    //     canActivateChild: [NoAuthGuard],
    //     component  : LayoutComponent,
    //     resolve    : {
    //         initialData: InitialDataResolver,
    //     },
    //     children   : [
    //         {path: '', loadChildren: () => import('app/modules/miscellaneous/miscellaneous.module').then(m => m.MiscellaneousModule)},
    //         //{path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule)},
    //     ]
    // },

    {
        path: '',
        component  : LayoutComponent,
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        data: {
            layout: 'empty'
        },
        children   : [
            // {path: '', loadChildren: () => import('app/modules/redirect/redirect.module').then(m => m.RedirectModule)},
            {path: '', redirectTo: 'login', pathMatch: 'full' },
            {path: 'login', loadChildren: () => import('app/modules/login/login.module').then(m => m.LoginModule)},
            {path: 'error', redirectTo: 'login' },
            {path: 'id_token', loadChildren: () => import('app/modules/redirect/redirect.module').then(m => m.RedirectModule)},
            {path: 'code', loadChildren: () => import('app/modules/redirect/redirect.module').then(m => m.RedirectModule)},
            {path: 'state', loadChildren: () => import('app/modules/redirect/redirect.module').then(m => m.RedirectModule)},
        ]
    },
    // {
    //     path       : '',
    //     canActivate: [NoAuthGuard],
    //     canActivateChild: [NoAuthGuard],
    //     component  : LayoutComponent,
    //     resolve    : {
    //         initialData: InitialDataResolver,
    //     },
    //     children   : [
    //         {path: '', loadChildren: () => import('app/modules/login/login.module').then(m => m.LoginModule)},
    //         //{path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule)},
    //     ]
    // },

    // Auth routes for authenticated users
    // {
    //     path: '',
    //     canActivate: [AuthGuard],
    //     canActivateChild: [AuthGuard],
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children: [
    //         {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)},
    //         {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)}
    //     ]
    // },

    // Landing routes
    // {
    //     path: '',
    //     component  : LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children   : [
    //         {path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
    //     ]
    // },

    // Admin routes
    {
        path       : '',
        // canActivate: [AuthGuard],        // Uncomment for SECURITY AUTHENTICATION
        // canActivateChild: [AuthGuard],   // Uncomment for SECURITY AUTHENTICATION
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component  : LayoutComponent,
        data: { layout: 'classic' },
        resolve    : {
            initialData: InitialDataResolver,
        },
        children   : [
            // {path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
            {path: 'check', loadChildren: () => import('app/modules/reserve/reserve.module').then(m => m.ReserveModule)},
            {path: 'campaign', loadChildren: () => import('app/modules/campaign-targeting/campaign-targeting.module').then(m => m.CampaignTargetingModule)},
             {path: 'dashboard', loadChildren: () => import('app/modules/dashboard/dashboard.module').then(m => m.DashboardModule)},
            {path: 'blacklistcheck', loadChildren: () => import('app/modules/blacklist-check/blacklist-check.module').then(m => m.BlacklistCheckModule)},
            // {path: 'cug', loadChildren: () => import('app/modules/cug/cug.module').then(m => m.CugModule)},
            {path: 'miscellaneous', loadChildren: () => import('app/modules/miscellaneous/miscellaneous.module').then(m => m.MiscellaneousModule)},
            {path: 'order', loadChildren: () => import('app/modules/order/order.module').then(m => m.OrderModule)},
            {path: 'inventory', loadChildren: () => import('app/modules/inventory/inventory.module'). then(m => m.InventoryModule)},
            {path: 'success', loadChildren: () => import('app/modules/success-order/success.module').then(m => m.SuccessOrderModule)},
            {path: 'code', loadChildren: () => import('app/modules/dashboard/dashboard.module').then(m => m.DashboardModule)},
        ]
    },

    // Admin routes
    // {
    //     path       : 'cug',
    //     canActivate: [AuthGuard],
    //     canActivateChild: [AuthGuard],
    //     component  : LayoutComponent,
    //     resolve    : {
    //         initialData: InitialDataResolver,
    //     },
    //     children   : [
    //         {path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule)},
    //     ]
    // },
    // {
    //     path: 'test',
    //     component  : LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children   : [
    //         {path: 'check', loadChildren: () => import('app/modules/reserve/reserve.module').then(m => m.ReserveModule)},
    //         {path: 'campaign', loadChildren: () => import('app/modules/campaign-targeting/campaign-targeting.module').then(m => m.CampaignTargetingModule)},
    //         {path: 'dashboard', loadChildren: () => import('app/modules/dashboard/dashboard.module').then(m => m.DashboardModule)},
    //         {path: 'login', loadChildren: () => import('app/modules/login/login.module').then(m => m.LoginModule)},
    //         {path: 'blacklistcheck', loadChildren: () => import('app/modules/blacklist-check/blacklist-check.module').then(m => m.BlacklistCheckModule)},
    //         {path: 'cug', loadChildren: () => import('app/modules/cug/cug.module').then(m => m.CugModule)},
    //     ]
    // },
];
