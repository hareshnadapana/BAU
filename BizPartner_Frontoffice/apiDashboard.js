var winston = require('./winston');
var express = require('express');
var router = express.Router();
const mock = require('./mockResp.js');
const axios = require('axios');
var app = express();
var user = { cas_user: null, cas_user_info: {} };
const envConst = require('./envConst.js');
const https = require('https');
const formdata = require('./dashboardforms.js');
const { ConsoleReporter } = require('jasmine');
var subscriberApp_services = require(envConst.HOOK_SUBS_APP);
var orderProfile_services = require(envConst.HOOK_ORD_PROFILE_APP);
var dashboard_services = require(envConst.HOOK_DASHBOARD_APP);
app.set('apiPrefix', 'https://' + envConst.API_PREFIX);
app.set('envLogServicePrefix', 'https://' + envConst.HOST + ':' + envConst.PORT);
app.set('envDevelopmentMode', envConst.ENV_DEVELOPMENT_MODE);
app.set('envLogLevel', envConst.ENV_LOGLEVEL);

const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});
axiosInstance.interceptors.request.use(request => {
    console.log('AXIOS >> request >', request.method, request.url, request.data);
    return request;
});
axiosInstance.interceptors.response.use(response => {
    console.log('AXIOS >> response >', response.status, response.config.url);
    return response;
});
axiosInstance.interceptors.request.use((config) => {
    config.headers['request-startTime'] = process.hrtime()
    return config
});


var appendQueryParams = function (url) {
    const fullParam = '?login=' + user.cas_user +
        '&opId=' + user.cas_user_info.opId +
        '&buId=' + user.cas_user_info.buId +
        '&language=' + user.cas_user_info.language;
    return url + fullParam;
};

const debug = true;
const printResponse = false;
const printRequest = false;

function printlog(...args) {
    if (debug) {
        console.log(...args);
    }
}

// let options = {
//     headers: {
//         'Content-Type': 'application/json',
//         'opID': 'HOB',
//         'buID': 'DEFAULT',
//         'userID': 'fo_user',
//         'Authorization': 'Basic Zm9fdXNlcjpmb191c2Vy',
//         'lang': 'ENG'
//     }
// };

