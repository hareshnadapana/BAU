const envConst = require('./envConst.js');

exports.apiEndPoint = {
  "responseStatusList": {
    "status": [
      {
        "statusCode": "0000",
        "statusDescription": "Requested Operation Completed Successfully",
        "statusType": "Success",
        "statusCategory": "Success"
      }
    ]
  },
  "appUrls": {
    "logout": envConst.APP_CONTEXT + '/logout',
    "logoutHost": envConst.APP_CONTEXT + '/logoutHost',
    "getCLV": envConst.APP_CONTEXT + "/api/getCLV",
    "customer": envConst.APP_CONTEXT + "/api/customer",
    "serviceDetails": envConst.APP_CONTEXT + "/api/serviceDetails",
    "billingDetails": envConst.APP_CONTEXT + "/api/billingDetails",
    "addInteractions": envConst.APP_CONTEXT + "/api/addInteraction",
    "getDocumentList": envConst.APP_CONTEXT + "/api/getDocumentList",
    "deleteDocument": envConst.APP_CONTEXT + "/api/deleteDocument",
    "getPartyEnabled": envConst.APP_CONTEXT + "/api/dashboard/partyEnabled/",
    "updatePartyEnabled": envConst.APP_CONTEXT + "/api/updatepartyEnabled",
    "deletePartyEnabled": envConst.APP_CONTEXT + "/api/deletepartyEnabled",
    "getInteractions": envConst.APP_CONTEXT + "/api/getInteractions",
    "getbalance": envConst.APP_CONTEXT + "/api/getbalance",
    "getcustomerCommunication": envConst.APP_CONTEXT + "/api/getcustomerCommunication",
    "enterpriseServiceDetails": envConst.APP_CONTEXT + "/api/enterpriseServiceDetails",
    "subscriberServiceDetails": envConst.APP_CONTEXT + "/api/subscriberServiceDetails",
    "generateOTP": envConst.APP_CONTEXT + "/api/generateOTP",
    "validateOTP": envConst.APP_CONTEXT + "/api/validateOTP",
    "consentDetails": envConst.APP_CONTEXT + "/api/consentDetails",
    "subscriberService": envConst.APP_CONTEXT + "/api/subscriberService",
    "subscriberWidgetDetails": envConst.APP_CONTEXT + "/api/subscriberWidgetDetails",
    "updateConsentDetails": envConst.APP_CONTEXT + "/api/updateConsentDetails",
    "subscriberSummaryByCustomerId": envConst.APP_CONTEXT + "/api/subscriberSummaryByCustomerId",
    "subscriberSummaryByCustomerIdFilter": envConst.APP_CONTEXT + "/api/subscriberSummaryByCustomerIdFilter",
    "subscriberAllowedActions": envConst.APP_CONTEXT + "/api/subscriberAllowedActions",
    "userSummary": envConst.APP_CONTEXT + "/api/userSummary",
    "getServiceSummary": envConst.APP_CONTEXT + "/api/getServiceSummary",
    "serviceFeatureList": envConst.APP_CONTEXT + "/api/serviceFeatureList",
    "householdDeviceList": envConst.APP_CONTEXT + "/api/householdDeviceList",
    "listOfAccountByCustomer": envConst.APP_CONTEXT + "/api/listOfAccountByCustomer",
    "subscriberHeaderList": envConst.APP_CONTEXT + "/api/subscriberHeaderList",
    "userHeaderList": envConst.APP_CONTEXT + "/api/userHeaderList",
    "payerUserHeaderList": envConst.APP_CONTEXT + "/api/payerUserHeaderList",
    "customerDashboardTabList": envConst.APP_CONTEXT + "/api/customerDashboardTabList",
    "serviceDetailsHeaderList": envConst.APP_CONTEXT + "/api/serviceDetailsHeaderList",
    "getRefDataFinal": envConst.APP_CONTEXT + "/api/getRefDataFinal",
    "createContact": envConst.APP_CONTEXT + "/api/createContact",
    "getInvoiceList": envConst.APP_CONTEXT + "/api/getInvoiceList",
    "invoiceHeaderList": envConst.APP_CONTEXT + "/api/invoiceHeaderList",
    "getInvoiceAndActions": envConst.APP_CONTEXT + "/api/getInvoiceAndActions",
    "getEligibleProductOffering": envConst.APP_CONTEXT + "/api/getEligibleProductOffering",
    "getInvoiceImage": envConst.APP_CONTEXT + "/api/getInvoiceImage",
    "getConfigurableOffer": envConst.APP_CONTEXT + "/api/getConfigurableOffer",
    "initializeContext": envConst.APP_CONTEXT + "/api/initializeContext",
    "getBulkActions": envConst.APP_CONTEXT + "/api/getBulkActions",
    "getOrderDetails": envConst.APP_CONTEXT + "/api/getOrderDetails",
    "getInitiateBulkChangePackage": envConst.APP_CONTEXT + "/api/getInitiateBulkChangePackage",
    "getOfferValidation": envConst.APP_CONTEXT + "/api/getOfferValidation",
    "getChangeSummaryOfferValidation": envConst.APP_CONTEXT + "/api/getChangeSummaryOfferValidation",
    "reconfigureCartItem": envConst.APP_CONTEXT + "/api/reconfigureCartItem",
    "submitOrder": envConst.APP_CONTEXT + "/api/submitOrder",
    "getInitiateBulkAddRemoveFeatures": envConst.APP_CONTEXT + "/api/getInitiateBulkAddRemoveFeatures",
    "getShoppingCartItemByID": envConst.APP_CONTEXT + "/api/getShoppingCartItemByID",
    "orderHeaderList": envConst.APP_CONTEXT + "/api/orderHeaderList",
    "orderStatusHeader": envConst.APP_CONTEXT + "/api/orderStatusHeader",
    "orderServiceDetails": envConst.APP_CONTEXT + "/api/orderServiceDetails",
    "filterCriteria": envConst.APP_CONTEXT + "/api/filterCriteria",
    "searchCustomer": envConst.APP_CONTEXT + "/api/searchCustomer",
    "getCustomerSubscriptions": envConst.APP_CONTEXT + "/api/getcustomerSubscriptions",
    "addToCart": envConst.APP_CONTEXT + "/api/addToCart",
    "getPricingBasedOnAttribute": envConst.APP_CONTEXT + "/api/getPricingBasedOnAttribute",
    "getCollectionCheckResult": envConst.APP_CONTEXT + "/api/getColelctionCheck",
    "getCreditCheckResult": envConst.APP_CONTEXT + "/api/getCreditCheck",
    "validateOrder": envConst.APP_CONTEXT + "/api/validateOrder",
    "sendNotification": envConst.APP_CONTEXT + "/api/sendNotification",
    "getFormData": envConst.APP_CONTEXT + "/api/getFormData",
    "getUserCount": envConst.APP_CONTEXT + "/api/getUserCount",
    "exportFileSubscriberSummaryByCustomerId": envConst.APP_CONTEXT + "/api/exportFileSubscriberSummaryByCustomerId",
    "exportFileUserDetailsService": envConst.APP_CONTEXT + "/api/exportFileUserDetailsService",
    "filterCriteriaOrder": envConst.APP_CONTEXT + "/api/filterCriteriaOrder",
    "initiateResume": envConst.APP_CONTEXT + "/api/initiateResume",
    "initiateSuspend": envConst.APP_CONTEXT + "/api/initiateSuspend",
    "initiateTerminate": envConst.APP_CONTEXT + "/api/initiateTerminate",
    "submitOrderForResume": envConst.APP_CONTEXT + "/api/submitOrderForResume",
    "formDataForTerminateReason": envConst.APP_CONTEXT + "/api/formDataForTerminateReason",
    "getSubscriberAppSetting": envConst.APP_CONTEXT + "/api/subscriberAppSetting",
    "sseEvents": envConst.APP_CONTEXT + "/api/sseEvents",
    "getEntServiceGroupList": envConst.APP_CONTEXT + "/api/entServiceGroupList",
    "getPreOrderCheckChangePackageValidation": envConst.APP_CONTEXT + "/api/getPreOrderCheckValidation",
    "getCDTabsConfig": envConst.APP_CONTEXT + "/api/getTabsConfig",
    "getContactPartyRole": envConst.APP_CONTEXT + "/api/getContactPartyRole",
    "getAppConfigJson": envConst.APP_CONTEXT + "/api/getAppConfigJson",
    "findCustomer": envConst.APP_CONTEXT + "/api/findCustomer",
    "aggregation": envConst.APP_CONTEXT + "/api/aggregation",
    "dateRange": envConst.APP_CONTEXT + "/api/dateRange",
    "getJSONFormData": envConst.APP_CONTEXT + "/api/dashboard/getJSONFormData",
    "addrelatednotes": envConst.APP_CONTEXT + "/api/dashboard/addrelatednotes",
    "getrelatednotes": envConst.APP_CONTEXT + "/api/dashboard/getrelatednotes",
    "makePayment": envConst.APP_CONTEXT + "/api/subscriberapp/makePayment",
    "get360ConsumerDetails": envConst.APP_CONTEXT + "/api/dashboard360/customerDetails",
    "adjustPayment": envConst.APP_CONTEXT + "/api/subscriberapp/adjustPayment",
    "getSearchByOrderId": envConst.APP_CONTEXT + "/api/searchByOrderId",
    "getCustomerTimeLineIntractionDetails": envConst.APP_CONTEXT + "/api/dashboard360/getCustomerTimeLineIntractionDetails",

    "customerUpdate": envConst.APP_CONTEXT + "/api/customerUpdate",

  }
}

