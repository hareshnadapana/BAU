/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';
import { currentEnv, urlNav } from 'app/URL';

// icon : 'heroicons_outline:chart-pie',
export const defaultNavigation: FuseNavigationItem[] = [
    {
        id    : 'home',
        title : 'Home',
        type  : 'basic',
        externalLink: true,
        icon  : 'heroicons_outline:w-home',
        link   : `${currentEnv}${urlNav.frontofficehome}`,
        target: '_parent'
    },
    {
        id   : 'order',
        title: 'Order',
        type : 'collapsable',
        icon : 'heroicons_outline:w-order',
        link : '',
        children: [
            {
                id: 'newregistration',
                title: 'New Registration',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link   : `${currentEnv}${urlNav.frontofficenewreg}`,
                target: '_parent'
            },
            {
                id: 'portin',
                title: 'Mobile Number Portability',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link   : `${currentEnv}${urlNav.frontofficeportin}`,
                target: '_parent'
            },
            {
                id: 'crp',
                title: 'Change Rate Plan',
                type: 'basic',
                externalLink: true,
                icon: '',
                link: `${currentEnv}${urlNav.frontofficesearchcust}`,
                target: '_parent'
            }
        ]
    },
    {
        id   : 'blacklistcheck',
        title: 'Blacklist Check',
        type : 'basic',
        icon : 'heroicons_outline:w-blacklistcheck',
        link : '/blacklistcheck',
    },
    {
        id   : 'numberreservation',
        title: 'Number Reservation',
        type : 'collapsable',
        icon : 'heroicons_outline:w-manageorder',
        link : '',
        children: [
            {
                id: 'reservenumber',
                title: 'Reserve Number',
                type: 'basic',
                icon: '',
                link: "/check/reservenumber",
            },
            {
                id: 'unreservenumber',
                title: 'Unreserve Number',
                type: 'basic',
                icon: '',
                link: '/check/unreservenumber',
            }
        ]
    },
    {
        id   : 'search',
        title: 'Search',
        type : 'collapsable',
        icon : 'heroicons_outline:w-search',
        link : '',
        children: [
            {
                id: 'searchcustomer',
                title: 'Search Customer',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link: `${currentEnv}${urlNav.frontofficesearchcust}`,
                target: '_parent'
            },
        ]
    },
    {
        id: 'searchorder',
        title: 'Order History',
        type: 'basic',
        icon : 'heroicons_outline:w-searchorder',
        link   : '/order/history',
    },
    // {
    //     id   : 'miscellaneousorders',
    //     title: 'Miscellaneous Orders',
    //     type : 'collapsable',
    //     icon : 'heroicons_outline:w-miscellaneous',
    //     link : '',
    //     children: [
    //         {
    //             id   : 'miscellaneous',
    //             title: 'Miscellaneous',
    //             type : 'basic',
    //             icon : '',
    //             link : '/miscellaneous/createsr',
    //         },
    //         {
    //             id   : 'querystatus',
    //             title: 'Query Status',
    //             type : 'basic',
    //             icon : '',
    //             link : '/miscellaneous/querystatus',
    //         },
    //     ]
    // },
    {
        id   : 'customertargetlist',
        title: 'Customer Target List',
        type : 'basic',
        icon : 'heroicons_outline:w-campaigntargeting',
        link : '/campaign/customertargetlist',
    },
    {
        id   : 'stockInventory',
        title: 'Stock Inventory',
        type : 'basic',
        icon : 'heroicons_outline:celcom-deviceinventory',
        link : '/inventory/stock',
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id    : 'home',
        title : 'Home',
        type  : 'basic',
        externalLink: true,
        icon  : 'heroicons_outline:w-home',
        link   : `${currentEnv}${urlNav.frontofficehome}`,
        target: '_parent'
    },
    {
        id   : 'order',
        title: 'Order',
        type : 'collapsable',
        icon : 'heroicons_outline:w-order',
        link : '',
        children: [
            {
                id: 'newregistration',
                title: 'New Registration',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link   : `${currentEnv}${urlNav.frontofficenewreg}`,
                target: '_parent'
            },
            {
                id: 'portin',
                title: 'Mobile Number Portability',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link   : `${currentEnv}${urlNav.frontofficeportin}`,
                target: '_parent'
            },
            {
                id: 'crp',
                title: 'Change Rate Plan',
                type: 'basic',
                externalLink: true,
                icon: '',
                link: `${currentEnv}${urlNav.frontofficesearchcust}`,
                target: '_parent'
            }
        ]
    },
    {
        id   : 'blacklistcheck',
        title: 'Blacklist Check',
        type : 'basic',
        icon : 'heroicons_outline:w-blacklistcheck',
        link : '/blacklistcheck',
    },
    {
        id   : 'numberreservation',
        title: 'Number Reservation',
        type : 'collapsable',
        icon : 'heroicons_outline:w-manageorder',
        link : '',
        children: [
            {
                id: 'reservenumber',
                title: 'Reserve Number',
                type: 'basic',
                icon: '',
                link: "/check/reservenumber",
            },
            {
                id: 'unreservenumber',
                title: 'Unreserve Number',
                type: 'basic',
                icon: '',
                link: '/check/unreservenumber',
            }
        ]
    },
    {
        id   : 'search',
        title: 'Search',
        type : 'collapsable',
        icon : 'heroicons_outline:w-search',
        link : '',
        children: [
            {
                id: 'searchcustomer',
                title: 'Search Customer',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link   : `${currentEnv}${urlNav.frontofficesearchcust}`,
                target: '_parent'
            },
        ]
    },
    {
        id: 'searchorder',
        title: 'Order History',
        type: 'basic',
        icon : 'heroicons_outline:w-searchorder',
        link   : '/order/history',
    },
    // {
    //     id   : 'miscellaneousorders',
    //     title: 'Miscellaneous Orders',
    //     type : 'collapsable',
    //     icon : '',
    //     link : '',
    //     children: [
    //         {
    //             id   : 'miscellaneous',
    //             title: 'Miscellaneous',
    //             type : 'basic',
    //             icon : '',
    //             link : '/miscellaneous/createsr',
    //         },
    //         {
    //             id   : 'querystatus',
    //             title: 'Query Status',
    //             type : 'basic',
    //             icon : '',
    //             link : '/miscellaneous/querystatus',
    //         },
    //     ]
    // },
    {
        id   : 'customertargetlist',
        title: 'Customer Target List',
        type : 'basic',
        icon : 'heroicons_outline:w-campaigntargeting',
        link : '/campaign/customertargetlist',
    },
    {
        id   : 'stockInventory',
        title: 'Stock Inventory',
        type : 'basic',
        icon : 'heroicons_outline:celcom-deviceinventory',
        link : '/inventory/stock',
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id    : 'home',
        title : 'Home',
        type  : 'basic',
        externalLink: true,
        icon  : 'heroicons_outline:w-home',
        link   : `${currentEnv}${urlNav.frontofficehome}`,
        target: '_parent'
    },
    {
        id   : 'order',
        title: 'Order',
        type : 'collapsable',
        icon : 'heroicons_outline:w-order',
        link : '',
        children: [
            {
                id: 'newregistration',
                title: 'New Registration',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link   : `${currentEnv}${urlNav.frontofficenewreg}`,
                target: '_parent'
            },
            {
                id: 'portin',
                title: 'Mobile Number Portability',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link   : `${currentEnv}${urlNav.frontofficeportin}`,
                target: '_parent'
            },
            {
                id: 'crp',
                title: 'Change Rate Plan',
                type: 'basic',
                externalLink: true,
                icon: '',
                link: `${currentEnv}${urlNav.frontofficesearchcust}`,
                target: '_parent'
            }
        ]
    },
    {
        id   : 'blacklistcheck',
        title: 'Blacklist Check',
        type : 'basic',
        icon : 'heroicons_outline:w-blacklistcheck',
        link : '/blacklistcheck',
    },
    {
        id   : 'numberreservation',
        title: 'Number Reservation',
        type : 'collapsable',
        icon : 'heroicons_outline:w-manageorder',
        link : '',
        children: [
            {
                id: 'reservenumber',
                title: 'Reserve Number',
                type: 'basic',
                icon: '',
                link: "/check/reservenumber",
            },
            {
                id: 'unreservenumber',
                title: 'Unreserve Number',
                type: 'basic',
                icon: '',
                link: '/check/unreservenumber',
            }
        ]
    },
    {
        id   : 'search',
        title: 'Search',
        type : 'collapsable',
        icon : 'heroicons_outline:w-search',
        link : '',
        children: [
            {
                id: 'searchcustomer',
                title: 'Search Customer',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link   : `${currentEnv}${urlNav.frontofficesearchcust}`,
                target: '_parent'
            },
        ]
    },
    {
        id: 'searchorder',
        title: 'Order History',
        type: 'basic',
        icon : 'heroicons_outline:w-searchorder',
        link   : '/order/history',
    },
    // {
    //     id   : 'miscellaneousorders',
    //     title: 'Miscellaneous Orders',
    //     type : 'collapsable',
    //     icon : '',
    //     link : '',
    //     children: [
    //         {
    //             id   : 'miscellaneous',
    //             title: 'Miscellaneous',
    //             type : 'basic',
    //             icon : '',
    //             link : '/miscellaneous/createsr',
    //         },
    //         {
    //             id   : 'querystatus',
    //             title: 'Query Status',
    //             type : 'basic',
    //             icon : '',
    //             link : '/miscellaneous/querystatus',
    //         },
    //     ]
    // },
    {
        id   : 'customertargetlist',
        title: 'Customer Target List',
        type : 'basic',
        icon : 'heroicons_outline:w-campaigntargeting',
        link : '/campaign/customertargetlist',
    },
    {
        id   : 'stockInventory',
        title: 'Stock Inventory',
        type : 'basic',
        icon : 'heroicons_outline:celcom-deviceinventory',
        link : '/inventory/stock',
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id    : 'home',
        title : 'Home',
        type  : 'basic',
        externalLink: true,
        icon  : 'heroicons_outline:w-home',
        link   : `${currentEnv}${urlNav.frontofficehome}`,
        target: '_parent'
    },
    {
        id   : 'order',
        title: 'Order',
        type : 'collapsable',
        icon : 'heroicons_outline:w-order',
        link : '',
        children: [
            {
                id: 'newregistration',
                title: 'New Registration',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link   : `${currentEnv}${urlNav.frontofficenewreg}`,
                target: '_parent'
            },
            {
                id: 'portin',
                title: 'Mobile Number Portability',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link   : `${currentEnv}${urlNav.frontofficeportin}`,
                target: '_parent'
            },
            {
                id: 'crp',
                title: 'Change Rate Plan',
                type: 'basic',
                externalLink: true,
                icon: '',
                link: `${currentEnv}${urlNav.frontofficesearchcust}`,
                target: '_parent'
            }
        ]
    },
    {
        id   : 'blacklistcheck',
        title: 'Blacklist Check',
        type : 'basic',
        icon : 'heroicons_outline:w-blacklistcheck',
        link : '/blacklistcheck',
    },
    {
        id   : 'numberreservation',
        title: 'Number Reservation',
        type : 'collapsable',
        icon : 'heroicons_outline:w-manageorder',
        link : '',
        children: [
            {
                id: 'reservenumber',
                title: 'Reserve Number',
                type: 'basic',
                icon: '',
                link: "/check/reservenumber",
            },
            {
                id: 'unreservenumber',
                title: 'Unreserve Number',
                type: 'basic',
                icon: '',
                link: '/check/unreservenumber',
            }
        ]
    },
    {
        id   : 'search',
        title: 'Search',
        type : 'collapsable',
        icon : 'heroicons_outline:w-search',
        link : '',
        children: [
            {
                id: 'searchcustomer',
                title: 'Search Customer',
                type: 'basic',
                externalLink: true,
                icon  : '',
                link   : `${currentEnv}${urlNav.frontofficesearchcust}`,
                target: '_parent'
            },
        ]
    },
    {
        id: 'searchorder',
        title: 'Search Order',
        type: 'basic',
        icon : 'heroicons_outline:w-searchorder',
        link   : '/order/history',
    },
    // {
    //     id   : 'miscellaneousorders',
    //     title: 'Miscellaneous Orders',
    //     type : 'collapsable',
    //     icon : '',
    //     link : '',
    //     children: [
    //         {
    //             id   : 'miscellaneous',
    //             title: 'Miscellaneous',
    //             type : 'basic',
    //             icon : '',
    //             link : '/miscellaneous/createsr',
    //         },
    //         {
    //             id   : 'querystatus',
    //             title: 'Query Status',
    //             type : 'basic',
    //             icon : '',
    //             link : '/miscellaneous/querystatus',
    //         },
    //     ]
    // },
    {
        id   : 'customertargetlist',
        title: 'Customer Target List',
        type : 'basic',
        icon : 'heroicons_outline:w-campaigntargeting',
        link : '/campaign/customertargetlist',
    },
    {
        id   : 'stockInventory',
        title: 'Stock Inventory',
        type : 'basic',
        icon : 'heroicons_outline:celcom-deviceinventory',
        link : '/inventory/stock',
    },
];