function handleServiceErros(error, res) {
    // printlog('ERROR in calling service : ', response.config.url);
    if (error.response) {
        // Request made and server responded
        printlog(error);
        printlog(error.response.status);
        printlog(error.response.headers);
        res.json(error.response.data);
    } else if (error.request) {
        // The request was made but no response was received
        printlog(error.request);
        res.json(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        printlog('Error', error.message);
        res.json(error.message);
    }
    //res.json(error);  
};



function getToken(user, req, res) {
    //console.log("getToken---dashboard-->", req.session);
    axios
        .all([
            axiosInstance.get(
                app.get("apiPrefix") +
                "/tibchassisrestservice/rest/uimetadataservice/controlparams/COMMON/FO~CRMS~UUIS?opId=" +
                user.cas_user_info.opId +
                "&buId=" +
                user.cas_user_info.buId +
                "&language=" +
                user.cas_user_info.language
            ),
        ])
        .then(
            axios.spread((themeResp) => {
                //  console.log("themeResp-dashboard-", themeResp.data);
                user.cas_user_info.authorization = themeResp.data;
                //console.log("user-ccc-", user);
                let options = {
                    headers: {
                        "Content-Type": "application/json",
                        opID: user.cas_user_info.opId,
                        buID: user.cas_user_info.buId,
                        userID: user.cas_user,
                        Authorization: "Basic " + themeResp.data,
                        lang: user.cas_user_info.language,
                    },
                };
                req.session.options = {}
                req.session.options = options;
                req.session.save();
                console.log("options-setting in dashboard session-", req.session.options);
                res.json(user);
            })
        )
        .catch((error) => { console.error("error here --->", error) });
}

router.get("/dashboard/user", (req, res) => {
    //printlog('EXPRESS : /user start');
    if (mock.isMock) {
        res.json(mock.user);
    }
    let sessionUser = "";
    console.log("/api/user-dashboard-");
    sessionUser = "wolve_test";
    axios
        .all([
            axiosInstance.post(
                app.get("apiPrefix") + "/ssorest/rest/ssoservice/userById",
                sessionUser,
                { headers: { "Content-Type": envConst.CONTENT_TYPE_USER } }
            ),
            axiosInstance.post(
                app.get("apiPrefix") + "/ssorest/rest/ssoservice/getRoleForUser",
                sessionUser,
                { headers: { "Content-Type": envConst.CONTENT_TYPE_USER } }
            ),
        ])
        .then(
            axios.spread((userInfo, userRole) => {
                user.cas_user = userInfo.data.ssoUser.login;
                user.cas_user_info = {
                    fullName:
                        userInfo.data.ssoUser.firstName +
                        " " +
                        userInfo.data.ssoUser.lastName,
                    shortName:
                        userInfo.data.ssoUser.firstName[0].toUpperCase() +
                        userInfo.data.ssoUser.lastName[0].toUpperCase(),
                    opId: userInfo.data.ssoUser.opId,
                    buId: userInfo.data.ssoUser.buId,
                    language: userInfo.data.ssoUser.languageCd,
                    roles: [],
                    groupId: ''
                };
                axios.all([axiosInstance.get(app.get('apiPrefix') + '/ssorest/rest/ssoservice/user/' + user.cas_user + '/groups?opId=' + user.cas_user_info.opId + '&buId=' + user.cas_user_info.buId + '&language=' + user.cas_user_info.language)]).then(axios.spread((userGroupInfo) => {
                    if (JSON.parse(userGroupInfo.data)[0]) {
                        user.cas_user_info.groupId = JSON.parse(userGroupInfo.data)[0].groupId;
                    }
                    // getToken(user, req, res);
                    console.log("req.option--->", req.session);
                    for (const role of userRole.data) {
                        user.cas_user_info.roles.push(role.roleName);
                    }
                    user.cas_user_info.roles = user.cas_user_info.roles.filter(function (
                        item,
                        pos,
                        self
                    ) {
                        return self.indexOf(item) == pos;
                    });
                    user.cas_user_info.roles.sort();
                    //printlog('EXPRESS : /user userInfo', userInfo.data);
                    //printlog('EXPRESS : /user end');
                    getToken(user, req, res);
                    //res.json(user);
                })).catch((error) => { console.error("error here --->", error) });
            })
        ).catch((error) => { console.error("error here --->", error) });
});


router.get('/getAppUrl', (req, res) => {
    console.log('EXPRESS REQUEST TO getAppUrl: ',);
    res.json(formdata.apiEndPoint);

});
router.get('/getCardList', (req, res) => {
    console.log('EXPRESS REQUEST TO getCardList: ',);
    if (mock.isMock)
        res.json(formdata.cardKpiList);
    else {
        console.log('EXPRESS REQUEST TO getCardList: else ',);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'ent.dash.card.list', req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp);
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.get('/getExternalUrl', (req, res) => {
    console.log('EXPRESS REQUEST TO getExternalUrl: ',);
    if (mock.isMock)
        res.json(formdata.externalRouteUrl);
    else {
        console.log('EXPRESS REQUEST TO getExternalUrl: else ',);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'app.frontoffice.externalRouteUrl', req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("app.frontoffice.externalRouteUrl::::", themeResp);
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getTabsConfig', (req, res) => {
    console.log('EXPRESS REQUEST TO Tabs config: ', req.body, req.session.options);
    if (mock.isMock) {
        if (req.body.formId == 'cd.tabs.config') {
            res.json(formdata.consumerDashboardTabs);
        } else if (req.body.formId == 'subscriberProfile.tabs.config') {
            res.json(formdata.subscriberProfileTabs);
        }
        else if (req.body.formId == 'orderLine.tabs.config') {
            res.json(formdata.orderLineTabs);
        }

    } else {
        console.log("Tabs req body:::", req.body)
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + req.body.formId, req.session.options)
        ]).then(axios.spread((themeResp) => {
           // console.log("themeResp::::", themeResp.data);
            res.json(themeResp.data.responseObject);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }

});

router.post('/getContactPartyRole', (req, res) => {
    console.log("Api getContactPartyRole:: ", req.body);
    if (mock.isMock) {
        res.json(mock.getContactPartyRole)
    } else {
        const param = req.body;
        const urlString = req.body.generalSearch;
        // let baseUrl =  '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/'+'?activeContact='+param.activeContact+'&fields='+param.fields;
        let baseUrl = '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/v2' + '?activeContact=' + encodeURIComponent(param.activeContact) + '&fields=' + encodeURIComponent('associatedEntityID=') + encodeURIComponent(param.associatedEntityID) + encodeURIComponent('&') + 'partyRoleTypeID=' + encodeURIComponent(param.partyRoleTypeID);
        console.log("Base Url :: ", baseUrl)
        req.session.options.headers.domainID = "CSA";
        console.log("req.session.options Url :: ", req.session.options)
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + baseUrl, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/getCLV', (req, res) => {
    console.log('EXPRESS REQUEST TO getCLV: ', req._parsedUrl.pathname, req.body.searchClvValue);
    //console.log('EXPRESS REQUEST TO getCLV  req: ', req);
    // const param = req.body.id;
    const param = req.body.searchClvValue;
    console.log('EXPRESS REQUEST TO getCLV PARAM: ', param);

    if (mock.isMock) {
        res.json(mock.getCLV);
    } else {
        res.json(mock.getCLV);
        // axios.all([
        //   axiosInstance.get(app.get('apiPrefix') + '/HOBSAnalytics/dataservice/getCLV' + '?partynbr=' + param,
        //     req.session.options
        //   )
        // ]).then(axios.spread((themeResp) => {
        //   res.json(themeResp.data);
        // })).catch(error => {
        //   handleServiceErros(error, res);
        // });
    }
});

router.post('/customer', (req, res) => {
    console.log('EXPRESS REQUEST TO getCustomerDetails: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO getCustomerDetails PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.party);
    }
    axios.all([
        axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/details', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
        res.json(themeResp.data);
    })).catch(error => {
        handleServiceErros(error, res);
    });
});

router.post('/findCustomer', (req, res) => {
    if (mock.isMock) {
        res.json(mock.findPartyDetails)
    } else {
        // //Wolverine Changes
        // delete req.body.from;
        const customerid = req.body.searchFilters.customerId;
        delete req.body.searchFilters.customerId;
        // delete req.body.searchFilters.customerName;
        // delete req.body.searchFilters.size;
        req.body.searchFilters.customerid = customerid; 
        // //changes end here
        const param = req.body;
        console.log("param serverdev findcustomer:::", param);
        // res.json(mock.customerPartyDetails);
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/findCustomer', param
                , req.session.options)
        ]).then(axios.spread((themeResp) => {
            // console.log("themeResp::::", themeResp);
            //printlog(themeResp.data);
            const filterData = themeResp.data.responseObject.customerSummary.filter(element => !element.mapOfAccounts && !element.mapOfSubscribers);
            themeResp.data.responseObject.customerSummary = filterData;
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


// router.post('/customer', (req, res) => {
//     console.log('EXPRESS REQUEST TO getCustomerDetails: ', req._parsedUrl.pathname, req.body);
//     const param = req.body;
//     console.log('EXPRESS REQUEST TO getCustomerDetails PARAM: ', param,req.session.options);
//     if (mock.isMock) {
//         res.json(mock.party);
//     }
//     let request={};
//     request['size']="1";
//     request['from']=param['from'];
//     request['searchFilters']={};
//     request['searchFilters']['customerid']=param['searchFilters']['customerid'];
//     request['searchFilters']['contact.contacttype']="PRIMARY";
//     console.log("req----->",request);
//     axios.all([
//         axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/details', request, req.session.options)
//     ]).then(axios.spread((themeResp) => {
//         res.json(themeResp.data);
//     })).catch(error => {
//         handleServiceErros(error, res);
//     });
// });

router.post('/listOfAccountByCustomer', (req, res) => {
    console.log('EXPRESS REQUEST TO listOfAccountByCustomer: ', req.body);
    const param = req.body.id.customerid;
    const from = req.body.id.from;
    const size = req.body.id.size;
    console.log('EXPRESS REQUEST TO listOfAccountByCustomer PARAM: ', param);
    if (mock.isMock) {
        res.json(mock.payerDetails);
    }
    else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices//customer/getAccountDetailsByCustomer' + '?from=' + from + '&size=' + size + '&customerId=' + param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

// router.post('/customer', (req, res) => {
//   console.log('EXPRESS REQUEST TO customer: ', req._parsedUrl.pathname, req.body);
//   const param = req.body;
//   console.log('EXPRESS REQUEST TO customer PARAM: ',param);
//   if(mock.isMock){
//     res.json(mock.customer);  
//   }
//   axios.all([
//     //axiosInstance.get(app.get('apiPrefix')+'/hobsrestgateway/crmservices/customer/details'+param
//      //)
//   ]).then(axios.spread((themeResp) => {
//     res.json(themeResp.data);
//   }));
// });


router.post('/serviceDetails', (req, res) => {
    console.log('EXPRESS REQUEST TO serviceDetails: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO serviceDetails PARAM: ', param, req.session.options);
    //if (mock.isMock) {
    res.json(mock.serviceDetails);
    //}
    // axios.all([
    //   // axiosInstance.get(app.get('apiPrefix')+'/hobsrestgateway/crmservices/customer/details'+param
    //   //  )
    // ]).then(axios.spread((themeResp) => {
    //   res.json(themeResp.data);
    // })).catch(error => {
    //   handleServiceErros(error, res);
    // });
});

router.post('/getcustomerCommunication', (req, res) => {
    console.log('EXPRESS REQUEST TO getcustomerCommunication: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO getcustomerCommunication PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.getCustomerCommunication);
    } else {
        res.json(mock.getCustomerCommunication);
        // axios.all([
        //   // axiosInstance.get(app.get('apiPrefix')+'/hobsrestgateway/crmservices/customer/details'+param
        //   //  )
        // ]).then(axios.spread((themeResp) => {
        //   res.json(themeResp.data);
        // })).catch(error => {
        //   handleServiceErros(error, res);
        // });
    }
});

router.post('/billingDetails', (req, res) => {
    console.log('EXPRESS REQUEST TO billingDetails: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO billingDetails PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.billingDetails);
    }
    axios.all([
        //axiosInstance.get(app.get('apiPrefix')+'/hobsrestgateway/crmservices/customer/details'+param
        //)
    ]).then(axios.spread((themeResp) => {
        res.json(themeResp.data);
    })).catch(error => {
        handleServiceErros(error, res);
    });
});

router.post('/getInteractions', (req, res) => {
    console.log('EXPRESS REQUEST TO getInteractions: ', req._parsedUrl.pathname, req.body);

    const param1 = req.body.searchValue;
    const param2 = req.body.pageSize;
    // const param = 'C38282341';
    // const param = 'C39111327'
    console.log('EXPRESS REQUEST TO getInteractions PARAM: ', param1, param2, req.session.options);
    console.log("this is URL:", app.get('apiPrefix') + '/HOBSAnalytics/dataservice/getInteractions' + '?customerId=' + param1 + '&pagination=true&pageSize=' + param2)
    if (mock.isMock) {
        res.json(mock.getInteractions);
    }
    axios.all([

        axiosInstance.get(app.get('apiPrefix') + '/HOBSAnalytics/dataservice/getInteractions' + '?customerId=' + param1 + '&pagination=true&pageSize=' + param2)
    ]).then(axios.spread((themeResp) => {
        res.json(themeResp.data);
    })).catch(error => {
        handleServiceErros(error, res);
    });
});

router.post('/addInteraction', (req, res) => {
    const param = req.body
    console.log("ADDINTERACTION working");
    console.log("request: ", param);

    if (mock.isMock) {
        res.json(mock.getInteractions);
    }

    axios.all([
        axiosInstance.post(app.get('apiPrefix') + '/HOBSAnalytics/dataservice/insertInteraction', param.data, req.session.options)
    ]).then(axios.spread((themeResp) => {
        res.json(themeResp.data);
    })).catch(error => {
        handleServiceErros(error, res);
    });
});

router.post('/getbalance', (req, res) => {
    console.log('EXPRESS REQUEST TO getbalance: ', req._parsedUrl.pathname, req.body);
    const param = req.body.id;
    console.log('EXPRESS REQUEST TO getbalance PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.getbalance);
    }
    axios.all([
        axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/pathidentifyservice/getbalance' + '?userId=' + param + '&userIdType=Subscriber_ID')
    ]).then(axios.spread((themeResp) => {
        res.json(themeResp.data);
    })).catch(error => {
        handleServiceErros(error, res);
    });
});

router.post('/getDocumentList', (req, res) => {
    console.log("get Document List API :: ");
    if (mock.isMock) {
        res.json(mock.getDocumentList)
        // const param = req.body;
        // console.log("param serverdev::: get Document", param);
        // console.log("param serverdev::: get Document", req.body);

        // axios.all([
        //   axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/getcustomerdocuments//tibcustomerdocuments/fetch/current', param
        //     , req.session.options)
        // ]).then(axios.spread((themeResp) => {
        //   console.log("themeResp::::", themeResp);
        //   //printlog(themeResp.data);
        //   res.json(themeResp.data);
        // })).catch(error => {
        //   handleServiceErros(error, res);
        // });
    } else {
        const param = req.body;
        console.log("param serverdev::: get document", param);

        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/getcustomerdocuments//tibcustomerdocuments/fetch/current', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            // console.log("themeResp::::", themeResp);
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/deleteDocument', (req, res) => {
    console.log("deleteDocument API :: ");
    if (mock.isMock) {
        res.json(mock.deleteDocument)

    } else {
        const param = req.body;
        console.log("param serverdev::: get document", param);
        let option = req.session.options
        axiosInstance.delete(app.get('apiPrefix') + '/hobsrestgateway/customerdocuments/tibcustomerdocuments/delete', {
            option,
            data: param
        }).then(resp => {
            console.log("themeResp::::", resp.data);
            //printlog(themeResp.data);
            res.json(resp.data);
        });

    }
});

router.post('/dashboard/partyEnabled', (req, res) => {
    console.log("Api partyEnabled::dashboard ", req.body);
    if (mock.isMock) {
        res.json(mock.partyEnabled)
    } else {
        const param = req.body;
        const urlString = req.body.generalSearch;
        // let baseUrl =  '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/'+'?activeContact='+param.activeContact+'&fields='+param.fields;
        let baseUrl = '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/all'
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/updatePartyEnabled', (req, res) => {
    console.log("updatePartyEnabled API :: ");
    if (mock.isMock) {
        // res.json(mock.updateParty)
        console.log("HI MAN IN THE APIDASHBOARD.JS");
    } else {
        const param = req.body;
        console.log("param serverdev::: delete PartyEnabled", param);
        // app.get('apiPrefix') + '/hobsrestgateway/customerdocuments/tibcustomerdocuments/delete/'
        // https://172.16.177.67/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/update/
        axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/update/' + param.id,
            JSON.stringify(param),
            req.session.options).then(resp => {
                console.log("themeResp::::", resp.data);
                //printlog(themeResp.data);
                res.json(resp.data);
            });
    }
});

router.post('/deletePartyEnabled', (req, res) => {
    console.log("deletePartyEnabled API :: ");
    if (mock.isMock) {
        // res.json(mock.deleteParty)
        console.log("HI MAN IN THE APIDASHBOARD.JS");
    } else {
        const param = req.body;
        console.log("param serverdev::: delete PartyEnabled", param);

        axiosInstance.delete(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/' + param.id, req.session.options).then(resp => {
            console.log("themeResp::::", resp.data);
            //printlog(themeResp.data);
            res.json(resp.data);
        });
    }
});


router.post('/enterpriseServiceDetails', (req, res) => {
    console.log('EXPRESS REQUEST TO enterpriseServiceDetails: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO enterpriseServiceDetails PARAM: ', param, req.session.options);
    //if (mock.isMock) {
    res.json(mock.enterpriseService);
    //}
    // axios.all([
    //   // axiosInstance.get(app.get('apiPrefix')+'/hobsrestgateway/crmservices/customer/details'+param
    //   //  )
    // ]).then(axios.spread((themeResp) => {
    //   res.json(themeResp.data);
    // })).catch(error => {
    //   handleServiceErros(error, res);
    // });
});

router.post('/subscriberServiceDetails', (req, res) => {
    console.log("Api subscriberServiceDetails:: ", req.body);
    if (mock.isMock) {
        res.json(mock.userDetails)
    } else {
        const param = req.body;
        const urlString = req.body.generalSearch;
        // let baseUrl =  '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/'+'?activeContact='+param.activeContact+'&fields='+param.fields;
        let baseUrl = '/hobsrestgateway/crmservices/subscriber/subscriberDetails/fetch'
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getUserCount', (req, res) => {
    console.log("Api getUserCount:: ", req.body);
    if (mock.isMock) {
        res.json(mock.getUserCount)
    } else {
        const param = req.body;
        // let baseUrl =  '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/'+'?activeContact='+param.activeContact+'&fields='+param.fields;
        let baseUrl = '/hobsrestgateway/crmservices/customer/search/countOfFilterCriteria'
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/generateOTP', (req, res) => {
    console.log('EXPRESS REQUEST TO generateOTP: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO generateOTP PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.generateOTP);
    } else {
        //  res.json(mock.generateOTP);
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/otpgeneratorservices/otp/create', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/validateOTP', (req, res) => {
    console.log('EXPRESS REQUEST TO validateOTP: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO validateOTP PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.validateOTP);
    } else {
        //  res.json(mock.validateOTP);
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/otpgeneratorservices/otp/validate', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/consentDetails', (req, res) => {
    console.log('EXPRESS REQUEST TO consentDetails: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO consentDetails PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.consentDetails);
    } else {
        res.json(mock.consentDetails);
        // axios.all([
        //   axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/consentmanagementdal/consentprofile/dal/listForKey/CUSTOMER/CUSTOMER/'+param.customerId
        //     , req.session.options)
        // ]).then(axios.spread((themeResp) => {
        //   res.json(themeResp.data);
        // })).catch(error => {
        //   handleServiceErros(error, res);
        // });
    }
});

router.post('/updateConsentDetails', (req, res) => {
    console.log('EXPRESS REQUEST TO updateConsentDetails: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO updateConsentDetails PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.updateConsentDetails);
    } else {
        // res.json(mock.updateConsentDetails);
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/consentmanagementdal/consent/dal/details/update', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/subscriberService', (req, res) => {
    console.log('EXPRESS REQUEST TO subscriberService: ', req._parsedUrl.pathname, req.body);
    const param = req.body.id;
    console.log('EXPRESS REQUEST TO subscriberService PARAM: ', param);
    if (mock.isMock) {
        res.json(mock.subscriberSrvc);
    }
    else {
        // res.json(mock.subscriberSrvc);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/HOBSAnalytics/dataservice/getServiceDetails' + '?customerId=' + param)
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/subscriberSummaryByCustomerId', (req, res) => {
    console.log("Api subscriberSummaryByCustomerId:: ", req.body);
    if (mock.isMock) {
        res.json(mock.subscriberSummary)
    } else {
        //res.json(mock.subscriberSummary)
        const param = req.body;
        const urlString = req.body.generalSearch;
        let baseUrl = '/hobsrestgateway/crmservices/customer/getSubscriberSummaryByCustomer'
        console.log("Base Url :: ", baseUrl, req.session.options)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(dashboard_services.getSubscriberSummary(themeResp.data));
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/subscriberSummaryByCustomerIdFilter', (req, res) => {
    console.log("Api subscriberSummaryByCustomerIdFilter:: ", req.body);
    if (mock.isMock) {
        res.json(mock.subscriberSummary)
    } else {
        //res.json(mock.subscriberSummary)
        const param = req.body;
        console.log("Api subscriberSummaryByCustomerIdFilter::param--> ", param);
        const urlString = req.body.generalSearch;
        let baseUrl = '/hobsrestgateway/crmservices/customer/getSubscriberSummaryByCustomer'
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            // console.log(themeResp.data);
            res.json(dashboard_services.getSubscriberSummary(themeResp.data));
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/filterCriteria', (req, res) => {
    console.log("Api filterCriteria:: ", req.body);
    if (mock.isMock) {
        res.json(mock.filterCriteria)
    } else {
        //res.json(mock.filterCriteria)
        const param = req.body;
        console.log("Api filterCriteria::param--> ", param);
        const urlString = req.body.generalSearch;
        let baseUrl = '/hobsrestgateway/crmservices/customer/search/filterCriteria?size=0'
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            // console.log(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/getRelatedSubsFilterCriteria', (req, res) => {
    console.log("Api getRelatedSubsFilterCriteria:: ", req.body);
    if (mock.isMock) {
        res.json(mock.filterCriteria)
    } else {
        //res.json(mock.filterCriteria)
        const param = req.body;
        console.log("Api getRelatedSubsFilterCriteria::param--> ", param);
        const urlString = req.body.generalSearch;
        let baseUrl = '/hobsrestgateway/crmservices/customer/search/filterCriteria?size=0'
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            // console.log(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/filterCriteriaOrder', (req, res) => {
    console.log("Api filterCriteriaOrder:: ", req.body);
    if (mock.isMock) {
        res.json(mock.filterCriteriaOrder)
    } else {
        //res.json(mock.filterCriteria)
        const param = req.body;
        console.log("Api filterCriteriaOrder::param--> ", param);
        const urlString = req.body.generalSearch;
        let baseUrl = '/hobsrestgateway/omconsoleservices/order/search/filtercriteria?' + 'size=' + param.size + '&from=' + param.from
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param.payload, req.session.options) //app.get('apiPrefix') +
        ]).then(axios.spread((themeResp) => {
            // console.log(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
        // res.json(mock.filterCriteriaOrder)
    }
});

router.post('/searchByOrderId', (req, res) => {
    console.log("Api searchByOrderId:: ", req.body);
    let forDate = (value) => {
        let date = new Date(value);

        return [
            date.getDate(),
            date.toLocaleString('default', { month: 'short' }), //date.toLocaleString('fr', { month: 'short' }),
            date.getFullYear()
        ].join('-');
    }
    let forStatusObj = (status) => {

        for (let item of req.body.statusHeader) {
            console.log("searchByOrderId 11::", item)
            if (item.id == status) {
                // console.log("asdf2::", item.id, status)
                return { className: item.className, label: item.display };
            }
        }

    }
    if (mock.isMock) {
        res.json(mock.filterCriteriaOrder)
    } else {
        //res.json(mock.filterCriteria)
        const param = req.body.payload;
        console.log("Api searchByOrderId::param--> ", param);
        const urlString = req.body.generalSearch;
        let baseUrl = '/hobsrestgateway/omconsoleservices/order/search'
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options) //app.get('apiPrefix') +
        ]).then(axios.spread((themeResp) => {

            let subscriberOrderServiceDetailsFinal = themeResp.data;//{ responseObject: { orderDetails: [themeResp.data] } }
            console.log("themeResporder searchByOrderId", themeResp.data)
            subscriberOrderServiceDetailsFinal.responseObject.orderDetailsMap = new Map();
            // let orderDetailsMap = new Map();
            subscriberOrderServiceDetailsFinal.responseObject.orderDetails.forEach(element => {
                //for formating date
                element.createdDate = forDate(element.createdDate)
                element.requestedDate = forDate(element.requestedDate)
                element.committedDate = forDate(element.committedDate)
                element.lastUpdatedDate = forDate(element.lastUpdatedDate)
                element.requestedCancellationDate = forDate(element.requestedCancellationDate)
                //for assigning class to status
                // let dummy = forClassName(element.status)
                console.log("search order id asdfasdfasdf:", forStatusObj(element.status));
                element.statusObj = forStatusObj(element.status);
                //this action field will be assigned when action for row is clicked
                element.action = [];
                subscriberOrderServiceDetailsFinal.responseObject.orderDetailsMap[element.id] = element;
            });
            res.json(subscriberOrderServiceDetailsFinal);

            console.log("searchByOrderId actual api call subscriberOrderServiceDetails::", subscriberOrderServiceDetailsFinal)
            //res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
        // res.json(mock.filterCriteriaOrder)
    }
});

router.post('/subscriberAllowedActions', (req, res) => {
    if (mock.isMock) {
        res.json(mock.subscriberAllowedActions)
    } else {
        let param = new Map();
        param['channelID'] = "CSA";
        param['requestObject'] = req.body;
        param.requestObject['userTokenString'] = "wolve_test";
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/getCustomerActions', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });

    }

});
router.post('/subscriberAllowedActionsPending', (req, res) => {
    if (!mock.isMock) {
        console.log(" calling from subscriberAllowedActionsPending apiDash")
        res.json(mock.subscriberAllowedActionsForPending);
    }
});
router.post('/getOrderDetails', (req, res) => {
    if (mock.isMock) {
        res.json(mock.getOrderDetails)
    } else {
        let param;
        param = req.body;
        console.log(param);
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/findOrders', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });

    }

});
router.post('/userSummary', (req, res) => {
    console.log("Api userSummary:: ", req.body);

    if (mock.isMock) {
        res.json(mock.userSummary)
    } else {
        res.json(mock.userSummary)

    }

    // if (mock.isMock) {
    //   res.json(mock.userSummary)
    // } 
    // const param = req.body.id;
    // console.log('EXPRESS REQUEST TO userSummary PARAM: ', param, req.session.options);
    // axios.all([
    //   axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/getUserSummaryByAccount' + '?accountID=' + param, req.session.options
    //   )
    // ]).then(axios.spread((themeResp) => {
    //   res.json(themeResp.data);
    // })).catch(error => {
    //   handleServiceErros(error, res);
    // });
});

router.post('/getServiceSummary', (req, res) => {
    console.log("Api getServiceSummary:: ", req.body);
    if (mock.isMock) {
        res.json(mock.getserviceSummary)
    } else {
        //console.log("Hi in APIDASHBOARD...")
        res.json(mock.getserviceSummary)
        /* let urlParam ='accountID='+req.body.accountId+'&partyID='+req.body.partyNbr;
        console.log("Base urlParam  :: ", urlParam)
        let baseUrl = '/hobsrestgateway/crmservices/customer/getServiceSummary?'+urlParam
        console.log("Base Url :: ", baseUrl)
        axios.all([
          axiosInstance.get(app.get('apiPrefix') + baseUrl
            ,req.session.options)
        ]).then(axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })).catch(error => {
          handleServiceErros(error, res);
        }); */
    }
});

router.post('/serviceFeatureList', (req, res) => {
    console.log('EXPRESS REQUEST TO serviceFeatureList: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO serviceFeatureList PARAM: ', param, req.session.options);
    //if (mock.isMock) {
    res.json(mock.serviceFeature);

});

router.post('/householdDeviceList', (req, res) => {
    console.log('EXPRESS REQUEST TO householdDeviceList: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO householdDeviceList PARAM: ', param, req.session.options);
    //if (mock.isMock) {
    res.json(mock.householdDeviceApi);

});

router.post('/subscriberHeaderList', (req, res) => {
    console.log('EXPRESS REQUEST TO subscriberHeader: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO subscriberHeader PARAM: ', param, req.session.options);
    if (mock.isMock)
        res.json(formdata.subscriberHeader);
    else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'ent.dash.subs.tab.datatable.header', req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp.data);
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        }));
    }
});


router.post('/subscriberProductsTabHeader', (req, res) => {
    console.log('EXPRESS REQUEST TO subscriberProductsTabHeader: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO subscriberProductsTabHeader PARAM: ', param, req.session.options);
    if (mock.isMock)
        res.json(formdata.subscriberProductsTabHeader);
    else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'subs.profile.products.tab.header', req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp.data);
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        }));
    }
});

router.post('/getInvoiceList', (req, res) => {
    console.log("Api getInvoiceList:: ", req.body);
    if (mock.isMock) {
        res.json(mock.getInvoiceList)
    } else {
        let param = req.body;
        //console.log("Hi in APIDASHBOARD...")
        res.json(mock.getInvoiceList)
        //  let baseUrl = '/TIBInvoiceServices/services/TibInvoiceAndUsageServicesREST/rest/getInvoiceList'
        //   console.log("Base Url :: ", baseUrl)
        //   axios.all([
        //     axiosInstance.post(app.get('apiPrefix')+baseUrl,param.payload)
        //   ]).then(axios.spread((themeResp) => {
        //     //printlog(themeResp.data);
        //     res.json(themeResp.data);
        //   })).catch(error => {
        //     handleServiceErros(error, res);
        //   });
    }
});

router.post('/userHeaderList', (req, res) => {
    console.log('EXPRESS REQUEST TO userHeaderList: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO userHeaderList PARAM: ', param, req.session.options);
    if (mock.isMock)
        res.json(formdata.userHeader);
    else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'ent.dash.users.tab.datatable.header', req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp.data);
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        }));
    }
});
router.post('/payerUserHeaderList', (req, res) => {
    console.log('EXPRESS REQUEST TO payerUserHeaderList: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO payerUserHeaderList PARAM: ', param, req.session.options);
    //if (mock.isMock) {
    res.json(mock.payerUserHeaderList);

});

router.post('/serviceDetailsHeaderList', (req, res) => {
    console.log('EXPRESS REQUEST TO serviceDetailsHeaderList: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO serviceDetailsHeaderList PARAM: ', param, req.session.options);
    //if (mock.isMock) {
    res.json(mock.serviceDetailsHeader);

});


router.post('/customerDashboardTabList', (req, res) => {
    console.log('EXPRESS REQUEST TO customerDashboardTabList: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO customerDashboardTabList PARAM: ', param, req.session.options);
    //if (mock.isMock) {
    res.json(mock.customerDashTab);

});
router.post('/invoiceHeaderList', (req, res) => {
    console.log('EXPRESS REQUEST TO invoiceHeaderList: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO invoiceHeaderList PARAM: ', param, req.session.options);
    //if (mock.isMock) {
    res.json(mock.getInvoiceListHeader);

});

router.post('/getInvoiceAndActions', (req, res) => {
    const param = req.body;
    if (mock.isMock) {
        res.json(mock.getInvoiceAndActions);
    } else {
        res.json(mock.getInvoiceAndActions);
    }

});

router.post('/getInvoiceImage', (req, res) => {
    const param = req.body;
    console.log(param.payload)
    let baseUrl = '/TIBInvoiceServices/services/TibInvoiceAndUsageServicesREST/rest/getInvoiceImage'
    console.log("Base Url :: ", baseUrl)
    axios.all([
        axiosInstance.post(app.get('apiPrefix') + baseUrl, param.payload, req.session.options)
    ]).then(axios.spread((themeResp) => {
        //printlog(themeResp.data);
        res.json(themeResp.data);
    })).catch(error => {
        handleServiceErros(error, res);
    });

});

router.post('/initializeContext', (req, res) => {
    console.log('EXPRESS REQUEST TO initializeContext: ', req._parsedUrl.pathname, req.body);
    if (mock.isMock) {
        res.json(mock.initializeContextRes)
    } else {
        const param = req.body;
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/orderRequestContext/initializeContext', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getEligibleProductOffering', (req, res) => {
    console.log('EXPRESS REQUEST TO getEligibleProductOffering: ', req._parsedUrl.pathname, req.body);
    if (mock.isMock) {
        res.json(mock.eligibleProductOffering)
    } else {

        //printlog('EXPRESS REQUEST TO getEligibleProductOffering: ', req._parsedUrl.pathname, req.body);
        const param = req.body;
        //printlog('EXPRESS REQUEST TO getEligibleProductOffering PARAM: ',param);  
        axios.all([
            //axiosInstance.post(app.get('apiPrefix')+'/hobsrestgateway/cartservices/cart/getEligibleProductOffering/v2',param
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/getEligibleProductOffering/v2?from=0&size=3000', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/getConfigurableOffer', (req, res) => {
    if (mock.isMock) {
        res.json(mock.offerForConfiguration)
    } else {
        //res.json(mock.offerForConfiguration)
        const param = req.body;

        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/getConfigurableItemForProductOffering', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getInitiateBulkAddRemoveFeatures', (req, res) => {
    console.log('EXPRESS REQUEST TO getInitiateBulkAddRemoveFeatures: ', req._parsedUrl.pathname, req.body);

    if (mock.isMock) {
        res.json(mock.initiateBulkARF)
    } else {
        // res.json(mock.initiateBulkARF)
        const param = req.body;

        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/bulkOrder/initiateBulkAddRemoveFeatures', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getInitiateBulkChangePackage', (req, res) => {
    console.log('EXPRESS REQUEST TO getInitiateBulkChangePackage: ', req._parsedUrl.pathname, req.body);

    if (mock.isMock) {
        res.json(mock.initiateBulkChange)
    } else {
        res.json(mock.initiateBulkChange)

    }
});
router.get('/orderStatusHeader', (req, res) => {
    console.log('EXPRESS REQUEST TO orderStatusHeader: ');

    if (mock.isMock)
        res.json(formdata.orderStatusHeader);
    else {
        const param = req.body;
        console.log("param serverdev formDataForTerminateReason:::", param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'order.status.header', req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("datathemeResp1::::", themeResp.data);
            //console.log("datathemeResp2::::", JSON.parse(themeResp.data.responseObject.formData));
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/orderHeaderList', (req, res) => {
    console.log('EXPRESS REQUEST TO orderHeaderList: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO orderHeaderList PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(formdata.orderHeader);
    }
    else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'ent.dash.order.tab.order.header', req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp.data);
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        }));
    }

});

router.post('/aggregation', (req, res) => {
    console.log('EXPRESS REQUEST TO aggregation: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO aggregation PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.aggregation);
    }
    else {
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/order/aggregation', param, req.session.options) //app.get('apiPrefix')

        ]).then(axios.spread((themeResp) => {
            printlog("aggregation::", themeResp.data);

            res.json({ responseObj: themeResp.data, statuscode: '200' });
        })).catch(error => {
            // if (error.response) {
            //     console.log("aggregation sweety 22::",error.response.data);
            //     console.log("aggregation sweety 33::",error.response.status);
            //     console.log("aggregation sweety 44::",error.response.headers);
            //   }
            res.json({ statuscode: error.response.status })
            handleServiceErros(error, res);

        });
    }

});

router.post('/orderAllowedActions', (req, res) => {
    console.log("express server orderAllowedActions :::", req.body);
    if (mock.isMock) {
        res.json(mock.subscriberAllowedActions)
    }
    else {
        let param = req.body;
        // param['channelID'] = "CSA";
        // param['requestObject'] = req.body;
        // param.requestObject['userTokenString'] = "fo_user";
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/getCustomerActions', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
            console.log("order action11:::", themeResp.data)
            console.log("order action22:::", themeResp.data.responseObject.allowedActions.menuOptions.length)
            console.log("order action:::", res)
        })).catch(error => {
            handleServiceErros(error, res);
        });

    }

});



router.post('/orderLineStatusAggregation', (req, res) => {
    console.log('EXPRESS REQUEST TO orderLineStatusAggregation: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO orderLineStatusAggregation PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.orderLineStatusAggregation);
    } else {
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/order/orderline/aggregation/summary', param, req.session.options) //app.get('apiPrefix')

        ]).then(axios.spread((themeResp) => {
            printlog("ordreLine aggregation::", themeResp.data);

            res.json({ responseObj: themeResp.data, statuscode: '200' });
        })).catch(error => {

            res.json({ statuscode: error.response.status })
            handleServiceErros(error, res);

        });
    }

});


router.post('/orderLineHeader', (req, res) => {
    console.log('EXPRESS REQUEST TO orderLineHeader: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO orderLineHeader PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.orderLineHeader);
    }
    else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'app.orderSummary.orderLineView.orderLineHeader', req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp.data);
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        }));
    }

});


router.post('/orderLineList', (req, res) => {
    console.log('EXPRESS REQUEST TO orderLineList: ', req._parsedUrl.pathname, req.body);
    const param = req.body.payload;
    console.log('EXPRESS REQUEST TO orderLineList PARAM: ', param, req.session.options);

    let forDate = (value) => {
        let date = new Date(value);

        return [
            date.getDate(),
            date.toLocaleString('default', { month: 'short' }), //date.toLocaleString('fr', { month: 'short' }),
            date.getFullYear()
        ].join('-');
    }
    let forStatusObj = (status) => {

        for (let item of req.body.statusHeader) {
            if (item.id == status) {
                return { className: item.className, label: item.display };
            }
        }

    }
    if (mock.isMock) {

        let orderLineListResp = mock.orderLineList;
        console.log("orderLineListResp::", orderLineListResp);
        //orderLineList.responseObject.orderDetailsMap = new Map();
        orderLineListResp.forEach(element => {
            element.createdDate = forDate(element.createdDate)
            element.requestedDate = forDate(element.requestedDate)
            element.committedDate = forDate(element.committedDate)
            element.lastUpdatedDate = forDate(element.lastUpdatedDate)
            element.requestedCancellationDate = forDate(element.requestedCancellationDate)
            //element.statusObj = forStatusObj(element.status);
            element.primaryOffer = element.primaryOffer.name
            element.installationAddress = element.installationAddress.shortForm
            element.action = [];
            //orderLineListResp = element;
        });
        console.log("orderLineListResp mock::", orderLineListResp)
        res.json(orderLineListResp);
    }
    else {
        //res.json(mock.orderDetailsResult);
        console.log("param serverdev orderLineList:::", param);
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/orderline/search?size=10&from=0',
                param
                , req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp);
            //printlog(themeResp.data);
            let orderLineListResp = themeResp.data;//{ responseObject: { orderDetails: [themeResp.data] } }
            console.log("themeResporder", themeResp.data)
            orderLineListResp.responseObject.orderDetailsMap = new Map();
            // let orderDetailsMap = new Map();
            orderLineListResp.responseObject.orderDetails.forEach(element => {
                console.log("element for order line:::", element)
                //for formating date
                element.createdDate = forDate(element.createdDate)
                element.requestedDate = forDate(element.orderLineCompletionDate)
                element.committedDate = forDate(element.committedDate)
                element.lastUpdatedDate = forDate(element.lastUpdatedDate)
                //element.requestedCancellationDate = forDate(element.requestedCancellationDate)
                //for assigning class to status
                // let dummy = forClassName(element.status)
                // console.log("asdfasdfasdf:",forStatusObj(element.status));
                if (element.installationAddress != null) {
                    element.installationAddress = element.installationAddress.shortForm;

                }
                else {
                    element.installationAddress = "--"
                }
                if (element.primaryOffer != null) {
                    element.primaryOffer = element.primaryOffer.name;
                }
                else {
                    // element.primaryOffer = "--"
                }

                element.statusObj = forStatusObj(element.orderLineStatus);
                element.statusObjProcess = forStatusObj(element.orderLineProcessingStatus);
                if (element.serviceIdentifiers != null) {
                    element.serviceIdentifiers.forEach(ele => {
                        ele.value = ele.id;
                    })
                }


                //this action field will be assigned when action for row is clicked
                element.action = [];
                orderLineListResp.responseObject.orderDetailsMap[element.orderLineId] = element;
            });
            res.json({ responseObj: orderLineListResp, statuscode: '200' });

            console.log("orderLineListResp actual api call::", orderLineListResp)

            //res.json(orderDetails);
        })).catch(error => {
            // if (error.response) {
            //     console.log("order details  22::",error.response.data);
            //     console.log("order details  33::",error.response.status);
            //     console.log("order details  44::",error.response.headers);
            //   }
            res.json({ statuscode: error.response ? error.response.status : error })
            //handleServiceErros(error, res);
            // handleServiceErros(error, res);
        });
    }


});