exports.accountFormData = [
  {
    "key": "accountName",
    "title": "Name",
    "label": "Name",
    "required": false,
    "order": 1,
    "controlType": "labelvalue",
    "type": "",
    "enum": [

    ],
    "childenum": [

    ],
    "lookupExternal": false,
    "hasChildLookup": false,
    "isExternalValidation": false,
    "externalValues": {

    },
    "childProperty": "",
    "validationURL": "",
    "childPropertyDataAPIURL": "",
    "validators": {
      "pattern": "",
      "required": false
    },
    "error": {
      "pattern": "",
      "required": ""
    },
    "externalAPIPayload": {

    }
  },
  {
    "key": "accountID",
    "title": "Payer Code",
    "label": "Payer Code",
    "required": false,
    "order": 1,
    "controlType": "labelvalue",
    "type": "",
    "enum": [

    ],
    "childenum": [

    ],
    "lookupExternal": false,
    "hasChildLookup": false,
    "isExternalValidation": false,
    "externalValues": {

    },
    "childProperty": "",
    "validationURL": "",
    "childPropertyDataAPIURL": "",
    "validators": {
      "pattern": "",
      "required": false
    },
    "error": {
      "pattern": "",
      "required": ""
    },
    "externalAPIPayload": {

    }
  },
  {
    "key": "payerName",
    "title": "Signatory for Payment",
    "label": "Signatory for Payment",
    "required": false,
    "order": 1,
    "controlType": "labelvalue",
    "type": "",
    "enum": [

    ],
    "childenum": [

    ],
    "lookupExternal": false,
    "hasChildLookup": false,
    "isExternalValidation": false,
    "externalValues": {

    },
    "childProperty": "",
    "validationURL": "",
    "childPropertyDataAPIURL": "",
    "validators": {
      "pattern": "",
      "required": false
    },
    "error": {
      "pattern": "",
      "required": ""
    },
    "externalAPIPayload": {

    }
  },
  {
    "key": "payerAddress",
    "title": "Address",
    "label": "Address",
    "required": false,
    "order": 1,
    "controlType": "labelvalue",
    "type": "",
    "enum": [

    ],
    "childenum": [

    ],
    "lookupExternal": false,
    "hasChildLookup": false,
    "isExternalValidation": false,
    "externalValues": {

    },
    "childProperty": "",
    "validationURL": "",
    "childPropertyDataAPIURL": "",
    "validators": {
      "pattern": "",
      "required": false
    },
    "error": {
      "pattern": "",
      "required": ""
    },
    "externalAPIPayload": {

    }
  }
]



