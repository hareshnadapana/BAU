exports.navigation = {
  "compact": [
    {
      "id": "home",
      "title": "Home",
      "type": "aside",
      "icon": "heroicons_outline:celcom-home",
      "link": "/home"
    },
    {
      "id": "order",
      "title": "Order",
      "type": "aside",
      "icon": "heroicons_outline:celcom-order",
      "link": "",
      "children": [
        {
          "id": "NewReg",
          "title": "New Registration",
          "type": "basic",
          "icon": "",
          "link": "/order/landing",
          "queryParams": "type=new"
        },
        {
          "id": "portin",
          "title": "Portin",
          "type": "basic",
          "icon": "",
          "link": "/order/landing",
          "queryParams": "type=portin"
        }
      ]
    },
    {
      "id": "blacklist",
      "title": "Blacklist Check",
      "type": "basic",
      "icon": "heroicons_outline:blacklistcheck",
      "externalLink": true,
      "link": "http://10.8.44.4:8082/#/blacklistcheck"
    },
    {
      "id": "numberreservation",
      "title": "Number Reservation",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-manage-numbers",
      "link": "",
      "children": [
        {
          "id": "reservenumber",
          "title": "Reserve Number",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/check/reservenumber"
        },
        {
          "id": "unreservenumber",
          "title": "Unreserve Number",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/check/unreservenumber"
        }
      ]
    },
    {
      "id": "search",
      "title": "Search",
      "type": "aside",
      "icon": "heroicons_outline:celcom-search",
      "link": "/dashboard/landing",
      "children": [
        {
          "id": "search",
          "title": "Search Customer",
          "type": "basic",
          "icon": "",
          "link": "/customer/searchCustomer"
        },
        {
          "id": "orderSearch",
          "title": "Order History",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/order/history"
        }
      ]
    },
    {
      "id": "miscellaneousorders",
      "title": "Miscellaneous Orders",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-miscellaneous-order",
      "link": "",
      "children": [
        {
          "id": "miscellaneous",
          "title": "Miscellaneous",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/miscellaneous"
        },
        {
          "id": "querystatus",
          "title": "Query Status",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/miscellaneous/querystatus"
        }
      ]
    },
    {
      "id": "customertargetlist",
      "title": "Customer Target List",
      "type": "basic",
      "icon": "heroicons_outline:celcom-campaign-targeting",
      "externalLink": true,
      "link": "http://10.8.44.4:8082/#/campaign/customertargetlist"
    },
    {
      id: 'configurator',
      title: 'Configurator',
      type: 'aside',
      icon: 'heroicons_outline:menu-icon-config-small',
      link: '/admin/landing',
      children: [
        {
          id: 'formEditor',
          title: 'Form Configurator',
          type: 'basic',
          link: '/configureForm'
        },
        {
          id: 'appSettings',
          title: 'App Settings',
          type: 'basic',
          link: '/appSettings',
        },
        {
          id: 'cpq.featureSettings',
          title: 'Feature Settings',
          type: 'basic',
          link: '/cpq/featureSettings',
        }
      ]
    }
  ],
  "default": [
    {
      "id": "home",
      "title": "Home",
      "type": "basic",
      "icon": "heroicons_outline:celcom-home",
      "link": "/home"
    },
    {
      "id": "order",
      "title": "Order",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-order",
      "link": "",
      "children": [
        {
          "id": "NewReg",
          "title": "New Registration",
          "type": "basic",
          "icon": "",
          "link": "/order/landing",
          "queryParams": "type=new"
        },
        {
          "id": "portin",
          "title": "Portin",
          "type": "basic",
          "icon": "",
          "link": "/order/landing",
          "queryParams": "type=portin"
        }
      ]
    },
    {
      "id": "blacklist",
      "title": "Blacklist Check",
      "type": "basic",
      "icon": "heroicons_outline:blacklistcheck",
      "externalLink": true,
      "link": "http://10.8.44.4:8082/#/blacklistcheck"
    },
    {
      "id": "numberreservation",
      "title": "Number Reservation",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-manage-numbers",
      "link": "",
      "children": [
        {
          "id": "reservenumber",
          "title": "Reserve Number",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/check/reservenumber"
        },
        {
          "id": "unreservenumber",
          "title": "Unreserve Number",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/check/unreservenumber"
        }
      ]
    },
    {
      "id": "search",
      "title": "Search",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-search",
      "link": "/dashboard/landing",
      "children": [
        {
          "id": "search",
          "title": "Search Customer",
          "type": "basic",
          "icon": "",
          "link": "/customer/searchCustomer"
        },
        {
          "id": "orderSearch",
          "title": "Order History",
          "type": "basic",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/order/history"
        },
      ]
    },
    {
      "id": "miscellaneousorders",
      "title": "Miscellaneous Orders",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-miscellaneous-order",
      "link": "",
      "children": [
        {
          "id": "miscellaneous",
          "title": "Miscellaneous",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/miscellaneous"
        },
        {
          "id": "querystatus",
          "title": "Query Status",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/miscellaneous/querystatus"
        }
      ]
    },
    {
      "id": "customertargetlist",
      "title": "Customer Target List",
      "type": "basic",
      "icon": "heroicons_outline:celcom-campaign-targeting",
      "externalLink": true,
      "link": "http://10.8.44.4:8082/#/campaign/customertargetlist"
    },
    {
      id: 'configurator',
      title: 'Configurator',
      type: 'collapsable',
      icon: 'heroicons_outline:menu-icon-config-small',
      link: '/admin/landing',
      children: [
        {
          id: 'formEditor',
          title: 'Form Configurator',
          type: 'basic',
          link: '/configureForm'
        },
        {
          id: 'appSettings',
          title: 'App Settings',
          type: 'basic',
          link: '/appSettings',
        },
        {
          id: 'cpq.featureSettings',
          title: 'Feature Settings',
          type: 'basic',
          link: '/cpq/featureSettings',
        }
      ]
    }
  ],
  "futuristic": [
    {
      id: 'home',
      title: 'Home',
      type: 'basic',
      icon: "heroicons_outline:celcom-home",
      link: "/home"
    },
    {
      "id": "order",
      "title": "Order",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-order",
      "link": "",
      "children": [
        {
          "id": "NewReg",
          "title": "New Registration",
          "type": "basic",
          "icon": "",
          "link": "/order/landing",
          "queryParams": "type=new"
        },
        {
          "id": "portin",
          "title": "Portin",
          "type": "basic",
          "icon": "",
          "link": "/order/landing",
          "queryParams": "type=portin"
        }
      ]
    },
    {
      "id": "blacklist",
      "title": "Blacklist Check",
      "type": "basic",
      "icon": "heroicons_outline:blacklistcheck",
      "externalLink": true,
      "link": "http://10.8.44.4:8082/#/blacklistcheck"
    },
    {
      "id": "numberreservation",
      "title": "Number Reservation",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-manage-numbers",
      "link": "",
      "children": [
        {
          "id": "reservenumber",
          "title": "Reserve Number",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/check/reservenumber"
        },
        {
          "id": "unreservenumber",
          "title": "Unreserve Number",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/check/unreservenumber"
        }
      ]
    },
    {
      "id": "search",
      "title": "Search",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-search",
      "link": "/dashboard/landing",
      "children": [
        {
          "id": "search",
          "title": "Search Customer",
          "type": "basic",
          "icon": "",
          "link": "/customer/searchCustomer"
        },
        {
          "id": "orderSearch",
          "title": "Order History",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/order/history"
        }
      ]
    },
    {
      "id": "miscellaneousorders",
      "title": "Miscellaneous Orders",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-miscellaneous-order",
      "link": "",
      "children": [
        {
          "id": "miscellaneous",
          "title": "Miscellaneous",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/miscellaneous"
        },
        {
          "id": "querystatus",
          "title": "Query Status",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/miscellaneous/querystatus"
        }
      ]
    },
    {
      "id": "customertargetlist",
      "title": "Customer Target List",
      "type": "basic",
      "icon": "heroicons_outline:celcom-campaign-targeting",
      "externalLink": true,
      "link": "http://10.8.44.4:8082/#/campaign/customertargetlist"
    },
    {
      id: 'configurator',
      title: 'Configurator',
      type: 'collapsable',
      icon: 'heroicons_outline:menu-icon-config-small',
      link: '/admin/landing',
      children: [
        {
          id: 'formEditor',
          title: 'Form Configurator',
          type: 'basic',
          link: '/configureForm'
        },
        {
          id: 'cpq.individuallead',
          title: 'Create Individual Lead',
          type: 'basic',
          icon: 'dashboard',
          link: '/cpq/createindividuallead'
        },
        {
          id: 'cpq.individuallead',
          title: 'Individual Lead',
          type: 'basic',
          icon: 'dashboard',
          link: '/cpq/searchindividuallead'
        },
        {
          id: 'appSettings',
          title: 'App Settings',
          type: 'basic',
          link: '/appSettings',
        },
        {
          id: 'cpq.featureSettings',
          title: 'Feature Settings',
          type: 'basic',
          link: '/cpq/featureSettings',
        }
      ]
    }
  ],
  "horizontal": [
    {
      "id": "home",
      "title": "Home",
      "type": "basic",
      "icon": "heroicons_outline:celcom-home",
      "link": "/home"
    },
    {
      "id": "order",
      "title": "Order",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-order",
      "link": "",
      "children": [
        {
          "id": "NewReg",
          "title": "New Registration",
          "type": "basic",
          "icon": "",
          "link": "/order/landing",
          "queryParams": "type=new"
        },
        {
          "id": "portin",
          "title": "Portin",
          "type": "basic",
          "icon": "",
          "link": "/order/landing",
          "queryParams": "type=portin"
        }
      ]
    },
    {
      "id": "blacklist",
      "title": "Blacklist Check",
      "type": "basic",
      "icon": "heroicons_outline:blacklistcheck",
      "externalLink": true,
      "link": "http://10.8.44.4:8082/#/blacklistcheck"
    },
    {
      "id": "numberreservation",
      "title": "Number Reservation",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-manage-numbers",
      "link": "",
      "children": [
        {
          "id": "reservenumber",
          "title": "Reserve Number",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/check/reservenumber"
        },
        {
          "id": "unreservenumber",
          "title": "Unreserve Number",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/check/unreservenumber"
        }
      ]
    },
    {
      "id": "search",
      "title": "Search",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-search",
      "link": "/dashboard/landing",
      "children": [
        {
          "id": "search",
          "title": "Search Customer",
          "type": "basic",
          "icon": "",
          "link": "/customer/searchCustomer"
        },
        {
          "id": "orderSearch",
          "title": "Order History",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/order/history"
        }
      ]
    },
    {
      "id": "miscellaneousorders",
      "title": "Miscellaneous Orders",
      "type": "collapsable",
      "icon": "heroicons_outline:celcom-miscellaneous-order",
      "link": "",
      "children": [
        {
          "id": "miscellaneous",
          "title": "Miscellaneous",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/miscellaneous"
        },
        {
          "id": "querystatus",
          "title": "Query Status",
          "type": "basic",
          "icon": "",
          "externalLink": true,
          "link": "http://10.8.44.4:8082/#/miscellaneous/querystatus"
        }
      ]
    },
    {
      "id": "customertargetlist",
      "title": "Customer Target List",
      "type": "basic",
      "icon": "heroicons_outline:celcom-campaign-targeting",
      "externalLink": true,
      "link": "http://10.8.44.4:8082/#/campaign/customertargetlist"
    },
    {
      id: 'configurator',
      title: 'Configurator',
      type: 'collapsable',
      icon: 'heroicons_outline:menu-icon-config-small',
      link: '/admin/landing',
      children: [
        {
          id: 'formEditor',
          title: 'Form Configurator',
          type: 'basic',
          link: '/configureForm'
        },
        {
          id: 'cpq.individuallead',
          title: 'Create Individual Lead',
          type: 'basic',
          icon: 'dashboard',
          link: '/cpq/createindividuallead'
        },
        {
          id: 'cpq.individuallead',
          title: 'Individual Lead',
          type: 'basic',
          icon: 'dashboard',
          link: '/cpq/searchindividuallead'
        },
        {
          id: 'appSettings',
          title: 'App Settings',
          type: 'basic',
          link: '/appSettings',
        },
        {
          id: 'cpq.featureSettings',
          title: 'Feature Settings',
          type: 'basic',
          link: '/cpq/featureSettings',
        }
      ]
    }
  ]
};

exports.language = {
  "language": [
    {
      "id": "en",
      "label": "English"
    },
    // {
    //   "id": "fi",
    //   "label": "Finnish"
    // },
    // {
    //   "id": "tr",
    //   "label": "Turkish"
    // }
  ],
  "defaultLang": "en"
};

exports.layoutConfig = {
  "layout": "classic",
  "scheme": "light",
  "theme": "default"
};

exports.layouts = {
  "empty": false,
  "classic": true,
  "classy": false,
  "compact": false,
  "dense": false,
  "futuristic": false,
  "thin": false,
  "centered": false,
  "enterprise": false,
  "material": false,
  "modern": false,
}