router.post('/filterCriteriaOrderLine', (req, res) => {
    console.log("Api filterCriteriaOrderLine:: ", req.body);
    if (mock.isMock) {
        res.json(mock.filterCriteriaOrderLine)
    } else {
        //res.json(mock.filterCriteria)
        const param = req.body;
        console.log("Api filterCriteriaOrderLine::param--> ", param);
        const urlString = req.body.generalSearch;
        let baseUrl = '/hobsrestgateway/omconsoleservices/orderline/search/filtercriteria?size=10&from=0'
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options) //app.get('apiPrefix') +
        ]).then(axios.spread((themeResp) => {
            console.log("respdata filter", themeResp.data);
            // res.json(themeResp.data);
            let filterCriteriaResult = themeResp.data;
            let dummyArr = []
            filterCriteriaResult[0].value[0].data.aggregations.primaryOffer.forEach(ele => {
                console.log("in forEach, ",  (JSON.parse(ele)).name )
                dummyArr.push((JSON.parse(ele)).name);
            })
            // console.log("filterCriteriaResult::::", JSON.parse(filterCriteriaResult[0].value[0].data.aggregations.primaryOffer[0]).name);
            filterCriteriaResult[0].value[0].data.aggregations.primaryOffer = dummyArr;
            res.json(filterCriteriaResult)
        })).catch(error => {
            handleServiceErros(error, res);
        });
        // res.json(mock.filterCriteriaOrder)
    }
});