exports.subscriberAppSetting = {
  "responsive": true,
  "isShowHideColumnEnabled": true,
  "isExportToExcelEnabled": true,
  "filterByAPI": true,
  "isGenericFilterEnabled": true,
  "isExpandAllRowsEnabled": true,
  "isFilterEnabled": true,
  "isBulkActionsEnabled": true,
  "isExportAllToExcelEnabled": true,
  "isSearchFilterEnabled": true,
  "isGroupByEnabled": true,
  "exportToExcelViaAPI": true
}

exports.externalRouteUrl = {
  "responseStatusList": {
    "status": [
      {
        "statusCode": "0000",
        "statusDescription": "Requested Operation Completed Successfully",
        "statusType": "Success",
        "statusCategory": "Success"
      }
    ]
  },
  externalUrls: {
    "submitOrder": {
      "url": "/tcare/contextSearch.jsf",
      "queryParam": {
        "searchBy": "orderId",
        "redirectTo": "menuUI_OrderTracking",
        "searchValue": "{{orderId}}"
      }
    },
    "orderLogout": {
      "url": "/cas/logout",
      "queryParam": {
        "service": "https://" + envConst.CAS_PREFIX + envConst.APP_CONTEXT + "",
      }
    },
    "dashboardLanding": {
      // "url":  envConst.APP_CONTEXT+"/#/dashboard/landing",
      "angularRoute": "/dashboard/landing"
    },
    "homeLanding": {
      // "url":  envConst.APP_CONTEXT+"/#/dashboard/landing",
      "angularRoute": "/home"
    },
    "dashboardSubscriberTab": {
      // "url":  envConst.APP_CONTEXT+"/#/dashboard/landing",
      "angularRoute": "/dashboard/landing",
      "queryParam": {
        "customerId": "{{customerId}}",
      }
    },
    "typeNew": {
      // "url":  envConst.APP_CONTEXT+"/#/order/landing",
      "angularRoute": "/order/landing",
      "queryParam": {
        "type": "new",
      }
    },
    "uploadDocument": {
      // "url":  envConst.APP_CONTEXT+"/#/order/landing",
      "angularRoute": "customer/uploadDocument",
      "queryParam": {
        "type": "consumer360",
        "customerId": "{{customerId}}",
        // "accountId": "{{accountId}}",       
        // "subscriberId": "{{subscriberId}}",
        // "packageLabel": "{{packageLabel}}",
        // "serviceType":"{{serviceType}}",
        // "status": "{{status}}"
        // "date":"{{date}}"
      },

    },
    "orderProfilefromSub": {
     "angularRoute": "order-summary/orderProfile",
     "queryParam": {
       "type": "orderProfilefromSub",   
       "products": "{{products}}",
     },

    },
    "SubscriberProfile": {
      // "url":  envConst.APP_CONTEXT+"/#/subscriber/subscriberProfile",
      "angularRoute": "/subscriber/subscriberProfileView",
      "queryParam": {
        "type": "SubscriberProfile",
        "accountId": "{{accountId}}",
        "customerId": "{{customerId}}",
        "subscriberId": "{{subscriberId}}",
        "packageLabel": "{{packageLabel}}",
        "serviceType": "{{serviceType}}",
        "status": "{{status}}"
        // "date":"{{date}}"
      },
    },
    "subscriberProfileLanding": {
      // "url":  envConst.APP_CONTEXT+"/#/subscriber/subscriberProfile",
      "angularRoute": "dashboard/landing",
      "queryParam": {
        "accountId": "{{accountId}}",
        "customerId": "{{customerId}}",
        "subscriberId": "{{subscriberId}}",
        "packageLabel": "{{packageLabel}}",
        "serviceType": "{{serviceType}}",
        "routeScreen": "{{routeScreen}}"
      },
    },
    "changePackage": {
      // "url":  envConst.APP_CONTEXT+"/#/order/landing",
      "angularRoute": "/order/landing",
      "queryParam": {
        "type": "changePackage",
        "accountId": "{{accountId}}",
        "customerId": "{{customerId}}",
        "subscriberId": "{{subscriberId}}",
        "serviceNumber": "{{serviceNumber}}",
        "serviceType": "{{serviceType}}",
        "products": "[{}]",
        "routeScreen": "{{routeScreen}}"
      },
      // "pathParam": {
      //   "id": "{{customerId}}"
      // }
    },
    "changeServiceAddress": {
      // "url":  envConst.APP_CONTEXT+"/#/order/landing",
      "angularRoute": "/order/landing",
      "queryParam": {
        "type": "changeServiceAddress",
        "accountId": "{{accountId}}",
        "customerId": "{{customerId}}",
        "subscriberId": "{{subscriberId}}",
        "serviceNumber": "{{serviceNumber}}",
        "serviceType": "{{serviceType}}",
        "products": "[{}]",
        "routeScreen": "{{routeScreen}}"
      },
      // "pathParam": {
      //   "id": "{{customerId}}"
      // }
    },
    "addOrRemove": {
      // "url":  envConst.APP_CONTEXT+"/#/order/landing",
      "angularRoute": "/order/landing",
      "queryParam": {
        "type": "addOrRemove",
        "accountId": "{{accountId}}",
        "customerId": "{{customerId}}",
        "subscriberId": "{{subscriberId}}",
        "serviceNumber": "{{serviceNumber}}",
        "products": "{{products}}",
        "serviceType": "{{serviceType}}",
        "routeScreen": "{{routeScreen}}"
      }
      // "pathParam": {
      //   "id": "{{customerId}}"
      // }
    },
    "preToPost": {
      // "url":  envConst.APP_CONTEXT+"/#/order/landing",
      "angularRoute": "/order/landing",
      "queryParam": {
        "type": "preToPost",
        "accountId": "{{accountId}}",
        "customerId": "{{customerId}}",
        "subscriberId": "{{subscriberId}}",
        "serviceNumber": "{{serviceNumber}}",
        "products": "{{products}}",
        "serviceType": "{{serviceType}}",
        "routeScreen": "{{routeScreen}}"
      }
    },
    "newSubscription": {
      // "url":  envConst.APP_CONTEXT+"/#/order/landing",
      "angularRoute": "/order/landing",
      "queryParam": {
        "type": "newSubscription",
        "accountId": "{{accountId}}",
        "customerId": "{{customerId}}",
        "subscriberId": "{{subscriberId}}",
        "serviceNumber": "{{serviceNumber}}"
        // accountName: any;
        // service: any;
        // serviceNumber: any [];
        // serviceStatus: any
      }
    },


    "dashboard": {
      // "url":  envConst.APP_CONTEXT+"/#/contact/landing",
      "angularRoute": "/contact/landing",
      "queryParam": {
        "customerId": "{{customerId}}",
        "customerName": "{{customerName}}",
        "partyType": "{{partyType}}",
        "context": "dashboard"
      },
    },

    "existing": {
      "angularRoute": "/order/landing",
      "queryParam": {
        "type": "existing",
        "accountId": "{{accountId}}",
        "customerId": "{{customerId}}",
        "subscriberId": "{{subscriberId}}",
        "serviceType": "{{serviceType}}"
        // accountName: any;
        // service: any;
        // serviceNumber: any [];
        // serviceStatus: any
      }
    },
    "customer": {
      "angularRoute": "/contact/landing",
      "queryParam": {
        "customerId": "{{customerId}}",
        "customerName": "{{customerName}}",
        "context": "customer",
        "type": "{{type}}",
        "partyType": "{{partyType}}",
        "partyId": "{{partyId}}"
      }
    },

    "account": {
      "angularRoute": "/contact/landing",
      "queryParam": {
        "customerId": "{{customerId}}",
        "customerName": "{{customerName}}",
        "accountId": "{{accountId}}",
        "accountName": "{{accountName}}",
        "context": "account",
        "type": "{{type}}",
        "partyType": "{{partyType}}",
        "partyId": "{{partyId}}"
      }
    },

    "order": {
      "angularRoute": "/contact/landing",
      "queryParam": {
        "customerId": "{{customerId}}",
        "customerName": "{{customerName}}",
        "accountId": "{{accountId}}",
        "accountName": "{{accountName}}",
        "context": "order",
        "type": "{{type}}",
        "partyType": "{{partyType}}",
        "partyId": "{{partyId}}"
      }
    },

    "orderLineView": {
      "angularRoute": "/order-summary/orderLineView",
      "queryParam": {
        "orderId": "{{orderId}}",
        "status": "{{status}}",
        "createdBy": "{{createdBy}}",
        "createdDate": "{{createdDate}}",
        "orderType": "{{orderType}}"
      }
    },

    "customerPreviewCustomerId": {
      "angularRoute": "/customer/customerPreview",
      "queryParam": {
        "customerId": "{{customerId}}"
      }
    },
    "createopportunity": {
      "angularRoute": "/cpq/createopportunity",
      "queryParam": {
        "customerId": "{{customerId}}"
      }
    },
    "dashboardLandingCustomerId": {
      "angularRoute": "/dashboard/landing",
      "queryParam": {
        "customerId": "{{customerId}}",
        "routeScreen": "{{routeScreen}}",
        "selectedTab": "{{selectedTab}}"
      }
    },
    "orderLineViewCustomerId": {
      "angularRoute": "/order-summary/orderLineView",
      "queryParam": {
        "customerId": "{{customerId}}", 
        "routeScreen": "{{routeScreen}}",       
        "selectedTab": "{{selectedTab}}"
      }
    },    
    "viewWorkItem": {
      "url": "/wlistui/workList/popup/viewWorkItem.jsf",
      "queryParam": {
        "BusinessParam": "{{BusinessParam}}"
      },
      "openNewWindow": "true"
    },
  }
}


exports.consumerDashboardTabs = {
  "services": true,
  "household": true,
  "contacts": true,
  "accounts": true,
  "documents": true,
  "consents": true,
  "devices": true,
  "history": false,
  "socialFeed": false,
  "others": false
}

exports.subscriberHeader = [
  {
    "id": "subscription",
    "display": "Subscription",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": true,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": true,
    "expanded": false,
    "stickyColumn": true,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false,
    "lengthOfItemsToView": 2,
    "filterById": "packageName",
    "rowId": true
  },
  {
    "id": "serviceType",
    "display": "Service Type",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "list",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": true,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false,
    "filterById": "serviceType"
  },
  {
    "id": "primaryServiceIdentifiers",
    "display": "Subscription Identifier",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "nameValuePair",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false,
    "isViewAllPopUp": true,
    "lengthOfItemsToView": 1,
    "isPopUpExternal": false,
    "popUpExternalUrl": "https://st.hobs.tcs.com/frontoffice/#/dashboard/landing",
    "externalQueryParam": "customerID"
  },

  {
    "id": "status",
    "display": "Status",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "isFilterEnabled": true,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false,
    "lengthOfItemsToView": 30,
    "filterById": "subscriberstatus"
  },
  {
    "id": "userNameMap",
    "display": "User",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "listWithIcon",
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false
  },
  {
    "id": "userAddress",
    "display": "User Address",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": true,
    "isViewAllPopUp": false,
    "lengthOfItemsToView": 20,
  },
  {
    "id": "billingAccountMap",
    "display": "Billing Account",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "listWithIcon",
    "show": false,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false,
    "lengthOfItemsToView": 1
  },
  {
    "id": "payerName",
    "display": "Payer",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": false,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false
  },
  {
    "id": "payerAddress",
    "display": "Invoice Address",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": false,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false
  },
  // {
  //   "id": "activeSince",
  //   "display": "Active Since",
  //   "enableSort": false,
  //   "isExpandable": false,
  //   "isGroupBy": true,
  //   "isSelectable": false,
  //   "type": "value",
  //   "show": false,
  //   "isFilterEnabled": false,
  //   "expanded": false,
  //   "stickyColumn": false,
  //   "icon": null,
  //   "iconActionEnabled": false,
  //   "isMenuActionEnabled": false
  // },
  {
    "id": "action",
    "display": "Action",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "action",
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": true,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": true,
    "isViewAll": false
  }
];