router.post('/getOrderFormData', (req, res) => {
    const param = req.body;
    console.log('param getOrderFormData:::', param);
    if (mock.isMock) {
        if (param.context == 'ordersummary.app.orderDetailsFormData') {
            var resObject = [];
            formdata.orderFormData.forEach(element => {
                if (element.controlType == 'labelvalueVertical') {
                    var orderDetails = {};
                    if (element.key == 'customerName') {
                        orderDetails = element;
                        orderDetails["value"] = param.payload.accountName
                    }
                    if (element.key == 'customerId') {
                        orderDetails = element;
                        orderDetails["value"] = param.payload.accountID
                    }
                    resObject.push(orderDetails)
                }
            });
            res.json(resObject);
        }
    } else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + param.context, req.session.options)
        ]).then(axios.spread((themeResp) => {
            console.log("themeResp getOrderFormData::::", themeResp.data);
            var orderFormData = [];
            orderFormData = JSON.parse(themeResp.data.responseObject.formData);
            var resObject = [];
            orderFormData.forEach(element => {
                if (element.controlType == 'labelvalueVertical') {
                    var orderDetails = {};
                    if (element.key == 'customerName') {
                        orderDetails = element;
                        orderDetails["value"] = param.payload[0].ownerName
                    }
                    if (element.key == 'customerId') {
                        orderDetails = element;
                        orderDetails["value"] = param.payload[0].customerid
                    }
                    console.log("orderDetails::::", orderDetails);
                    resObject.push(orderDetails)
                }
            });

            res.json(resObject);

        })).catch(error => {
            handleServiceErros(error, res);
        });
    }

});


router.post('/dateRange', (req, res) => {
    console.log('EXPRESS REQUEST TO dateRange: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO dateRange PARAM: ', param, req.session.options);
    if (mock.isMock) {
        res.json(mock.dateRange);
    } else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/order/search/meta/daterange', req.session.options) //app.get('apiPrefix')

        ]).then(axios.spread((themeResp) => {
            printlog("dateRange::", themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }

});


router.post('/orderServiceDetails', (req, res) => {
    let forDate = (value) => {
        let date = new Date(value);
        // console.log("date", [
        //     date.getDate(),
        //     date.toLocaleString('default', { month: 'short' }), //date.toLocaleString('fr', { month: 'short' }),
        //     date.getFullYear()
        // ].join('-'));
        return [
            date.getDate(),
            date.toLocaleString('default', { month: 'short' }), //date.toLocaleString('fr', { month: 'short' }),
            date.getFullYear()
        ].join('-');
    }
    let forStatusObj = (status) => {
        // let classList = formdata.orderStatusHeader.map(data => data.className);
        // console.log("asdf0::", status)
        for (let item of req.body.statusHeader) {
            // console.log("asdf1::", status)
            if (item.id == status) {
                // console.log("asdf2::", item.id, status)
                return { className: item.className, label: item.display };
            }
        }
        // switch(status) {
        //     case 'inprogress':
        //         return 'inprogress'; //add class that is defined in tailwind.config.js
        //     case 'complete':
        //         return 'complete';
        // }
    }
    // res.json(mock.orderDetailsResult);
    console.log('EXPRESS REQUEST TO orderServiceDetails: ');
    const param = req.body.payload;
    console.log('EXPRESS REQUEST TO orderServiceDetails PARAM: ', param, req.session.options);
    if (mock.isMock) {
        let orderDetails = mock.orderDetailsResult;
        orderDetails.responseObject.orderDetails = orderDetails.responseObject.orderDetails.splice(req.body.from ? req.body.from : 0, req.body.size ? req.body.size : 100);
        console.log("orderDetails::", orderDetails, req.body.from, req.body.size);
        orderDetails.responseObject.orderDetailsMap = new Map();
        // let orderDetailsMap = new Map();
        orderDetails.responseObject.orderDetails.forEach(element => {
            //for formating date
            element.createdDate = forDate(element.createdDate)
            element.requestedDate = forDate(element.requestedDate)
            element.committedDate = forDate(element.committedDate)
            element.lastUpdatedDate = forDate(element.lastUpdatedDate)
            element.requestedCancellationDate = forDate(element.requestedCancellationDate)
            //for assigning class to status
            // let dummy = forClassName(element.status)
            // console.log("asdfasdfasdf:",forStatusObj(element.status));
            element.statusObj = forStatusObj(element.status);
            //this action field will be assigned when action for row is clicked
            element.action = [];
            orderDetails.responseObject.orderDetailsMap[element.id] = element;
        });
        console.log("orderDetailsman mock::", orderDetails)
        // console.log("orderDetailsMap::", orderDetailsMap)
        res.json({ responseObj: orderDetails, statuscode: '200' });
    }
    else {
        //res.json(mock.orderDetailsResult);
        let baseUrl = req.body.size && req.body.from
            ? '/hobsrestgateway//omconsoleservices/order/summary?' + 'size=' + req.body.size + '&from=' + req.body.from
            : '/hobsrestgateway//omconsoleservices/order/summary';
        // baseUrl = '/hobsrestgateway//omconsoleservices/order/summary?' + 'size=' + req.body.size + '&from=' + req.body.from;

        console.log("param serverdev Contact:::", param);
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl,
                param
                , req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp);
            //printlog(themeResp.data);
            let orderDetailsFinal = themeResp.data;//{ responseObject: { orderDetails: [themeResp.data] } }
            console.log("themeResporder", themeResp.data)
            orderDetailsFinal.responseObject.orderDetailsMap = new Map();
            // let orderDetailsMap = new Map();
            orderDetailsFinal.responseObject.orderDetails.forEach(element => {
                //for formating date
                element.createdDate = element.createdDate ? forDate(element.createdDate) : "";
                element.requestedDate = element.requestedDate ? forDate(element.requestedDate) : "";
                element.committedDate = element.committedDate ? forDate(element.committedDate) : "";
                element.lastUpdatedDate = element.lastUpdatedDate ? forDate(element.lastUpdatedDate) : "";
                element.requestedCancellationDate = element.requestedCancellationDate ? forDate(element.requestedCancellationDate) : "";
                element.statusObj = forStatusObj(element.status);
                element.action = [];
                orderDetailsFinal.responseObject.orderDetailsMap[element.id] = element;
            });
            res.json({ responseObj: orderDetailsFinal, statuscode: '200' });

            console.log("orderDetailsman actual api call::", orderDetailsFinal)

            //res.json(orderDetails);
        })).catch(error => {
            console.log("Eror in OrderServiceDetails", error)
            res.json({ statuscode: error.response ? error.response.status : error })
        });
    }

});


router.post('/subscriberOrderServiceDetails', (req, res) => {
    console.log("req body for subscriber-app::", req.body)

    console.log('EXPRESS REQUEST TO subscriberOrderServiceDetails: ');
    const param = req.body.payload;
    console.log('EXPRESS REQUEST TO subscriberOrderServiceDetails PARAM: ', param, req.session.options);
    if (mock.isMock) {
        let subscriberOrderServiceDetails;
        res.json(subscriberApp_services.subscriberOrderServiceDetails(subscriberOrderServiceDetails));
    }
    else {
        //res.json(mock.orderDetailsResult);
        console.log("param serverdev Contact subscriberOrderServiceDetails:::", param);
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/order/summary?' + 'size=' + req.body.size + '&from=' + req.body.from,
                param
                , req.session.options)
        ]).then(axios.spread((themeResp) => {
            let subscriberOrderServiceDetailsFinal = themeResp.data;//{ responseObject: { orderDetails: [themeResp.data] } }
            console.log("themeResporder subscriberOrderServiceDetails", themeResp.data)
            res.json(subscriberApp_services.subscriberOrderServiceDetails(subscriberOrderServiceDetailsFinal,req));
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }

});


router.post('/encryptUrlParam', (req, res) => {
    console.log("encryptUrlParam API :: ", req.body.payload);
    if (mock.isMock) {
        res.json(mock.encryptUrlParam)
    } else {
        const param = req.body.payload;
        console.log("param serverdev encryptUrlParam:::", param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/salesordergatewayservices/salesordergateway/encrypt/urlparams/' + '?itemId=' + param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/exportFileSubscriberSummaryByCustomerId', (req, res) => {
    console.log("Api exportFileSubscriberSummaryByCustomerId:: ", req.body);
    if (mock.isMock) {
        res.json(mock.exportFileSubscriberSummaryByCustomerId)
    } else {
        //res.json(mock.subscriberSummary)
        const param = req.body;
        console.log("paramsss::", param);
        const urlString = req.body.generalSearch;
        let baseUrl = '/hobsrestgateway/crmservices/customer/bulk/file/subscriberSummaryByCustomer'
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/exportFileUserDetailsService', (req, res) => {
    console.log("Api exportFileUserDetailsService:: ", req.body);
    if (mock.isMock) {
        res.json(mock.exportFileUserDetailsService)
    } else {
        const param = req.body;
        const urlString = req.body.generalSearch;
        let baseUrl = '/hobsrestgateway/crmservices/customer/bulk/file/subscriber/fetch'
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/entServiceGroupList', (req, res) => {
    console.log('EXPRESS REQUEST TO entServiceGroupList: ', req._parsedUrl.pathname, req.body);
    const param = req.body.id;
    console.log('EXPRESS REQUEST TO entServiceGroupList PARAM: ', param);
    if (!mock.isMock) {
        res.json(mock.subscriberSrvc);
    }
    else {
        // res.json(mock.subscriberSrvc);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/HOBSAnalytics/dataservice/getServiceDetails' + '?customerId=' + param)
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getPreOrderCheckValidation', (req, res) => {

    if (mock.isMock) {
        res.json(mock.getPreOrderCheck);
    } else {
        //res.json(mock.getPreOrderCheck);
        const param = req.body;
        let baseUrl = '/hobsrestgateway/omconsoleservices/preordercheckservice/validateOrder';
        console.log("Base Url :: ", baseUrl)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + baseUrl, param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/initiateResume', (req, res) => {
    if (mock.isMock) {
        res.json(mock.initiateResume)
    } else {
        res.json(mock.initiateResume)
    }

});

router.post('/initiateSuspend', (req, res) => {
    if (mock.isMock) {
        res.json(mock.initiateSuspend)
    } else {
        res.json(mock.initiateSuspend)
    }

});

router.post('/initiateTerminate', (req, res) => {
    if (mock.isMock) {
        res.json(mock.initiateTerminate)
    } else {
        res.json(mock.initiateTerminate)
    }

});


router.post('/submitOrderForResume', (req, res) => {
    if (mock.isMock) {
        res.json(mock.submitOrderForResume)
    } else {

        res.json(mock.submitOrderForResume)

    }
});

router.post('/log/info', (req, res) => {
    winston.info(req.body.logMessage);
    res.json(mock.logMessage);

});

router.post('/log/debug', (req, res) => {
    winston.info("Debug logs");
    printlog("/log/debug called");
    winston.debug(req.body.logMessage);
    res.json(mock.logMessage);
});

router.post('/log/warn', (req, res) => {
    winston.warn(req.body.logMessage);
    res.send(mock.logMessage);
});

router.post('/log/error', (req, res) => {
    winston.error(req.body.logMessage);
    res.send(mock.logMessage);
});

router.post('/log/fatal', (req, res) => {
    winston.error(req.body.logMessage);
    res.send(mock.logMessage);
});
router.post('/getLogApiPrefix', (req, res) => {
    if (envConst.ENV == 'prod') {
        res.json("https://" + envConst.LOG_PREFIX + "," + app.get('envDevelopmentMode') + "," + app.get('envLogLevel'));
    } else {
        res.json(app.get('envLogServicePrefix') + "," + app.get('envDevelopmentMode') + "," + app.get('envLogLevel'));
    }
});
router.get('/logoutHost', (req, res) => {
    console.log('EXPRESS REQUEST TO logoutHost: ', envConst.CAS_PREFIX);
    res.json(envConst.CAS_PREFIX);

});
router.post('/getRefDataFinal', (req, res) => {
    console.log('enter in apiorder getRefData', req.body);
    if (mock.isMock) {
        const param = req.body;
        const speci = req.body.referanceName;
        console.log('enter in apiorder getRefData', speci);

        if (speci == "PARTY_TYPE" && req.body.entity == "ACCOUNT") {
            res.json(mock.PARTY_TYPE)
        } else if (speci == "CONTACT_ROLE" && req.body.entity == "ACCOUNT") {
            res.json(mock.CONTACT_ROLE)
        } else if (req.body.referanceName == "CONTACT_ROLE" && req.body.entity == "CUSTOMER") {
            console.log("asdf hihi")
            res.json(mock.contactRole);
            console.log("after getting mock", res.json(mock.contactRole));
        } else if (req.body.referanceName == "PARTY_TYPE" && req.body.entity == "CUSTOMER") {
            res.json(mock.partyTypeForCust);
            console.log("after getting mock", res.json(mock.partyTypeForCust));
        }

        //  console.log('res/////', res.json(mock.getRefData))
    } else {

        let baseUrl = '/tibchassisrestservice/rest/referencedataservice/referencedataauth/'
        let domain = req.body.domain;
        let context = req.body.context;
        let entity = req.body.entity;
        let referanceName = req.body.referanceName;

        const param = req.body;
        console.log("domain part", req.body.domain);
        console.log("context part", context);
        console.log("entity part", entity);
        console.log("referanceName part", referanceName);

        baseUrl = baseUrl + domain + '/' +
            context + '/' + entity + '/' + referanceName + '?opId=HOB&buId=DEFAULT&language=ENG&userId=wolve_test';
        console.log("baseUrl", baseUrl);

        axios.all([
            axiosInstance.get(app.get('apiPrefix') + baseUrl, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            //console.log("ACCT_SEGMENT////", themeResp)
            var resObject = [];
            // console.log("ACCT_SEGMENT////", themeResp)

            res.json(themeResp.data);
        })).catch(error => {
            console.log("error", error)
            handleServiceErros(error, res);
        });
    }
});

router.post('/getBulkActions', (req, res) => {
    if (mock.isMock) {
        res.json(mock.bulkAllowedActions)
    } else {
        res.json(mock.bulkAllowedActions)
        /* let param = new Map();
        param['channelID'] = "CSA";
        param['requestObject'] = req.body;
        param.requestObject['userTokenString']="fo_user";
        axios.all([
          axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/getCustomerActions'
            , param, req.session.options)
        ]).then(axios.spread((themeResp) => {
          res.json(themeResp.data);
        })).catch(error => {
          handleServiceErros(error, res);
        }); */

    }

});

router.post('/createContact', (req, res) => {
    console.log("Contact API :: ");
    if (mock.isMock) {
        res.json(mock.contactForIndividual)
    } else {
        const param = req.body;
        console.log("param serverdev Contact:::", param);
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/create', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            // console.log("themeResp::::", themeResp);
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getOfferValidation', (req, res) => {
    console.log("getOfferValidation API :: ");
    if (!mock.isMock) {
        res.json(mock.getOfferValidation)
    } else {
        // const param = req.body;
        // console.log("param serverdev Contact:::", param);
        // axios.all([
        //   axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/create', param
        //     , req.session.options)
        // ]).then(axios.spread((themeResp) => {
        //   console.log("themeResp::::", themeResp);
        //   //printlog(themeResp.data);
        //   res.json(themeResp.data);
        // })).catch(error => {
        //   handleServiceErros(error, res);
        // });
    }
});
router.post('/reconfigureCartItem', (req, res) => {
    if (mock.isMock) {
        res.json(mock.reconfigureCartRes)
    } else {
        // res.json(mock.reconfigureCartRes)
        const param = req.body;
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/reconfigureCartItem', param
                , req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/submitOrder', (req, res) => {
    if (mock.isMock) {
        res.json(mock.submitOrder)
    } else {
        console.log(req.body)
        const param = req.body;
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/submitOrder', param
                , req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });


    }
});
router.post('/getShoppingCartItemByID', (req, res) => {
    console.log("getShoppingCartItemByID API :: ");
    if (mock.isMock) {
        res.json(mock.getShoppingCartItemByID)
    } else {
        //res.json(mock.getShoppingCartItemByID)
        const param = req.body;

        requestedURL = 'id=' + param.cartInstanceIdentifier + '&itemID=' + param.itemId;
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/getShoppingCartItemByID/?' + requestedURL,
                req.session.options)
        ]).then(axios.spread((themeResp) => {
            // console.log("themeResp::::", themeResp);
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getChangeSummaryOfferValidation', (req, res) => {
    console.log("getChangeSummaryOfferValidation API :: ");
    if (!mock.isMock) {
        res.json(mock.getChangeSummaryOfferValidation)
    } else {
        // const param = req.body;
        // console.log("param serverdev Contact:::", param);
        // axios.all([
        //   axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/create', param
        //     , req.session.options)
        // ]).then(axios.spread((themeResp) => {
        //   console.log("themeResp::::", themeResp);
        //   //printlog(themeResp.data);
        //   res.json(themeResp.data);
        // })).catch(error => {
        //   handleServiceErros(error, res);
        // });
    }
});

router.post('/formDataForTerminateReason', (req, res) => {
    console.log("formDataForTerminateReason API :: ");
    if (mock.isMock) {
        res.json(mock.formDataForTerminateReason)
    } else {
        const param = req.body;
        console.log("param serverdev formDataForTerminateReason:::", param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + param.formId, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.get('/subscriberAppSetting', (req, res) => {
    console.log("subscriber.tab.datatable.settings API :: ");
    if (!mock.isMock) {
        res.json(formdata.subscriberAppSetting)
    } else {
        console.log('EXPRESS REQUEST TO subscriber.tab.datatable.settings: else ',);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'subscriber.tab.datatable.settings', req.session.options)
        ]).then(axios.spread((themeResp) => {
            // console.log("subscriber.tab.datatable.settings::::", themeResp);
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/dashboard/getAppConfigJson', (req, res) => {
    if (mock.isMock) {
        res.json(mock.getAppConfigJson)
    } else {
        const param = req.body.projectName;
        console.log("param App dash COnfig :: ", param, req.session.options)
        //printlog('EXPRESS REQUEST TO getcartforsubscription PARAM: ',param);  
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/appSettingsData/FrontOffice/' + param,
                req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
})

router.post('/uploadDocument', (req, res) => {
    console.log("Upload Document API dashboard ---- :: ");
    delete req.body["getDocumentResponse"];
    if (mock.isMock) {
        res.json(mock.uploadDocument)
    }
    else {
        const param = req.body;
        console.log("param serverdev::: upload document dashboard", param);

        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/customerdocuments/tibcustomerdocuments/add', param
                , {
                    headers: {
                        'Content-Type': 'application/json',
                        'opID': req.session.options.headers.opID,
                        'buID': req.session.options.headers.buID,
                        'userID': req.session.options.headers.userID,
                        'Authorization': 'Basic Zm9fdXNlcjpmb191c2Vy',
                        'language': req.session.options.headers.lang,
                        'channel': 'CSA'
                    }
                })
        ]).then(axios.spread((themeResp) => {
            console.log("themeResp dashboard::::", themeResp);
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/getDocumentList', (req, res) => {
    console.log("get Document List API dashboard:: ");
    if (mock.isMock) {
        res.json(mock.getDocumentList)

    }
    else {
        const param = req.body;
        console.log("param serverdev::: get document dashboard", param);

        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/getcustomerdocuments//tibcustomerdocuments/fetch/current', param
                , {
                    headers: {
                        'Content-Type': 'application/json',
                        'opID': req.session.options.headers.opID,
                        'buID': req.session.options.headers.buID,
                        'userID': req.session.options.headers.userID,
                        'Authorization': 'Basic Zm9fdXNlcjpmb191c2Vy',
                        'language': req.session.options.headers.lang,
                        'channel': 'CSA'
                    }
                })
        ]).then(axios.spread((themeResp) => {
            console.log("themeResp dashboard::::", themeResp);
            //printlog(themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/getRelatedSubscriberList', (req, res) => {
    console.log("Api getRelatedSubscriberList:: ", req.body);
    if (mock.isMock) {
        //let resp = mock.subscriberRelatedSummary;
        let resp = mock.subscriberSummary;
        res.json(dashboard_services.getSubscriberSummary(resp));
    } else {
        // res.json(mock.subscriberRelatedSummary)
        const param = req.body.subscriberID;
        //printlog('EXPRESS REQUEST TO getcartforsubscription PARAM: ',param);  
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/getRelatedSubscriptions?subscriberID=' + param,
                req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(dashboard_services.getSubscriberSummary(themeResp.data));
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getRelatedSubscriberHeader', (req, res) => {
    // console.log('EXPRESS REQUEST TO getRelatedSubscriberHeader: ', req._parsedUrl.pathname, req.body);
    // const param = req.body;
    // console.log('EXPRESS REQUEST TO getRelatedSubscriberHeader PARAM: ', param, req.session.options);
    // res.json(mock.relatedSubscriberHeader);
    if (mock.isMock)
        res.json(formdata.subscriberHeader);
    else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'ent.dash.subs.tab.datatable.header', req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp.data);
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        }));
    }
});

router.post('/subscriberProductsTabAPI', (req, res) => {
    console.log('EXPRESS REQUEST TO subscriberProductsTabAPI------------>: ', req.body);
    if (mock.isMock) {
        // res.json(mock.subscriberProductsData);
        res.json(mock.subsciberProductsDataSimple);
    } else {
        // res.json(mock.subscriberProductsData);
        const param = req.body.subscriberID;
        console.log("param serverdev subscriberProductsTabAPI:::", param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/product?leafNode=N&subscriberID=' + param, req.session.options),
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/getActiveContracts?subscriberID=' + param, req.session.options),
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/getActiveInstalments?subscriberID=' + param, req.session.options)
        ]).then(axios.spread((products, contracts, installment) => {
            console.log("subscriberProductsTabAPI---here----->", products.data);
            let response = {};
            let prod, insta, contr;
            if (products != null && products.data != null && products.data.responseStatusList != null && products.data.responseStatusList.status != null && products.data.responseStatusList.status[0] != null && products.data.responseStatusList.status[0].statusCode == '0000') {
                prod = products.data.responseObject;
                //prod = mock.subsciberProductsDataSimple.responseObject;
                response['homeTab'] = products.data;
            }
            if (contracts != null && contracts.data != null && contracts.data.responseStatusList != null && contracts.data.responseStatusList.status != null && contracts.data.responseStatusList.status[0] != null && contracts.data.responseStatusList.status[0].statusCode == '0000')
                contr = contracts.data.responseObject;
            if (installment != null && installment.data != null && installment.data.responseStatusList != null && installment.data.responseStatusList.status != null && installment.data.responseStatusList.status[0] != null && installment.data.responseStatusList.status[0].statusCode == '0000')
                insta = contracts.data.responseObject;
            response['productsTab'] = subscriberApp_services.getProductCustamizedDetails(prod, contr, insta);
            res.json(response);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/subscriberProductsList/subscriberapp', (req, res) => {
    console.log('EXPRESS REQUEST TO subscriberProductsList------------>: ', req.body);
    if (mock.isMock) {
        // res.json(mock.subscriberProductsData);
        res.json(mock.subsciberProductsDataSimple);
    } else {
        // res.json(mock.subscriberProductsData);
        const param = req.body.subscriberID;
        console.log("param serverdev subscriberProductsList:::", param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/product?leafNode=N&subscriberID=' + param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getAddSubscriberProductsList/subscriberapp', (req, res) => {
    console.log('EXPRESS REQUEST TO getAddSubscriberProductsList------------>: ', req.body);
    if (mock.isMock) {
        // res.json(mock.subscriberProductsData);
        res.json(mock.subsciberProductsDataSimple);
    } else {
        // res.json(mock.subscriberProductsData);
        res.json("");
    }
});
router.post('/getActiveContracts', (req, res) => {
    console.log('EXPRESS REQUEST TO getActiveContracts------------>: ', req.body);
    if (mock.isMock) {
        res.json(mock.getActiveContracts);
    } else {
        //res.json(mock.getActiveContracts);
        const param = req.body.subscriberID;
        console.log("param serverdev getActiveContracts:::", param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/getActiveContracts?subscriberID=' + param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getActiveInstalments', (req, res) => {
    console.log('EXPRESS REQUEST TO getActiveInstalments------------>: ', req.body);
    if (mock.isMock) {
        res.json(mock.getActiveInstalments);
    } else {
        res.json(mock.getActiveInstalments);
        // const param = req.body.subscriberID;
        // console.log("param serverdev getActiveContracts:::", param);
        // axios.all([
        //     axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/getActiveInstalments?subscriberID=' + param, req.session.options)
        // ]).then(axios.spread((themeResp) => {

        //     res.json(themeResp.data);
        // })).catch(error => {
        //     handleServiceErros(error, res);
        // });
    }
});
router.post('/subscriberProductsHeader/subscriberapp', (req, res) => {
    console.log('EXPRESS REQUEST TO subscriberProductsHeader: ');
    if (mock.isMock)
        res.json(formdata.subscriberHomeProductsHeader);
    else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'subs.profile.home.tab.products.header', req.session.options)
        ]).then(axios.spread((themeResp) => {
            // console.log("subs.profile.home.tab.products.header::::", themeResp);
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }

});
router.post('/dashboard/loadConfiguredRoles', (req, res) => {
    if (mock.isMock) {

        res.json(mock.dataSetRoleMapDetails)

    } else {
        //res.json(mock.dataSetRoleMapDetails)
        console.log("Inside loadConfiguredRoles", req.body.roleList)
        const roles = req.body.roleList;
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/tibchassisrestservice/rest/uimetadataservice/datasets/role/all?roles=' + roles + '&opId=' + req.session.options.headers.opID + '&buId=' + req.session.options.headers.buID + '&language=' + req.session.options.headers.lang
            )
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp ",themeResp.data)
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });


    }

});
router.post('/getFormData', (req, res) => {
    const param = req.body;
    console.log('param:::', param);
    if (mock.isMock) {
        if (param.context == 'dashboard.app.accountFormData') {
            var resObject = [];
            formdata.accountFormData.forEach(element => {
                if (element.controlType == 'labelvalueVertical') {
                    var accountDetails = {};
                    if (element.key == 'accountName') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.accountName
                    }
                    if (element.key == 'accountID') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.accountID
                    }
                    if (element.key == 'payerName') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.payerName
                    }
                    if (element.key == 'payerAddress') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.payerAddress
                    }

                    resObject.push(accountDetails)
                }
            });
            res.json(resObject);
        }
    } else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + param.context, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp.data);
            var accountFormData = [];
            accountFormData = JSON.parse(themeResp.data.responseObject.formData);
            var resObject = [];
            accountFormData.forEach(element => {
                if (element.controlType == 'labelvalueVertical') {
                    var accountDetails = {};
                    if (element.key == 'accountName') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.accountName
                    }
                    if (element.key == 'accountID') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.accountID
                    }
                    if (element.key == 'payerName') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.payerName
                    }
                    if (element.key == 'payerAddress') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.payerAddress
                    }
                    //console.log("accountDetails::::", accountDetails);
                    resObject.push(accountDetails)
                }
            });

            res.json(resObject);

        })).catch(error => {
            handleServiceErros(error, res);
        });
    }

});

router.post('/getChangeOwnerFormData', (req, res) => {
    debugger
    const param = req.body;
    console.log('param:::', param);
    if (mock.isMock) {
        if (param.context == 'changeowner.app.changeOwnerFormData') {
            var resObject = [];
            formdata.accountFormData.forEach(element => {
                if (element.controlType == 'labelvalueVertical') {
                    var accountDetails = {};
                    if (element.key == 'accountName') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.accountName
                    }
                    if (element.key == 'accountID') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.accountID
                    }
                    if (element.key == 'payerName') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.payerName
                    }
                    if (element.key == 'customerID') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.customerID
                    }
                    if (element.key == 'payerAddress') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.payerAddress
                    }

                    resObject.push(accountDetails)
                }
            });
            res.json(resObject);
        }
    } else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + param.context, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp.data);
            var accountFormData = [];
            accountFormData = JSON.parse(themeResp.data.responseObject.formData);
            var resObject = [];
            accountFormData.forEach(element => {
                if (element.controlType == 'labelvalueVertical') {
                    var accountDetails = {};
                    if (element.key == 'accountName') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.accountName
                    }
                    if (element.key == 'accountID') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.accountID
                    }
                    if (element.key == 'payerName') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.payerName
                    }
                    if (element.key == 'customerID') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.customerID
                    }
                    if (element.key == 'payerAddress') {
                        accountDetails = element;
                        accountDetails["value"] = param.payload.payerAddress
                    }
                    //console.log("accountDetails::::", accountDetails);
                    resObject.push(accountDetails)
                }
            });

            res.json(resObject);

        })).catch(error => {
            handleServiceErros(error, res);
        });
    }

});