exports.userHeader = [
  {
    "id": "username",
    "display": "User Name",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": true,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false
  },
  {
    "id": "userAddress",
    "display": "Address",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": true,
    "lengthOfItemsToView": 2
  },
  {
    "id": "serviceType",
    "display": "Service Type",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "list",
    "show": true,
    "isFilterEnabled": true,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "serviceType"
  },
  {
    "id": "status",
    "display": "Status",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "isFilterEnabled": true,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "subscriberstatus"
  },

  {
    "id": "packageName",
    "display": "Package",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": true,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "packageName"
  },
  {
    "id": "billingAccountMap",
    "display": "Billing Account",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "listWithIcon",
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false
  },
  {
    "id": "payerName",
    "display": "Payer",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": false,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false
  },
  {
    "id": "payerAddress",
    "display": "Invoice Address",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": false,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false
  },
  {
    "id": "invoiceMedia",
    "display": "Invoice Mode",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": false,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false
  },
  {
    "id": "invoiceReference",
    "display": "Invoice Ref.",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": false,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false
  },
  {
    "id": "action",
    "display": "Action",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "action",
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": true,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": true
  }
];

exports.subscriberHomeProductsHeader = [
  {
    "id": "productMap",
    "display": "Product",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "listWithIcon",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false,
    "lengthOfItemsToView": null,
    "filterById": null,
    "rowId": true
  },
  {
    "id": "activeSince",
    "display": "Active Since",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false,
    "filterById": null
  },
  {
    "id": "endDate",
    "display": "Ending On",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false,
    "isViewAllPopUp": false,
    "lengthOfItemsToView": null,
    "isPopUpExternal": false,
  },
  {
    "id": "monthlyCharge",
    "display": 'Monthly',
    "headerIcon": '',
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false,
    "lengthOfItemsToView": null,
    "filterById": null
  },
  {
    "id": "oneTimeCharge",
    "display": 'One Time',
    "headerIcon": '',
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "isViewAll": false
  },

];

exports.subscriberProfileTabs = {
  "home": true,
  "products": true,
  "pendingOrders": true,
  "history": true,
  "relatedSubscriptions": true
}

exports.cardKpiList = [
  {
    "cardId": "orders",
    "label": "Orders",
    "labelIcon": "list_alt",
    "value": "0",
    "valueClassifier": "Pending",
    "isClickable": true,
    "uri": "No",
    "labelStyleClass": "text-lg",
    "labelIconStyleClass": "secondary-text font-size-30 mr-4 s-28",
    "valueStyleClass": "text-gray-700 text-lg font-semibold",
    "valueClassifierStyleClass": "secondary-text",
    "enableCard": true
  },
  {
    "cardId": "users",
    "label": "Users",
    "labelIcon": "people",
    "value": 1,
    "valueClassifier": "Total",
    "isClickable": true,
    "uri": "No",
    "labelStyleClass": "text-lg",
    "labelIconStyleClass": "secondary-text font-size-30  s-28",
    "valueStyleClass": "text-gray-700 text-lg font-semibold",
    "valueClassifierStyleClass": "secondary-text",
    "isRefresh": true,
    "enableCard": true
  },
  {
    "cardId": "serviceGroups",
    "label": "Service Groups",
    "labelIcon": "group_work",
    "value": "3",
    "valueClassifier": "Total",
    "isClickable": true,
    "uri": "No",
    "labelStyleClass": "text-lg",
    "labelIconStyleClass": "secondary-text font-size-30  s-28",
    "valueStyleClass": "text-gray-700 text-lg font-semibold",
    "valueClassifierStyleClass": "secondary-text",
    "isRefresh": true,
    "enableCard": true
  },
  {
    "cardId": "subscriptions",
    "label": "Subscriptions",
    "labelIcon": "settings_ethernet",
    "value": "5",
    "isClickable": true,
    "uri": "No",
    "labelStyleClass": " text-lg",
    "labelIconStyleClass": "secondary-text font-size-30  s-28",
    "valueStyleClass": "text-gray-700 text-lg font-semibold",
    "valueClassifierStyleClass": "secondary-text",
    "isRefresh": true,
    "enableCard": true
  },
  {
    "cardId": "payers",
    "label": "Payers",
    "labelIcon": "account_balance",
    "value": "1",
    "valueClassifier": "Total",
    "isClickable": true,
    "uri": "No",
    "labelStyleClass": "text-lg",
    "labelIconStyleClass": "secondary-text font-size-30  s-28",
    "valueStyleClass": "text-gray-700 text-lg font-semibold",
    "valueClassifierStyleClass": "secondary-text",
    "isRefresh": true,
    "enableCard": true
  }
]

exports.orderHeader = [
  {
    "id": "id",
    "display": "Order ID",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": true,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "id"
  },
  {
    "id": "orderType",
    "display": "Order Type",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": true,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": true,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "orderType"
  },
  {
    "id": "statusObj",
    "display": "Order Status",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "chip",
    "visibleAlways": true,
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "status"
  },
  {
    "id": "requestedDate",
    "display": "Due Date",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false
  },
  {
    "id": "createdDate",
    "display": "Created Date",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "visibleAlways": true,
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "createdDate"
  },
  {
    "id": "createdBy",
    "display": "Created By",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "visibleAlways": true,
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "createdBy"
  },
  {
    "id": "mode",
    "display": "Origin",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "visibleAlways": true,
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "mode"
  },
  {
    "id": "channel",
    "display": "Channel",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "visibleAlways": true,
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "channel"
  },
  {
    "id": "action",
    "display": "Action",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "action",
    "show": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": true,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": true,
    "isViewAll": false
  }
];

// exports.orderStatusHeader = [
//   {
//     "id": "IN_PROGRESS",
//     "display": "IN PROGRESS",
//     "className": "indigo-600"
//   },
//   {
//     "id": "NEW",
//     "display": "NEW",
//     "className": "blue-500"
//   },
//   {
//     "id": "PENDING",
//     "display": "PENDING",
//     "className": "yellow-500"
//   },
//   {
//     "id": "COMPLETED",
//     "display": "COMPLETED",
//     "className": "green-500"
//   },
//   {
//     "id": "ERROR",
//     "display": "ERROR",
//     "className": "orange-500"
//   },
//   {
//     "id": "CANCELLED",
//     "display": "CANCELLED",
//     "className": "red-500"
//   },
//   {
//     "id": "SUBMITTED",
//     "display": "SUBMITTED",
//     "className": "green-500"
//   }
// ]