router.post('/getServiceIdentifer/subscriberapp', (req, res) => {
    console.log('EXPRESS REQUEST TO getServiceIdentifer: ');
    if (mock.isMock) {
        res.json(mock.serviceIdentiferRes);
    } else {
        const param = req.body.subscriberID;
        console.log("param serverdev formDataForTerminateReason:::", param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/getServiceIdentifiers/' + param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            let serviceResponse = themeResp.data;
            res.json(subscriberApp_services.getServiceIdentifier(serviceResponse, param));
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/getAdditonalServiceIdentifer', (req, res) => {
    console.log('EXPRESS REQUEST TO getAdditonalServiceIdentifer: ');

    const param = req.body.subscriberID;
    let subs = [];
    let serviceResponse = {};
    if (mock.isMock) {
        serviceResponse = mock.serviceIdentiferRes;
    }
    // else {
    //     serviceResponse = mock.serviceIdentiferRes;
    // }
    try {
        res.json(subscriberApp_services.getAddtionalServiceIdentifier(serviceResponse, param));
    } catch (e) {
        console.error(e);
    }
});
router.post('/getProductHistoryDetails', (req, res) => {
    console.log('EXPRESS REQUEST TO getProductHistoryDetails: ', req);

    if (mock.isMock) {
        res.json(mock.productHistoryDetails);
    } else {
        //res.json(mock.productHistoryDetails);
        const param = req.body.payload;
        console.log("param serverdev getProductHistoryDetils:::", param);
        if(req.body.startDate != '' && req.body.startDate != undefined)
        {
            axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/activityHistory?id=' + param.subId + '&from=' + param.startDate, req.session.options)
        ]).then(axios.spread((themeResp) => {
            console.log("themeResp:::: getProductHistoryDetails", themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });}
        else
    {    axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/activityHistory?id=' + param.subId , req.session.options)
        ]).then(axios.spread((themeResp) => {
            console.log("themeResp:::: getProductHistoryDetails", themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
    }

});


router.post('/getSubscriberProductChargeSummary/subscriberapp', (req, res) => {
    console.log('EXPRESS REQUEST TO getSubscriberProductChargeSummary------------------>: ', req.body);

    if (mock.isMock) {
        res.json(mock.subscriberPriceSingleProduct);
    } else {
        const param = req.body.subscriberID;
        console.log("param serverdev getSubscriberProductChargeSummary:::", param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/getSummaryPriceWithAlteration?subscriberID=' + param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/getProfileSummary', (req, res) => {
    console.log('EXPRESS REQUEST TO getProfileSummary: ', req.body);
    if (mock.isMock) {
        res.json(mock.profileSummary);
    }
    else {
        const param = req.body.subscriberID;
        console.log("param serverdev formDataForTerminateReason:::", param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/' + param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/subscriptionHistory/subscriberapp', (req, res) => {
    console.log('EXPRESS REQUEST TO subscriptionHistory: ', req.body);
    res.json(mock.subscriptionHistoryAddOrRemoveProduct);

});


router.post('/getJSONFormData', (req, res) => {

    if (mock.isMock) {
        if (req.body.context.formId == 'orderLine.status.header') {
            res.json(mock.basicDetails)
        }

    } else {

        console.log("dashboard req body:::", req.body)
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + req.body.context.formId, req.session.options)
        ]).then(axios.spread((themeResp) => {
            // printlog(themeResp);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.get('/sseEvents', (req, res) => {
    sendSSE(req, res);
});
router.post('/getDate1', (req, res) => {
    console.log("Api getDate:: ", req.body);
    if (mock.isMock) {
        console.log("Api getDate:: I am inside IF block ");
        res.json(mock.dateResponse)
    } else {
        console.log("Api getDate:: I am inside ELSE block");
        res.json(mock.dateResponse)
    }
});
router.post('/getPreOrderCheckValidation', (req, res) => {
    console.log("Api getPreOrderCheckValidation:: ", req.body);
    if (mock.isMock) {
        console.log("Api getPreOrderCheckValidation:: I am inside IF block ");
        res.json(mock.profileSummary)
    } else {
        console.log("Api getPreOrderCheckValidation:: I am inside ELSE block");
        res.json(mock.profileSummary)
    }
});
router.post('/searchAccountHeaderList', (req, res) => {
    console.log("searchAccountHeaderList::::", req.body);
    const param = req.body;
    if (mock.isMock) {
        res.json(mock.searchAccountHeaderList);
    }
    else {
        res.json(mock.searchAccountHeaderList);

    }
});
router.post('/searchViewAllAccount', (req, res) => {
    console.log("searchViewAllAccount::::", req.body);
    const param = req.body;
    if (mock.isMock) {
        res.json(mock.searchViewAllAccount);
    }
    else {
        res.json(mock.searchViewAllAccount);

    }
});
router.post('/dashboard/getJSONFormData', (req, res) => {
    console.log('here')
    if (mock.isMock) {
        if (req.body.context.formId == 'orderLine.status.header') {
            res.json(mock.basicDetails)
        } else if (req.body.context.formId == "order.app.addNotes.capture") {
            res.json(mock.basicDetails)
        }
    } else {
        console.log("dashboard req body:::", req.body)
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + req.body.context.formId, req.session.options)
        ]).then(axios.spread((themeResp) => {
            if (req.body.context.formId == "order.app.addNotes.capture") {
                let cartResponse = req.body.context.cartResponse;
                let enumData = [];
                /* Object.entries(cartResponse.responseObject.mapOfCartItem).forEach(
                  ([key, val]) => {
                    enumData.push({
                      label: val.configuredProduct.name,
                      value: key,
                      disabled: false,
                    });
                  }
                ); */
                enumData.push({
                    label: '150MinTT',
                    value: req.body.context.cartResponse,
                    disabled: false,
                });
                let inputFormArray = JSON.parse(
                    themeResp.data.responseObject.formData
                );
                inputFormArray.forEach((eachItem) => {
                    console.log("eachItem", eachItem);
                    if (eachItem.key == "notesCategory") {
                        eachItem.enum = enumData;
                    }
                });
                themeResp.data.responseObject.formData =
                    JSON.stringify(inputFormArray);
                res.json(themeResp.data);
            } else if (req.body.context.formId == 'subscriberProfile.app.makePayment.capture') {
                console.log("dashboard req body:::", req.body.context.formId)
                var makePaymentFormData = [];
                makePaymentFormData = JSON.parse(themeResp.data.responseObject.formData);
                makePaymentFormData.forEach(element => {
                    /*  if (element.key == 'paymentDate') {
                         element.value = new Date();
                         } */

                    if (element.key == 'paymentComments') {
                        element.value = "";
                    }
                    if (element.key == 'totalAmount') {
                        element.value = req.body.context.data;
                        // element.disabled=true
                    }

                    //if (element.key == 'skipPayment') {
                    //element.title = "View Subscriber Profile"
                    //element.label = "View Subscriber Profile"
                    //makePaymentFormData.splice(makePaymentFormData.findIndex(item => item.key == element.key),1)
                    //delete makePaymentFormData[3];
                    // element.disabled=true
                    // }
                }
                );
                themeResp.data.responseObject.formData = JSON.stringify(makePaymentFormData);
                res.json(themeResp.data);
            } else if (req.body.context.formId == 'customer360.dash.widget.list') {
                let widgetDetails = req.body.context.widgetDtls
                /*  let otherDtls={"user":"fo_user"}
                 let newwidgetDtls={...widgetDetails,...otherDtls}
                 console.log('newwidgetDtls',newwidgetDtls) */
                console.log('widgetDetails', widgetDetails)
                let colorCode = []
                colorCode = JSON.parse(req.body.context.colorStatus)
                console.log('colorCode', colorCode)
                let forStatusObj = (status) => {
                    console.log('status', status)
                    for (let item of colorCode) {
                        console.log('item', item)
                        if (item.id == status) {
                            console.log('item.id', item.id)
                            return { className: item.className, label: item.display };
                        }
                    }
                }
                let widgetList = [];
                widgetList = JSON.parse(themeResp.data.responseObject.formData);
                widgetList.forEach(element => {
                    if (typeof widgetDetails != null) {
                        if (element.widgetId == "workItem") {
                            element.itemIdAction = widgetDetails.itemId
                            element.itemDescription = widgetDetails.itemSubType
                            element.itemStatus = widgetDetails.itemStatus
                            element.date = widgetDetails.itemCreatedDate
                            if (typeof element.itemStatus != null && element.itemStatus != undefined) {
                                element.statusClass = forStatusObj(element.itemStatus).className
                                element.statusDispaly = forStatusObj(element.itemStatus).label
                            }
                        }
                        if (element.widgetId == "order") {
                            element.itemIdAction = widgetDetails.orderId
                            if (typeof widgetDetails != null && widgetDetails.unit != null)
                                element.itemValue = widgetDetails.unit + " : " + widgetDetails.orderValue

                            element.itemStatus = widgetDetails.orderStatus
                            element.date = widgetDetails.orderDate
                            if (typeof element.itemStatus != null && element.itemStatus != undefined) {
                                element.statusClass = forStatusObj(element.itemStatus).className
                                element.statusDispaly = forStatusObj(element.itemStatus).label
                            }
                        }
                        if (element.widgetId == "cart") {
                            if (typeof element.itemStatus != null && element.itemStatus != undefined) {
                                element.statusClass = forStatusObj(element.itemStatus).className
                                element.statusDispaly = forStatusObj(element.itemStatus).label
                            }
                        }
                        if (element.widgetId == "billing") {
                            if (typeof element.itemStatus != null && element.itemStatus != undefined) {
                                element.statusClass = forStatusObj(element.itemStatus).className
                                element.statusDispaly = forStatusObj(element.itemStatus).label
                            }
                        }
                    }
                })
                themeResp.data.responseObject.formData = JSON.stringify(widgetList);
                res.json(themeResp.data);
            }
            else {
                res.json(themeResp.data);
            }
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }

});
router.post("/dashboard/addrelatednotes", (req, res) => {
    console.log("addrelatednotes API :: ");
    if (mock.isMock) {
        console.log("addrelatednotes API :: ", mock.isMock);
        res.json(mock.relatednotes);
    } else {
        const param = req.body;
        console.log("param addrelatednotes:::", param);
        axios
            .all([
                axiosInstance.post(
                    app.get("apiPrefix") +
                    "/hobsrestgateway/cartservices/cart/addRelatedEntities",
                    param,
                    req.session.options
                ),
            ])
            .then(
                axios.spread((themeResp) => {
                    console.log("themeResp::::", themeResp);
                    //printlog(themeResp.data);
                    res.json(themeResp.data);
                })
            )
            .catch((error) => {
                handleServiceErros(error, res);
            });
    }
});

router.post("/dashboard/getrelatednotes", (req, res) => {
    console.log("getrelatednotes API :: ", req.body);
    if (mock.isMock) {
        console.log("addrelatednotes API :: ", mock.isMock);
        res.json(mock.getrelatednotes);
    } else {
        const param = req.body;
        console.log("param getrelatednotes:::", param.cartid);
        axios
            .all([
                axiosInstance.get(
                    app.get("apiPrefix") +
                    "/hobsrestgateway/cartservices/cart/getRelatedEntitiesByCartId?cartInstanceIdentifier=" +
                    param.cartid,
                    req.session.options
                ),
            ])
            .then(
                axios.spread((themeResp) => {
                    //console.log("themeResp::::", themeResp.data);
                    //printlog(themeResp.data);
                    res.json(themeResp.data);
                })
            )
            .catch((error) => {
                handleServiceErros(error, res);
            });
    }
});



router.post('/getOrderLineNotes', (req, res) => {
    console.log("getOrderLineNotes req -->", req)
    if (mock.isMock) {
        res.json(mock.getOrderLineNotes)
    }
    else {
        const param = req.body;
        console.log('EXPRESS REQUEST TO getOrderLineNotes: else loop ', param);
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/order/getordernotes', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("getnotes value resp:::", themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }


});


router.post('/getOrderLineAddNotes', (req, res) => {
    console.log("getOrderLineAddNotes req -->", req)
    if (mock.isMock) {
        res.json(mock.getOrderLineAddNotes)
    }
    else {
        const param = req.body;
        console.log('EXPRESS REQUEST TO getOrderLineAddNotes: else loop ', param);
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/order/addordernotes', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("addnotes value resp:::", themeResp.data);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/getOrderLinePreRequisites', (req, res) => {
    console.log('EXPRESS REQUEST TO getOrderLinePreRequisites: ', req.body);
    console.log('EXPRESS REQUEST TO getOrderLinePreRequisites  11: ', req.body.payload);
    if (mock.isMock) {
        res.json(mock.getOrderLinePreRequisites)
    } else {
        const param = req.body.orderId;
        console.log('EXPRESS REQUEST TO getOrderLinePreRequisites: else loop ', param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/ordergateway//productorder/orderPreRequisites' + '?orderId=' + param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            preReqList = themeResp.data;
            if (preReqList != null) {
                preReqList.responseObject.forEach(ele => {
                    //console.log("ele log::::",ele);
                    if (ele.status == "PENDING") {
                        ele.icon = "heroicons_solid:exclamation-circle";
                    }
                    else if (ele.status == "COMPLETED") {
                        ele.icon = "heroicons_solid:check-circle"
                    }
                    else if (ele.status == "APPROVED") {
                        ele.icon = "heroicons_solid:exclamation-circle"
                    }
                    else if (ele.status == "REJECTED") {
                        ele.icon = "heroicons_solid:x-circle"
                    }
                    else if (ele.status == "NEW") {
                        ele.icon = "heroicons_solid:exclamation-circle"
                    }
                })
            }

            //printlog(themeResp.data);
            res.json(preReqList);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});



router.post('/getOrderLinePreRequisitesForOP', (req, res) => {
    console.log('EXPRESS REQUEST TO getOrderLinePreRequisitesForOP: ', req.body);
    console.log('EXPRESS REQUEST TO getOrderLinePreRequisitesForOP  11: ', req.body.payload);
    if (mock.isMock) {
        res.json(mock.getOrderLinePreRequisitesForOP)
    } else {
        const param = req.body;
        console.log('EXPRESS REQUEST TO getOrderLinePreRequisitesForOP: else loop ', param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/ordergateway//productorder/orderPreRequisites' + '?orderId=' + param.orderId + '&orderLineId=' + param.orderLineId, req.session.options)
        ]).then(axios.spread((themeResp) => {
            preReqList = themeResp.data;
            // console.log("themeResp:::OP",themeResp)
            // console.log("themeResp:::OP",themeResp.data)
            if (preReqList != null) {
                preReqList.responseObject.forEach(ele => {
                    //console.log("ele log::::",ele);
                    if (ele.status == "PENDING") {
                        ele.icon = "heroicons_solid:exclamation-circle";
                    }
                    else if (ele.status == "COMPLETED") {
                        ele.icon = "heroicons_solid:check"
                    }
                    else if (ele.status == "APPROVED") {
                        ele.icon = "heroicons_solid:exclamation-circle"
                    }
                    else if (ele.status == "REJECTED") {
                        ele.icon = "heroicons_solid:x-circle"
                    }
                    else if (ele.status == "NEW") {
                        ele.icon = "heroicons_solid:exclamation-circle"
                    }
                })
            }

            //printlog(themeResp.data);
            res.json(preReqList);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/getProductDetailsList', (req, res) => {
    console.log("Api getProductDetailsList:: ", req.body);

    if (mock.isMock) {
        res.json(mock.getProductDetailsList)
    } else {
        const param = req.body.payload;
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/orderitem/details' + '?orderId=' + param.orderId + '&orderLineId=' + param.orderLineId + '&fields=' + param.from + '&limit=' + param.limit, req.session.options)
        ]).then(axios.spread((themeResp) => {
            let productDetailsFinal;
            let response = {};
            let price = [];
            if (themeResp != null && themeResp.data != null) {
                productDetailsFinal = themeResp.data;
                console.log("productDetailsFinal::::", productDetailsFinal);
                productDetailsFinal.forEach(element => {
                    //console.log("element.productOrderItem:::", element)

                    if (element.itemTotalPrice != null) {
                        element.itemTotalPrice.forEach(totalPrice => {
                            console.log("price:::", totalPrice);

                            let totalPrice1 = {};
                            totalPrice1.priceType = totalPrice.priceType;
                            totalPrice1.currency = totalPrice.price.dutyFreeAmount.unit;
                            totalPrice1.amount = totalPrice.price.dutyFreeAmount.value;
                            price.push(totalPrice1);

                        })
                    }
                })
            }
            response = orderProfile_services.getProductItemCustomizationDetailsOrderProfile(productDetailsFinal);
            //res.json(response);
            res.json({ responseObj: response, chargeSummary: price, statuscode: '200' });

        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/statusDetailsList', (req, res) => {
    console.log('EXPRESS REQUEST TO statusDetailsList: ', req.body);
    console.log('EXPRESS REQUEST TO statusDetailsList  11: ', req.body.payload);
    if (mock.isMock) {
        res.json(mock.statusDetailsList)
    } else {
        const param = req.body.payload;
        console.log('EXPRESS REQUEST TO statusDetailsList: else loop ', param);
        let baseUrl;
        if (param.systemCategoryID != null) {
            baseUrl = '/hobsrestgateway/omconsoleservices/order/orderline/platform/status' + '?orderLineID=' + param.orderLineID + '&systemCategoryID=' + param.systemCategoryID

        }
        else {
            baseUrl = '/hobsrestgateway/omconsoleservices/order/orderline/platform/status' + '?orderLineID=' + param

        }
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + baseUrl, req.session.options)
        ]).then(axios.spread((themeResp) => {
            statusList = themeResp.data;
            console.log('statusList:::: ', statusList);

            if (statusList != null) {
                statusList.platformStatus.forEach(element => {
                    if (element.status == "COMPLETED") {
                        element.statusColor = "bg-green-100 text-green-600"
                    }
                    else if (element.status == "NOT_APPLICABLE") {
                        element.statusColor = "bg-blue-100 text-blue-500"
                    }
                    else if (element.status == "INPROGRESS" || element.status == "IN_PROGRESS") {
                        element.statusColor = "bg-red-100 text-red-500"
                    }
                    else if (element.status == "SUBMITTED") {
                        element.statusColor = "bg-green-100 text-green-600"
                    }
                    else if (element.status == "ERRORED") {
                        element.statusColor = "bg-red-100 text-red-500"
                    }
                    statusList.platformStatus[element.platformID] = element;
                });
                statusList.systemSummaryStatus.forEach(ele => {
                    if (ele.statusCode == "COMPLETED") {
                        ele.statusColor = "bg-green-100 text-green-600"
                    }
                    else if (ele.statusCode == "NOT_APPLICABLE") {
                        ele.statusColor = "bg-blue-100 text-blue-500"
                    }
                    else if (ele.statusCode == "INPROGRESS" || ele.statusCode == "IN_PROGRESS") {
                        ele.statusColor = "bg-red-100 text-red-500"
                    }
                    else if (ele.statusCode == "SUBMITTED") {
                        ele.statusColor = "bg-green-100 text-green-600"
                    }
                    else if (ele.statusCode == "ERRORED") {
                        ele.statusColor = "bg-red-100 text-red-500"
                    }
                    statusList.systemSummaryStatus[ele.externalSystemID] = ele;
                });
            }

            console.log("statusList actual api call::", statusList)

            //printlog(themeResp.data);
            // res.json(statusList);
            res.json({ responseObj: statusList, statuscode: '200' });
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});



router.post('/orderLineContactDetails', (req, res) => {
    console.log('EXPRESS REQUEST TO orderLineContactDetails: ', req.body);
    console.log('EXPRESS REQUEST TO orderLineContactDetails  11: ', req.body.payload);
    if (mock.isMock) {
        res.json(mock.orderLineContactDetails)
    } else {
        const param = req.body.payload;
        console.log('EXPRESS REQUEST TO orderLineContactDetails: else loop ', param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/order/orderline/contacts' + '?orderId=' + param.orderId + '&orderLineId=' + param.orderLineId, req.session.options)
        ]).then(axios.spread((themeResp) => {

            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/orderProfileProductsTabHeader', (req, res) => {
    console.log('EXPRESS REQUEST TO orderProfileProductsTabHeader: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO orderProfileProductsTabHeader PARAM: ', param, req.session.options);
    if (mock.isMock)
        res.json(formdata.orderProfileProductsTabHeader);
    else {
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + 'order.profile.products.tab', req.session.options)
        ]).then(axios.spread((themeResp) => {
            //console.log("themeResp::::", themeResp.data);
            res.json(JSON.parse(themeResp.data.responseObject.formData));
        }));
    }
});



router.post('/getStepperJsonForChangePayer', (req, res) => {
    console.log("getStepperJsonForChangePayer req -->", req)
    // if(mock.isMock){
    res.json(mock.stepperJsonForChangePayer)
    // }
    // else{
    // res.json(formdata.stepperJsonForChangePayer)


});
router.post('/getHeaderListChangePayer', (req, res) => {
    console.log("getHeaderListChangePayer req -->", req)
    // if(mock.isMock){
    res.json(formdata.headerListChangePayer)
    // }
    // else{
    // res.json(formdata.headerListChangePayer)
    // }
})

router.post('/getPartyDetails/accountapp', (req, res) => {
    if (mock.isMock) {
        res.json(mock.accountPartyDetails)
    }
    else {
        res.json(mock.accountPartyDetails)
        //   const param = req.body;
        //   console.log("param serverdev findaccount:::", param);
        //   // res.json(mock.customerPartyDetails);
        //   axios.all([
        //     axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/account', param
        //       , req.session.options)
        //   ]).then(axios.spread((themeResp) => {
        //    // console.log("themeResp::::", themeResp);
        //     //printlog(themeResp.data);
        //     res.json(themeResp.data);
        //   })).catch(error => {
        //     handleServiceErros(error, res);
        //   });
    }
});
router.post("/subscriberapp/makePayment", (req, res) => {
    if (mock.isMock) {
        console.log("enter in serverDev makePaymentCE");
        res.json(mock.makePaymentSubscriberApp);
    } else {
        res.json(mock.makePaymentSubscriberApp);
    }
});
router.post('/dashboard360/customerDetails', (req, res) => {
    if (mock.isMock) {
        console.log("dashboard360 req body:::")
    } else {
        console.log("dashboard360 req body:::", req.body.context.customerId)
        console.log("dashboard360 req body:::", req.body.context.customerAttribute)
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/HOBSAnalytics/dataservice/getCustomerDetails?customerId=' + req.body.context.customerId + '&customerAttribute=' + req.body.context.customerAttribute)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post("/subscriberapp/adjustPayment", (req, res) => {
    if (mock.isMock) {
        console.log("enter in serverDev adjustPayment");
        res.json(mock.adjustPayment);
    } else {
        //res.json(mock.adjustPayment);
        const param = req.body;
        console.log('adjustPayment', param)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/preCloseInstalments', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp);
            console.log('adjustPayment', themeResp)
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/subscriberapp/getActiveInstalmentsContextMenu', (req, res) => {
    console.log('EXPRESS REQUEST TO getActiveInstalmentsContextMenu------------>: ', req.body);
    if (mock.isMock) {
        res.json(mock.getActiveInstalments);
    } else {
        // res.json(mock.getActiveInstalments);
        const param = req.body.subscriberID;
        console.log("param serverdev getActiveInstalmentsContextMenu:::", param);
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/getActiveInstalments?subscriberID=' + param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            console.log(" getActiveInstalmentsContextMenu:::response", themeResp.data);
            let response = themeResp.data
            res.json(subscriberApp_services.getActiveInstalmentsContextMenu(response));
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/dashboard360/getCustomerTimeLineIntractionDetails', (req, res) => {
    console.log('EXPRESS REQUEST TO getInteractions: ', req.body);
    if (mock.isMock) {
        res.json(mock.getInteractions);
    } else {

        var param = req.body.customerId;
        console.log('EXPRESS REQUEST TO getInteractions1: ', param);
        if (typeof req.body.row != null && req.body.row != undefined) {
            console.log('EXPRESS REQUEST TO getInteractions1: ', req.body.row);
            param = param + '&rows=' + req.body.row;
            console.log('EXPRESS REQUEST TO getInteractions1: ', param);
        }
        console.log("this is URL:", app.get('apiPrefix') + '/HOBSAnalytics/dataservice/getInteractions?customerId=' + param)
        axios.all([axiosInstance.get(app.get('apiPrefix') + '/HOBSAnalytics/dataservice/getInteractions?customerId=' + param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.get('/changePayerApp/payerListTableSetting', (req, res) => {
    console.log('EXPRESS REQUEST TO getAppUrl: ');
    res.json(formdata.changePayerTableSettings);

});

router.get('/changePayerApp/getPayerListHeader', (req, res) => {
    console.log('EXPRESS REQUEST TO getAppUrl: ');
    res.json(formdata.payerListHeader);
});
router.get('/changeOwnerApp/getChangeOwnerSubscriptionsHeader', (req, res) => {
    console.log('EXPRESS REQUEST TO getAppUrl: ');
    res.json(formdata.changeOwnerSubscriptionsHeader);
});

router.post('/changePayerApp/getSubscriptionCount', (req, res) => {
    console.log('EXPRESS REQUEST TO getAppUrl: ');
    if (!mock.isMock) {
        let dummy = {
            "responseStatusList": {
                "status": [
                    {
                        "statusCode": "0000",
                        "statusName": "informational",
                        "statusDescription": "SUCCESS",
                        "statusType": "SUCCESS",
                        "statusCategory": "SUCCESS"
                    }
                ]
            },
            "responseObject": {
                "accountID": "A36223124",
                "totalSubscriptions": "3",
                "activeSubscriptions": "1"
            }
        }
        res.json(dummy);
    } else {
        const param = req.body;
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/account/getNumberOfSubscriptions?accountId=' + param.accountId, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/changePayerApp/listOfAccountDetails', (req, res) => {
    console.log('EXPRESS REQUEST TO getAppUrl: ');
    if (mock.isMock) {
        let dummy = mock.changePayerListOfAccDetails;
        dummy.responseObject.accountData.forEach(element => {
            element.payerAddress = element.contact[0].stringifiedAddress;
        });
        res.json(dummy);
    } else {
        const param = req.body;
        console.log("parammmmmm-CP list of all accounts : ", param)
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/searchByCriteria', param, req.session.options)
        ]).then(axios.spread((themeResp) => {
            //printlog(themeResp);
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/changePayerApp/submitChangePayer', (req, res) => {
    console.log('EXPRESS REQUEST TO getAppUrl: ');
    if (!mock.isMock) {
        // let dummy = mock.changePayerListOfAccDetails;
        // dummy.responseObject.accountData.forEach(element => {
        //     element.payerAddress = element.contact[0].stringifiedAddress;
        // });
        res.json({ orderID: "BO0-12345" });
    } else {
        // const param = req.body;
        // axios.all([
        //     axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/account/getNumberOfSubscriptions?accountId=' + param.accountId, req.session.options)
        // ]).then(axios.spread((themeResp) => {
        //     //printlog(themeResp);
        //     res.json(themeResp.data);
        // })).catch(error => {
        //     handleServiceErros(error, res);
        // });
    }
});

function sendSSE(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    let counter = 0;
    var id = (new Date()).toLocaleTimeString();
    // Sends a SSE every 5 seconds on a single connection. 
    setInterval(function () {
        constructSSE(res, id, (new Date()).toLocaleTimeString(), ++counter);
    }, 5000);
    setInterval(function () {
        constructSSE(res, id, (new Date()).toLocaleTimeString(), ++counter);
    }, 2000);
    //constructSSE(res, id, (new Date()).toLocaleTimeString(),++counter); 
}

function constructSSE(res, id, data, counter) {
    //res.write('id: ' + id + '\n'); 
    res.write("data: " + JSON.stringify(mock.initiateBulkChange1) + '\n\n');
}
module.exports = router;