exports.orderLineTabs = {
  "orderDetails": true,
  "orderStatus": true,
  "preRequisites": true,
  "documents": true,
  "notes": true
}

// exports.stepperJsonForChangePayer=
// [
//   {
//   "id": "MoveAllSubs",
//   "label": "Move All Subscriptions in Payer",
//   "externalUrl": "/customer/capturecustomer",
//   "appComponent": "ComponentName",
//   "currentStep": "false"
//   },
//   {
//   "id": "targetPayer",
//   "label": "All Subscription from Payer",
//   "externalUrl": "/customer/capturecustomer",
//   "appComponent": "ComponentName",
//   "currentStep": "false"
//   },
//   {
//   "id": "orderreview",
//   "label": "Order Review",
//   "externalUrl": "/customer/capturecustomer",
//   "appComponent": "ComponentName",
//   "currentStep": "false"
//   }
//   ]

exports.headerListChangePayer = [

 
  {
    "id": "accountName",
    "display": "Account Name",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": true,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": true,
    "isViewAll": false,
    "lengthOfItemsToView": null,
    "filterById": "accountName",
    "iconList": null,
    "isPopUpExternal": false,
    "popUpExternalUrl": null,
    "externalPathParam": null,
    "externalQueryParam": null,
    "headerIcon": null,
    "isViewAllPopUp": false,
    "radioButtonEnabled" :true
  },
  {
    "id": "payerAddress",
    "display": "Payer Address",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": true,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": true,
    "isViewAll": false,
    "lengthOfItemsToView": null,
    "filterById": "",
    "iconList": null,
    "isPopUpExternal": false,
    "popUpExternalUrl": null,
    "externalPathParam": null,
    "externalQueryParam": null,
    "headerIcon": null,
    "isViewAllPopUp": false,
    "radioButtonEnabled" :false

  },
  {

    "id": "accountID",
    "display": "Accound ID",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": true,
    "expanded": false,
    "stickyColumn": false,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": true,
    "isViewAll": false,
    "lengthOfItemsToView": null,
    "filterById": "accountID",
    "iconList": null,
    "isPopUpExternal": false,
    "popUpExternalUrl": null,
    "externalPathParam": null,
    "externalQueryParam": null,
    "headerIcon": null,
    "isViewAllPopUp": false,
    "radioButtonEnabled":false
  }
  // {
  //   "id": "Action",
  //   "display": "Action",
  //   "enableSort": false,
  //   "isExpandable": false,
  //   "isGroupBy": false,
  //   "isSelectable": false,
  //   "type": "action",
  //   "show": true,
  //   "visibleAlways": true,
  //   "isFilterEnabled": true,
  //  "expanded": false,
  //   "stickyColumn": false,
  //   "icon": null,
  //   "iconActionEnabled": false,
  //   "isMenuActionEnabled": true,
  //   "isViewAll": false,
  //   "lengthOfItemsToView": null,
  //   "filterById": "accountName",
  //   "iconList": null,
  //   "isPopUpExternal": false,
  //   "popUpExternalUrl": null,
  //   "externalPathParam": null,
  //   "externalQueryParam": null,
  //   "headerIcon": null,
  //   "isViewAllPopUp": false,
  // }
]

exports.subscriberProductsTabHeader = {
  "additionalHeader": [
    {
      "id": "productName",
      "display": "Discount",
      "showTags": false,
      "class": "font-weight-bold",
      "flex": 25,
      "style": "flex: 0 1 44% !important",
      "type": "obj"
    },
    {
      "id": "activeSince",
      "display": "Active since",
      "flex": 25,
      "style": "flex: 0 1 13% !important",
      "type": "value"
    },
    {
      "id": "endDate",
      "display": "Ending on",
      "flex": 25,
      "style": "flex: 0 1 13% !important",
      "type": "value"
    },
    {
      "id": "monthlyCharge",
      "display": "Monthly charge",
      "flex": 25,
      "style": "flex: 0 1 13% !important",
      "type": "value",
      "headerIcon": true
    },
    {
      "id": "oneTimeCharge",
      "display": "One time charge",
      "flex": 25,
      "style": "flex: 0 1 17% !important",
      "type": "value",
      "headerIcon": true
    }
  ],
  "header": [
    {
      "id": "productName",
      "display": "Product",
      "showTags": true,
      "class": "font-weight-bold",
      "flex": 25,
      "style": "flex: 0 1 44% !important",
      "type": "obj"
    },
    {
      "id": "activeSince",
      "display": "Active since",
      "flex": 25,
      "style": "flex: 0 1 13% !important",
      "type": "value"
    },
    {
      "id": "endDate",
      "display": "Ending on",
      "flex": 25,
      "style": "flex: 0 1 13% !important",
      "type": "value"
    },
    {
      "id": "monthlyCharge",
      "display": "Monthly charge",
      "flex": 25,
      "style": "flex: 0 1 13% !important",
      "type": "value",
      "headerIcon": true,
      "disableForProductType": ["Discount", "DISCOUNT"]
    },
    {
      "id": "oneTimeCharge",
      "display": "One time charge",
      "flex": 25,
      "style": "flex: 0 1 17% !important",
      "type": "value",
      "headerIcon": true,
      "disableForProductType": ["Discount", "DISCOUNT"]
    }
  ]
}
//need to include in admin app
exports.changePayerTableSettings = {
  "limit": "100",
  "responsive": false,
  "isShowHideColumnEnabled": false,
  "isExportToExcelEnabled": false,
  "filterByAPI": true,
  "isGenericFilterEnabled": true,
  // "isExpandAllRowsEnabled": true,
  "isFilterEnabled": true,
  // "isBulkActionsEnabled": true,
  "isExportAllToExcelEnabled": false,
  // "isSearchFilterEnabled": true,
  // "isGroupByEnabled": true,
  // "exportToExcelViaAPI": true
}

//need to include in admin app
exports.payerListHeader = [
  {
    "id": "payerName",
    "display": "Payer Name",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": true,
    "expanded": false,
    "stickyColumn": true,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "payerName",
    "colStyle": "flex: 0 0 33.33%",
    "radioButtonEnabled": true,
    "rowId": true
  },
  {
    "id": "payerAddress",
    "display": "Payer Address",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": true,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "",
    "colStyle": "flex: 0 0 33.33%"
  },
  {
    "id": "accountID",
    "display": "Billing Account ID",
    "enableSort": false,
    "isExpandable": false,
    "isGroupBy": false,
    "isSelectable": false,
    "type": "value",
    "show": true,
    "visibleAlways": true,
    "isFilterEnabled": false,
    "expanded": false,
    "stickyColumn": true,
    "icon": null,
    "iconActionEnabled": false,
    "isMenuActionEnabled": false,
    "filterById": "",
    "colStyle": "flex: 0 0 33.33%"
  },

]

exports.changeOwnerSubscriptionsHeader =[
  {
      "key": "accountName",
      "title": "Name",
      "label": "Name",
      "required": false,
      "order": 1,
      "controlType": "labelvalueVertical",
      "type": "",
      "enum": [],
      "childenum": [],
      "lookupExternal": false,
      "hasChildLookup": false,
      "isExternalValidation": false,
      "externalValues": {},
      "childProperty": "",
      "validationURL": "",
      "childPropertyDataAPIURL": "",
      "validators": {
          "pattern": "",
          "required": false
      },
      "error": {
          "pattern": "",
          "required": ""
      },
      "externalAPIPayload": {},
      "value": "Org AN"
  },
  {
      "key": "customerId",
      "title": "Customer ID",
      "label": "Customer ID",
      "required": false,
      "order": 1,
      "controlType": "labelvalueVertical",
      "type": "",
      "enum": [],
      "childenum": [],
      "lookupExternal": false,
      "hasChildLookup": false,
      "isExternalValidation": false,
      "externalValues": {},
      "childProperty": "",
      "validationURL": "",
      "childPropertyDataAPIURL": "",
      "validators": {
          "pattern": "",
          "required": false
      },
      "error": {
          "pattern": "",
          "required": ""
      },
      "externalAPIPayload": {},
      "value": "C12345678"
  },
  {
      "key": "payerAddress",
      "title": "Address",
      "label": "Address",
      "required": false,
      "order": 1,
      "controlType": "labelvalueVertical",
      "type": "",
      "enum": [],
      "childenum": [],
      "lookupExternal": false,
      "hasChildLookup": false,
      "isExternalValidation": false,
      "externalValues": {},
      "childProperty": "",
      "validationURL": "",
      "childPropertyDataAPIURL": "",
      "validators": {
          "pattern": "",
          "required": false
      },
      "error": {
          "pattern": "",
          "required": ""
      },
      "externalAPIPayload": {},
      "value": "Tata Consultancy Services Limited, Tidel Park,Taramani,Chennai - 600113"
  },
  {
    "key": "agreementExists",
    "title": "Agreement exists",
    "label": "Agreement exists",
    "required": false,
    "order": 1,
    "controlType": "labelvalueVertical",
    "type": "",
    "enum": [],
    "childenum": [],
    "lookupExternal": false,
    "hasChildLookup": false,
    "isExternalValidation": false,
    "externalValues": {},
    "childProperty": "",
    "validationURL": "",
    "childPropertyDataAPIURL": "",
    "validators": {
        "pattern": "",
        "required": false
    },
    "error": {
        "pattern": "",
        "required": ""
    },
    "externalAPIPayload": {},
    "value": "AG1234567"
},
{
  "key": "validExistingOwner",
  "title": "Valid",
  "label": "Valid",
  "required": false,
  "order": 1,
  "controlType": "labelvalueVertical",
  "type": "",
  "enum": [],
  "childenum": [],
  "lookupExternal": false,
  "hasChildLookup": false,
  "isExternalValidation": false,
  "externalValues": {},
  "childProperty": "",
  "validationURL": "",
  "childPropertyDataAPIURL": "",
  "validators": {
      "pattern": "",
      "required": false
  },
  "error": {
      "pattern": "",
      "required": ""
  },
  "externalAPIPayload": {},
  "value": "until 30 Sep, 2022"
}
];