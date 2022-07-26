
var winston = require('./winston');
var express = require('express');
var router = express.Router();
const mock = require('./mockResp.js');
const axios = require('axios');
var app = express();

const envConst = require('./envConst.js');
const https = require('https');
const formdata = require('./dashboardforms.js');
const { element } = require('protractor');

app.set('contextPath', 'https://' + envConst.HOST + ':' + envConst.PORT + envConst.APP_CONTEXT);
app.set('apiPrefix', 'https://' + envConst.API_PREFIX);
app.set('envLogServicePrefix', 'https://' + envConst.HOST + ':' + envConst.PORT);
app.set('envDevelopmentMode', envConst.ENV_DEVELOPMENT_MODE);
app.set('envLogLevel', envConst.ENV_LOGLEVEL);
console.log('-----', envConst.API_PREFIX);
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

var user = { cas_user: null, cas_user_info: {} };
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

// let req.session.options = {
//   headers: {
//     'Content-Type': 'application/json',
//     'opID': 'HOB',
//     'buID': 'DEFAULT',
//     'userID': 'fo_user',
//     'Authorization': 'Basic Zm9fdXNlcjpmb191c2Vy',
//     'lang': 'ENG',
//     'channel': 'CSA',
//     'language': 'ENGLISH'
//   }
// };


function handleServiceErros(error, res) {
  // printlog('ERROR in calling service : ', response.config.url);
  if (error.response) {
    // Request made and server responded
    printlog(error.response.data);
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
  // console.log("getToken--customer--->", req.session);
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
        //console.log("themeResp-customer-", themeResp.data);
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
        console.log("options-setting customer in session-", req.session.options);
        res.json(user);
      })
    )
    .catch((error) => { console.error("error here --->", error) });
}

router.get("/customer/user", (req, res) => {
  //printlog('EXPRESS : /user start');
  if (mock.isMock) {
    res.json(mock.user);
  }
  let sessionUser = "";
  console.log("/api/user-customer-");
  // if (envConst.ENV == "prod") sessionUser = req.session.cas.user;
  // else 
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

router.get('/logoutHost', (req, res) => {
  console.log('EXPRESS REQUEST TO logoutHost: ', envConst.CAS_PREFIX);
  res.json(envConst.CAS_PREFIX);

});
router.post('/getRefDependentDataFinal', (req, res) => {
  console.log('enter in apiorder Dependent getRefData', req.body);
  if (mock.isMock) {
    console.log("mock for dependnecy")
    const param = req.body;
    let referanceName = req.body["referenceName"];
    let refVal = req.body["reqValue"];
    console.log('enter in apiorder dependency getRefData mock true', referanceName, refVal);

    if (referanceName == "COUNTRY") {
      if (refVal == "India") {
        let resfrmock = mock.stateIndia;
        console.log(resfrmock[0].refValues)
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject)
        res.json(resObject);
      }
      else if (refVal == "United States") {
        let resfrmock = mock.stateUS;
        console.log(resfrmock[0].refValues)
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject)
        res.json(resObject);
      }
    }
    else if (referanceName == "State") {
      if (refVal == "Texas") {
        let resfrmock = mock.cityTexas;
        console.log(resfrmock[0].refValues)
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject)
        res.json(resObject);
      }
      else if (refVal == "California") {
        let resfrmock = mock.cityCalifornia;
        console.log(resfrmock[0].refValues)
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject)
        res.json(resObject);
      }
      else if (refVal == "TamilNadu") {
        let resfrmock = mock.cityTN;
        console.log(resfrmock[0].refValues)
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject)
        res.json(resObject);
      }
      else if (refVal == "Kerala") {
        let resfrmock = mock.cityKerala;
        console.log(resfrmock[0].refValues)
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject)
        res.json(resObject);
      }
      else if (refVal == "Karnataka") {
        let resfrmock = mock.cityKarnataka;
        console.log(resfrmock[0].refValues)
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }

        console.log("resObject--->", resObject)
        res.json(resObject);
      }

    }
    else if (referanceName == "INVOICE_MEDIA") {
      if (refVal == "Email Only") {
        let resfrmock = mock.invoiceFormatEmail;
        console.log(resfrmock[0].refValues)
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject)
        res.json(resObject);
      }
      if (refVal == "Paper") {
        let resfrmock = mock.invoiceFormatPaper;
        console.log(resfrmock[0].refValues)
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject)
        res.json(resObject);
      }
      if (refVal == "WhiteMail and Email") {
        let resfrmock = mock.invoiceFormatWhitemailandEmail;
        console.log(resfrmock[0].refValues)
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject)
        res.json(resObject);
      }
    }

    //console.log('res/////', res.json(mock.stateIndia))
  }
  else {

    let baseUrl = '/tibchassisrestservice/rest/referencedataservice/refdatadependencyauth/context/'
    let domain = req.body["domain"];
    let context = req.body["context"];
    let entity = req.body["entity"];
    let referanceName = req.body["referenceName"];
    let refVal = req.body["reqValue"];

    const param = req.body;
    console.log("domain part", req.body.domain);
    console.log("context part", context);
    console.log("entity part", entity);
    console.log("referanceName part", referanceName);
    console.log("refVal part", refVal);

    baseUrl = baseUrl + context + '/domain/' + domain + '/entity/' + entity + '/referenceName/' + referanceName + '/referenceValue/' + refVal + '?opId=' + req.session.options.headers.opID + '&buId=' + req.session.options.headers.buID + '&language=' + req.session.options.headers.lang + '&userId=' + req.session.options.headers.userID;
    console.log("baseUrl for dependency", baseUrl);

    axios.all([
      axiosInstance.get(app.get('apiPrefix') + baseUrl
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      var resObject = [];
      console.log("ACCT_SEGMENT////", themeResp)

      for (index = 0; index < themeResp.data[0].refValues.length; index++) {
        console.log(themeResp.data[0].refValues[index]);
        var map = {};
        map["value"] = themeResp.data[0].refValues[index].id;
        map["label"] = themeResp.data[0].refValues[index].displayText;
        map["disabled"] = true;
        resObject.push(map);
      }
      console.log("resObject--->", resObject)
      res.json(resObject);
    })).catch(error => {
      console.log("error", error)
      handleServiceErros(error, res);
    });
  }
});

router.post('/getRefData', (req, res) => {
  console.log('enter in apiorder Dependent getRefData', req.body);
  if (mock.isMock) {

    if (req.body.domain == 'ORDER-APP') {
      res.json(mock.refDataOrderApp)
    }

    console.log("No mock response available :: ")
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

    baseUrl = baseUrl + domain + '/'
      + context + '/' + entity + '/' + '?opId=' + req.session.options.headers.opID + '&buId=' + req.session.options.headers.buID + '&language=' + req.session.options.headers.lang + '&userId=' + req.session.options.headers.userID;
    console.log("baseUrl", baseUrl);

    axios.all([
      axiosInstance.get(app.get('apiPrefix') + baseUrl
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      console.log("ACCT_SEGMENT////", themeResp)
      var resObject = [];
      console.log("ACCT_SEGMENT////", themeResp)

      res.json(themeResp.data);
    })).catch(error => {
      console.log("error", error)
      handleServiceErros(error, res);
    });
  }
});

router.post('/addrelatednotes', (req, res) => {
  console.log("addrelatednotes API :: ");
  if (mock.isMock) {
    console.log("addrelatednotes API :: ", mock.isMock);
    res.json(mock.relatednotes)
  }
  else {
    const param = req.body;
    console.log("param addrelatednotes:::", param);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/addRelatedEntities', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getrelatednotes', (req, res) => {
  console.log("getrelatednotes API :: ", req.body);
  if (mock.isMock) {
    console.log("addrelatednotes API :: ", mock.isMock);
    res.json(mock.getrelatednotes)
  }
  else {
    const param = req.body;
    console.log("param getrelatednotes:::", param.cartid);
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/getRelatedEntitiesByCartId?cartInstanceIdentifier=' + param.cartid,
        req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp.data);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});


router.post('/getRefDataFinal/order', (req, res) => {
  console.log('enter in apiorder getRefData', req.body);
  if (mock.isMock) {
    const param = req.body;
    const speci = req.body.referanceName;
    console.log('enter in apiorder getRefData', speci);
    if (speci == "CURRENCY") {
      res.json(mock.CURRENCY)
    }
    else if (speci == "ACCT_SEGMENT") {
      res.json(mock.ACCT_SEGMENT)
    }
    else if (speci == "TAX_CODE") {
      res.json(mock.TAX_CODE)
    }
    else if (speci == "PARTY_TYPE" && req.body.entity == "ACCOUNT") {
      res.json(mock.PARTY_TYPE)
    }
    else if (speci == "CONTACT_ROLE" && req.body.entity == "ACCOUNT") {
      res.json(mock.CONTACT_ROLE)
    }
    else if (speci == "PAYMENT_MODE") {
      res.json(mock.PAYMENT_MODE)
    }
    else if (speci == "ACCOUNT_TYPE") {
      res.json(mock.ACCOUNT_TYPE)
    }
    else if (speci == "INVOICE_MEDIA") {
      res.json(mock.invoicemedia)
    }
    else if (req.body.referanceName == "TITLE") {
      res.json(mock.title);
      console.log("after getting mock", res.json(mock.title));
    }
    else if (req.body.referanceName == "BILL_FREQUENCY") {
      res.json(mock.billFreq);
      console.log("after getting mock", res.json(mock.billFreq));
    }
    else if (req.body.referanceName == "BILL_CYCLE") {
      res.json(mock.billCycle);
      console.log("after getting mock", res.json(mock.billCycle));
    }
    else if (req.body.referanceName == "INVOICE_PREFEENCE") {
      res.json(mock.invoicePref);
      console.log("after getting mock", res.json(mock.invoicePref));
    }
    else if (req.body.referanceName == "CONTACT_ROLE" && req.body.entity == "CUSTOMER") {
      res.json(mock.contactRole);
      console.log("after getting mock", res.json(mock.contactRole));
    }

    else if (req.body.referanceName == "PARTY_TYPE" && req.body.entity == "CUSTOMER") {
      res.json(mock.partyTypeForCust);
      console.log("after getting mock", res.json(mock.partyTypeForCust));
    }
    else if (speci == "COUNTRY") {
      res.json(mock.COUNTRY)
    }

    console.log('res/////', res.json(mock.getRefData))
  }
  else {

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

    baseUrl = baseUrl + domain + '/'
      + context + '/' + entity + '/' + referanceName + '?opId=' + req.session.options.headers.opID + '&buId=' + req.session.options.headers.buID + '&language=' + req.session.options.headers.lang + '&userId=' + req.session.options.headers.userID;
    console.log("baseUrl", baseUrl);

    axios.all([
      axiosInstance.get(app.get('apiPrefix') + baseUrl
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      console.log("ACCT_SEGMENT////", themeResp)
      var resObject = [];
      console.log("ACCT_SEGMENT////", themeResp)

      res.json(themeResp.data);
    })).catch(error => {
      console.log("error", error)
      handleServiceErros(error, res);
    });
  }
});

router.post('/getCustomer', (req, res) => {
  if (mock.isMock) {
    res.json(mock.viewcusRes);
  } else {
    //printlog('EXPRESS REQUEST TO searchCustomer: ', req._parsedUrl.pathname, req.body);
    const param = req.body.customerid;
    console.log('EXPRESS REQUEST TO getCustomer PARAM: ',param);  
    console.log('Jananee',req.session)
    axios.all([axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/crmservices/openApi/customer/get/'+ param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      console.log("getCustomer jananee",themeResp.data)
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/searchCustomer', (req, res) => {
  if (mock.isMock) {
    res.json(mock.searchGlobal);
  } else {
    //printlog('EXPRESS REQUEST TO searchCustomer: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO searchCustomer PARAM: ',param);  
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/details', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getPaymentReceipt', (req, res) => {
  if (mock.isMock) {
    console.log('enter in serverDev getPaymentReceipt');
    res.json(mock.getPaymentReceipt)
  }
  else {
    res.json(mock.getPaymentReceipt)
  }
});

router.post('/getEligibleProductOffering/order', (req, res) => {
  if (mock.isMock) {
    res.json(mock.eligibleProductOffering)
  } else {

    //printlog('EXPRESS REQUEST TO getEligibleProductOffering: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    delete param["feasibilityResponse"];
    console.log("Paramm :: ", param)
    //printlog('EXPRESS REQUEST TO getEligibleProductOffering PARAM: ',param); 
    axios.all([
      //axiosInstance.post(app.get('apiPrefix')+'/hobsrestgateway/cartservices/cart/getEligibleProductOffering/v2',param
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/getEligibleProductOffering/v2?from=0&size=3000', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
})

router.post('/getServiceList', (req, res) => {
  if (mock.isMock) {
    res.json(mock.servicesList)
  } else {
    console.log('EXPRESS REQUEST TO getServiceList: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    console.log('EXPRESS REQUEST TO getServiceList PARAM: ', param);

    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/TIBPCServices/services/getServiceList', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
})


router.post('/getAppConfigJson', (req, res) => {
  if (mock.isMock) {
    res.json(mock.getAppConfigJson)
  } else {

    const param = req.body.projectName;
    console.log("param App COnfig :: ", param)
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


router.post('/getcartforsubscription', (req, res) => {
  if (mock.isMock) {
    res.json(mock.getcartforsubscription)
  } else {

    //printlog('EXPRESS REQUEST TO getcartforsubscription: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO getcartforsubscription PARAM: ',param);  
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/loadSubscribedProductsInCart', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
})

router.post('/feasibilityCheck', (req, res) => {
  if (mock.isMock) {
    res.json(mock.feasibilityCheck)
  } else {
    // delete req.body["formData"];
    // console.log("Request :: form data ",req.body);

    res.json(mock.feasibilityCheck)
    // const param = req.body;
    // console.log("param feasibility :::", param)
    // axios.all([
    //   axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/services/serviceQualification', param
    //     , req.session.options)
    // ]).then(axios.spread((themeResp) => {
    //   res.json(themeResp.data);
    // })).catch(error => {
    //   handleServiceErros(error, res);
    // });
  }
})

router.post('/contact/getFormatedAddressData', (req, res) => {
  if (mock.isMock) {
    res.json(mock.feasibilityCheck)
  } else {
    var address = {};
    console.log("Request for Format Address Data :: ", req.body.inputFormArrayAddress)
    console.log("Request for Format Address Data :: ", req.body.selectedAddress)
    if (undefined != req.body.selectedAddress.addressLine1 && null != req.body.selectedAddress.addressLine1) {
      address["addressLine1"] = req.body.selectedAddress.addressLine1;
    } if (undefined != req.body.selectedAddress.addressLine2 && null != req.body.selectedAddress.addressLine2) {
      address["addressLine2"] = req.body.selectedAddress.addressLine2
    } if (undefined != req.body.selectedAddress.addressLine3 && null != req.body.selectedAddress.addressLine3) {
      address["addressLine3"] = req.body.selectedAddress.addressLine3
    } if (undefined != req.body.selectedAddress.city && null != req.body.selectedAddress.city) {
      address["city"] = req.body.selectedAddress.city
    } if (undefined != req.body.selectedAddress.state && null != req.body.selectedAddress.state) {
      address["state"] = req.body.selectedAddress.state
    } if (undefined != req.body.selectedAddress.country && null != req.body.selectedAddress.country) {
      address["country"] = req.body.selectedAddress.country
    } if (undefined != req.body.selectedAddress.pincode && null != req.body.selectedAddress.pincode) {
      address["pincode"] = req.body.selectedAddress.pincode
    }

    console.log("JSON Object for Address Format address :: ", address)
    let addressUpdatedArray = req.body.inputFormArrayAddress;
    let keyArr = Object.keys(address)
    for (let i = 0; i < addressUpdatedArray.length; i++) {
      for (let key of keyArr) {
        if (key == addressUpdatedArray[i].key) {
          console.log("Inside addressUpdatedArray -- ")
          if (addressUpdatedArray[i].type != "button") {
            addressUpdatedArray[i].value = address[key]
          }
        }
      }
    }

    console.log("addressUpdatedArrayaddressUpdatedArray ----  ", addressUpdatedArray)
    res.json(addressUpdatedArray)

  }
})

router.post('/getShoppingCart', (req, res) => {
  if (mock.isMock) {
    res.json(mock.getShoppingCart)
  } else {

    //printlog('EXPRESS REQUEST TO getcartforsubscription: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO getcartforsubscription PARAM: ',param);  
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/getShoppingCart', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
})


router.post('/getShoppingCartByUser', (req, res) => {
  if (mock.isMock) {
    res.json(mock.addToCart)
  } else {

    //  console.log('EXPRESS REQUEST TO getShoppingCartByUser: ', req._parsedUrl.pathname);
    const param = req.body.userID;
    //  console.log('EXPRESS REQUEST TO getcartforsubscription PARAM: ',param);  
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/getShoppingCartByUser/?userToken=' + param,
        req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/addAppointment', (req, res) => {
  if (mock.isMock) {
    res.json(mock.addAppointment)
  } else {
    // res.json(mock.addAppointment)
    const param = req.body;
    console.log(param);
    if (null != param["getSlotResponse"]) {
      console.log("param removed");
      delete param["getSlotResponse"];
    }
    console.log(param);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/appointment/addAppointment/' + req.body.cartInstanceIdentifier, param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
})

router.post('/editAppointment', (req, res) => {
  if (mock.isMock) {
    res.json(mock.editAppointment)
  } else {
    // res.json(mock.editAppointment)
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/appointment/editAppointment/' + req.body.cartInstanceIdentifier, param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
})

router.post('/removeAppointment', (req, res) => {
  if (mock.isMock) {
    res.json(mock.removeAppointment)
  } else {
    // res.json(mock.removeAppointment)
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/appointment/removeAppointment/' + req.body.cartInstanceIdentifier, param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
})

router.post('/getAppointment', (req, res) => {
  if (mock.isMock) {
    res.json(mock.getAppointmentDetails)
  } else {
    // res.json(mock.getAppointmentDetails)
    const urlString = req.body.cartInstanceIdentifier;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/appointment/retrieveAppointment/' + urlString
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
})

router.post('/getAppointmentSlots', (req, res) => {

  if (mock.isMock) {
    res.json(mock.getAppointmentSlots)
  } else {
    // res.json(mock.getAppointmentSlots)
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/appointment/searchAppointment', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
})

router.post('/getcustomerSubscriptions', (req, res) => {

  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    //printlog('EXPRESS REQUEST TO getcustomerSubscriptions: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    // printlog('EXPRESS REQUEST TO getcustomerSubscriptions PARAM: ',param);  
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/details', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //  printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.get('/sseEvents', (req, res) => {
  sendSSE(req, res);
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
  constructSSE(res, id, (new Date()).toLocaleTimeString(), ++counter);
}

function constructSSE(res, id, data, counter) {
  //res.write('id: ' + id + '\n'); 
  res.write("data: " + JSON.stringify(mock.addToCart) + '\n\n');
}

function debugHeaders(req) {
  sys.puts('URL: ' + req.url);
  for (var key in req.headers) {
    sys.puts(key + ': ' + req.headers[key]);
  }
  sys.puts('\n\n');
}

router.get('/getColelctionCheck', (req, res) => {
  if (mock.isMock) {
    res.json(mock.collectionCheck)
  } else {
    res.json(mock.collectionCheck)
  }
});

router.get('/getCreditCheck', (req, res) => {
  if (mock.isMock) {
    res.json(mock.creditCheck)
  } else {
    res.json(mock.creditCheck)
  }
});

router.get('/validateOrder', (req, res) => {
  if (mock.isMock) {
    res.json(mock.validateOrder)
  } else {
    res.json(mock.validateOrder)
  }
});

router.post('/submitOrder/order', (req, res) => {
  if (mock.isMock) {
    res.json(mock.submitOrder)
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/submitOrder', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.get('/addInteraction', (req, res) => {
  if (mock.isMock) {
    res.json(mock.addInteraction)
  } else {
    res.json(mock.addInteraction)
  }
});

router.get('/sendNotification', (req, res) => {
  if (mock.isMock) {
    res.json(mock.sendNotification)
  } else {
    res.json(mock.sendNotification)
  }
});

router.get('/checkForShipping', (req, res) => {
  if (mock.isMock) {
    res.json(mock.checkForShipping)
  } else {
    res.json(mock.checkForShipping)
  }
});

router.post('/findAddress', (req, res) => {
  console.log("Api in customer-app:: ");
  if (mock.isMock) {
    res.json(mock.findAddress)
  } else {
    // res.json(mock.findAddress)
    const urlString = req.body.generalSearch;
    let baseUrl = '/hobsrestgateway/partymanagementservices/addressmanagement/findAddress?query='
    let addressLine1 = req.body.addressLine1;
    let addressLine2 = req.body.addressLine2;
    let addressLine3 = req.body.addressLine3;
    let citycode = req.body.citycode;
    let cityname = req.body.cityname;
    let stateOrProvince = req.body.statename;
    let countryname = req.body.countryname;

    if (req.body.generalSearch != null) {
      baseUrl = baseUrl + urlString
    } else {

      if (addressLine1 != '') {
        baseUrl = baseUrl + 'addressLine1=' + addressLine1 + '?'
      }
      if (addressLine2 != '') {
        baseUrl = baseUrl + 'addressLine2=' + addressLine2 + '?'
      }
      if (addressLine3 != '') {
        baseUrl = baseUrl + 'addressLine3=' + addressLine3 + '?'
      }
      if (citycode != '') {
        baseUrl = baseUrl + 'citycode=' + citycode + '?'
      }
      if (cityname != '') {
        baseUrl = baseUrl + 'city=' + cityname + '?'
      }
      if (stateOrProvince != '') {
        baseUrl = baseUrl + 'stateOrProvince=' + stateOrProvince + '?'
      }
      if (countryname != '') {
        baseUrl = baseUrl + 'countryCode=' + countryname
      }


      //baseUrl = baseUrl + 'addressLine1=' + addressLine1 + '?addressLine2=' + addressLine2 + '?addressLine3=' + addressLine3 + '?citycode=' + citycode + '?city=' + cityname + '?stateOrProvince=' + stateOrProvince + '?countryname=' + countryname
    }
    console.log("Base Url customer:: ", baseUrl)
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + baseUrl
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      var resObject = [];

      if (themeResp.data.statusList[0].statusCode == "0000") {
        console.log("Request for Format Address Data :: ", themeResp.data.address)

        themeResp.data.address.forEach(element => {
          var address = {};

          address["addressLine1"] = element.addressLine1;
          address["addressLine2"] = element.addressLine2
          address["addressLine3"] = element.addressLine3
          address["city"] = element.city
          address["state"] = element.stateOrProvince
          address["country"] = element.countryCode
          address["pincode"] = element.customAddress.addressAttributes.attribute[1].attributeValue

          resObject.push(address)
        });
        res.json(resObject);
      } else {
        res.json(themeResp.data);
      }
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/duplicateCustomerCheck', (req, res) => {
  console.log("Api :: ");
  if (mock.isMock) {
    res.json(mock.duplicateCustomerCheck)
  } else {
    // res.json(mock.duplicateCustomerCheck)
    const param = req;
    console.log("Request duplicatee customer check :: ", req)
    console.log("param serverdev:::", param);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/duplicateCheckCustomer/checkDuplicateCustomer', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.get('/creditCheck', (req, res) => {
  console.log("Api :: ");
  if (mock.isMock) {
    res.json(mock.creditCheckRes)
  } else {
    res.json(mock.creditCheckRes)
  }
});

router.post('/createCustomer', (req, res) => {
  console.log("Customer API :: ");
  if (mock.isMock) {
    res.json(mock.customer)
  }
  else {
    const param = req.body;
    console.log("param serverdev:::", param);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getShippingContact', (req, res) => {
  if (mock.isMock) {
    //printlog("entering to getShippingAddress mock api");
    res.json(mock.getShippingContact)
  } else {

    //const param = 
    customerId = req.body.customerID
    urlString = req.body.cartInstanceIdentifier
    console.log("getShippingContact req :::", req)
    console.log("getShippingContact req body:::", req.body)
    console.log("getShippingContact url :::", app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/getShippingContact/' + urlString)
    //res.json(mock.getShippingContact)
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/getShippingContact/' + urlString + '?customerId=' + customerId, req.session.options)
    ]).then(axios.spread((themeResp) => {
      printlog(themeResp);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getJSONFormData', (req, res) => {

  if (mock.isMock) {
    if (req.body.context.formId == 'order.app.basicDetails.capture') {
      res.json(mock.basicDetails)
    } else if (req.body.context.formId == 'order.app.basicDetailsB2C.capture') {
      res.json(mock.basicDetailsB2C)
    } else if (req.body.context.formId == 'order.app.basicDetailsB2B.capture') {
      res.json(mock.basicDetailsB2B)
    } else if (req.body.context.formId == 'order.app.basicAddressDetails.capture') {
      res.json(mock.basicAddressDetails)
    } else if (req.body.context.formId == 'order.app.serviceattributes.capture') {
      res.json(mock.serviceattributes)
    } else if (req.body.context.formId == 'order.app.organizationCustomer.capture') {
      res.json(mock.organizationCustomer)
    } else if (req.body.context.formId == 'order.app.individualCustomer.capture') {
      res.json(mock.individualCustomer)
    } else if (req.body.context.formId == 'order.app.customerAddress.capture') {
      res.json(mock.customerAddress)
    } else if (req.body.context.formId == 'order.app.serviceAvailabilityAddressPF.capture') {
      res.json(mock.serviceAvailabilityAddressPF)
    } else if (req.body.context.formId == 'order.app.createContactAddress.capture') {
      res.json(mock.createContactAddress)
    } else if (req.body.context.formId == 'order.app.addContactAccountAddress.capture') {
      res.json(mock.addContactAccountAddress)
    } else if (req.body.context.formId == 'order.app.contactCreationOrganization.capture') {
      res.json(mock.contactCreationOrganization)
    } else if (req.body.context.formId == 'order.app.contactCreationIndividual.capture') {
      res.json(mock.contactCreationIndividual)
    } else if (req.body.context.formId == 'order.app.basicDetailsLeadCreation.capture') {
      res.json(mock.basicDetailsLeadCreation)
    } else if (req.body.context.formId == 'order.app.AdvanceSearchcustomerAddress.capture') {
      res.json(mock.advanceSearchCustomerAddress)
    }

  } else {

    console.log("getShippingContact req body:::", req.body)
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + req.body.context.formId, req.session.options)
    ]).then(axios.spread((themeResp) => {
      printlog(themeResp);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/addShippingContact', (req, res) => {
  if (mock.isMock) {
    res.json(mock.addShippingDetailsRes)
  } else {
    urlString = req.body.cartInstanceIdentifier
    console.log("addShippingContact req :::", req)
    console.log("addShippingContact req body:::", req.body)
    console.log("addShippingContact url :::", app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/addShippingContact/' + urlString)


    const param = req.body;
    console.log(param);

    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/addShippingContact/' + urlString, param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      printlog(themeResp);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/updateShippingContact', (req, res) => {
  if (mock.isMock) {
    res.json()
  } else {
    console.log("updateShippingContact req :::", req)
    console.log("updateShippingContact req body:::", req.body)
    console.log("updateShippingContact url :::", app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/updateShippingContact/' + req.body.cartInstanceIdentifier)
    urlString = req.body.cartInstanceIdentifier
    const param = req.body;
    console.log(param);
    axios.all([
      axiosInstance.patch(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/updateShippingContact/' + urlString, param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      printlog(themeResp);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/removeShippingContact', (req, res) => {
  if (mock.isMock) {
    res.json(mock.removeShippingContactRes)
  } else {
    console.log("removeShippingContact req :::", req)
    console.log("removeShippingContact req body:::", req.body)
    console.log("removeShippingContact url :::", app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/removeShippingContact/' + req.body.cartInstanceIdentifier)

    const param = req.body.contactIdentifier;
    console.log(param);

    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/removeShippingContact/' + req.body.cartInstanceIdentifier, param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      printlog(themeResp);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getShippingSummary', (req, res) => {
  if (mock.isMock) {
    res.json(mock.getShippingSummary)
  } else {
    console.log("getShippingSummary req :::", req)
    console.log("getShippingSummary req body:::", req.body)
    console.log("getShippingSummary url :::", app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/getShippingSummary/' + urlString)

    urlString = req.body.cartInstanceIdentifier
    //const param = req.body;
    //.json(mock.getShippingSummary)

    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/getShippingSummary/' + urlString, req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("Res ==== ", themeResp);
      res.json(themeResp.data);
    })).catch(error => {
      console.log("Error ====", error)
      handleServiceErros(error, res);
    });
  }
});

router.post('/addShippingDetailsForProducts', (req, res) => {
  if (mock.isMock) {
    res.json(mock.addShippingDetailsForProductsRes)
  } else {
    console.log("addShippingDetailsForProducts req :::", req)
    console.log("addShippingDetailsForProducts req body:::", req.body)
    console.log("addShippingDetailsForProducts url :::", app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/addShippingDetailsForProducts/' + req.body.cartInstanceIdentifier)

    const param = req.body;
    console.log(param);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/addShippingDetailsForProducts/' + req.body.cartInstanceIdentifier, param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      printlog(themeResp);
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
    //printlog('EXPRESS REQUEST TO getConfigurableOffer: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO getConfigurableOffer PARAM: ',param);  
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/getConfigurableItemForProductOffering', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getPricingBasedOnAttribute', (req, res) => {
  if (mock.isMock) {
    res.json(mock.pricingBasedOnAttribute)
  } else {
    //printlog('EXPRESS REQUEST TO getPricingBasedOnAttribute: ', req._parsedUrl.pathname, req.body);
    const param = req.body;

    //printlog('EXPRESS REQUEST TO getPricingBasedOnAttribute PARAM: ',param);  
    //printlog('EXPRESS REQUEST TO getPricingBasedOnAttribute PARAM: ',req.headers);  
    //printlog('EXPRESS REQUEST TO getPricingBasedOnAttribute PARAM: ',param.requestObject);  
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/configureBundle', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});


router.post('/reconfigureCartItem', (req, res) => {
  if (mock.isMock) {
    res.json(mock.addToCart)
  } else {
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

router.patch('/reconfigureCart', (req, res) => {
  if (mock.isMock) {
    res.json(mock.updateQuantity)
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.patch(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/reconfigureCart', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.patch('/associateCustomer', (req, res) => {
  if (mock.isMock) {
    res.json(mock.associateCustomer)
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.patch(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/associateCustomer', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.patch('/removeItemFromCart', (req, res) => {
  if (mock.isMock) {
    res.json(mock.removeItemFromCart)
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.patch(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/removeItemFromCart', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/updateItemQuantity', (req, res) => {
  if (mock.isMock) {
    res.json(mock.updateQuantity)
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/updateItemQuantity', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/addToCart', (req, res) => {
  if (mock.isMock) {
    //printlog('EXPRESS REQUEST TO addToCart from mock: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO addToCart PARAM from mock: ',param);  
    res.json(mock.addToCart)
  } else {
    //printlog('EXPRESS REQUEST TO addToCart: ', req._parsedUrl.pathname, req.body);
    const param = req.body;

    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',param);  
    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',req.headers);  
    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',param.requestObject);  
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/addItemToCart', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/addProductToCart', (req, res) => {
  if (mock.isMock) {
    //printlog('EXPRESS REQUEST TO addToCart from mock: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO addToCart PARAM from mock: ',param);  
    res.json(mock.addProductToCart)
  } else {
    //printlog('EXPRESS REQUEST TO addToCart: ', req._parsedUrl.pathname, req.body);
    const param = req.body;

    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',param);  
    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',req.headers);  
    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',param.requestObject);  
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/addProductToCart', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/addAddonToCart', (req, res) => {
  if (mock.isMock) {
    const param = req.body;
    res.json(mock.addAddonToCart)
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/addPreConfiguredProductToCart', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/changePrimaryOffering', (req, res) => {
  if (mock.isMock) {
    const param = req.body;
    res.json(mock.changePrimaryOffering)
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/changePrimaryOffering', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getContracts', (req, res) => {
  if (mock.isMock) {
    const param = req.body;
    res.json(mock.getContracts)
  } else {

    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/getContractsForProducts', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/confirmcart', (req, res) => {
  if (mock.isMock) {
    //printlog('EXPRESS REQUEST TO confirmcart: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',param);  
    res.json(mock.confirmcart)
  } else {
    //printlog('EXPRESS REQUEST TO confirmcart: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',param);  
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',req.headers);  
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',param.requestObject);  
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/confirmCart', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getMarketList', (req, res) => {
  if (mock.isMock) {
    console.log('enter in serverDev getMarketList');
    res.json(mock.getMarketList)
  }
  else {
    res.json(mock.getMarketList)
  }
});

router.post('/getReferenceData', (req, res) => {
  if (mock.isMock) {
    console.log('enter in serverDev getReferenceData');
    res.json(mock.getReferenceData)
  }
  else {
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

    baseUrl = baseUrl + domain + '/'
      + context + '/' + entity + '/' + referanceName + '?opId=' + req.session.options.headers.opID + '&buId=' + req.session.options.headers.buID + '&language=' + req.session.options.headers.lang + '&userId=' + req.session.options.headers.userID;
    console.log("baseUrl", baseUrl);

    axios.all([
      axiosInstance.get(app.get('apiPrefix') + baseUrl
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});
router.post('/getPartyDetails', (req, res) => {
  if (mock.isMock) {
    res.json(mock.customerPartyDetails)
  } else {
    const param = req.body;
    console.log("param serverdev getAccountContactDetails:::", param);
    // res.json(mock.customerPartyDetails);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partymanagement/search', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/searchPartyManagement', (req, res) => {
  if (mock.isMock) {
    res.json(mock.customerPartyDetails)
  } else {
    const param = req.body;
    console.log("param serverdev searchPartyManagement:::", param);
    // res.json(mock.customerPartyDetails);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partymanagement/search', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getAccountContactDetails', (req, res) => {
  if (mock.isMock) {
    res.json(mock.customerPartyDetails)
  } else {
    const param = req.body;
    console.log("param serverdev getAccountContactDetails:::", param);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partymanagement/search', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getAccountLookUpDetails', (req, res) => {
  if (mock.isMock) {
    res.json(mock.accountLookUpDetails)
  } else {
    const param = req.body;
    console.log("param serverdev getAccountLookUpDetails:::", param);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/account/details', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});


router.post('/getParentAccountDetail', (req, res) => {
  console.log("Api :: ", req.body);
  if (mock.isMock) {
    res.json(mock.getParentAccountDetail)
  } else {
    // res.json(mock.getParentAccountDetail)
    const param = req.body;
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',param);  
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',req.headers);  
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',param.requestObject);  
    console.log("Api ---:: ", param);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/details', param
        , req.session.options)
    ]).then(axios.spread((accountResp) => {
      console.log("accountResp :: ", accountResp.data);
      res.json(accountResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});
router.post('/getCountryRefData', (req, res) => {
  if (mock.isMock) {
    console.log('enter in apiorder getCountryRefData');
    res.json(mock.getCountryRefData)
  }
  else {
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

    baseUrl = baseUrl + domain + '/'
      + context + '/' + entity + '/' + referanceName + '?opId=' + req.session.options.headers.opID + '&buId=' + req.session.options.headers.buID + '&language=' + req.session.options.headers.lang + '&userId=' + req.session.options.headers.userID;
    console.log("baseUrl", baseUrl);

    axios.all([
      axiosInstance.get(app.get('apiPrefix') + baseUrl
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/createContact', (req, res) => {
  console.log("Contact API :: ");
  if (mock.isMock) {
    res.json(mock.contactForIndividual)
  }
  else {
    const param = req.body;
    console.log("param serverdev Contact:::", param);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/create', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});



router.post('/createContact/list', (req, res) => {
  console.log("Contact API :: ");
  if (mock.isMock) {
    res.json(mock.contactForIndividual)
  }
  else {
    const param = req.body;
    console.log("param serverdev Contact:::", param);
    param.forEach(element => {
      if (element.partyRoleType.partyRoleTypeID == 'PRIMARY' && element.party.partyType == 'INDIVIDUAL') {
        console.log("createContact------------setting ------->");
        element.party.customIndividualParty = {};
        element.party.customIndividualParty.individualAttributes = {};
        element.party.customIndividualParty.individualAttributes.attribute = [];
        let attr = {};
        attr.attributeName = "marketingPreference";
        attr.attributeValue = element.formData[0].marketingPreference;
        element.party.customIndividualParty.individualAttributes.attribute.push(attr);
      }
    })
    console.log("createContact------------------->", param);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/list/create', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});


router.post('/searchViewAllCustomer', (req, res) => {
  console.log("searchcustomer::::", req.body);
  const param = req.body;
  if (mock.isMock) {
    res.json(mock.searchViewAllCustomer);
  }
  else {
    res.json(mock.searchViewAllCustomer);

  }
});

router.post('/searchCustomerHeader', (req, res) => {
  console.log("searchCustomerHeader::::", req.body);
  const param = req.body.payload;
  if (mock.isMock) {
    if(param =="customer"){
    res.json(mock.searchCustomerHeader);
    }else if(param =="account"){
      res.json(mock.searchByAccountHeader);
    }else if(param =="primaryserviceidentifier"){
      res.json(mock.searchBySubscriberHeader);
    }

  }
  else {
    if (param == "customer") {
      res.json(mock.searchCustomerHeader);
    } else if (param == "account") {
      res.json(mock.searchByAccountHeader);
    }else if(param =="primaryserviceidentifier"){
      res.json(mock.searchBySubscriberHeader);
    }
  }
});

router.post('/getPartyDetails', (req, res) => {
  if (mock.isMock) {
    res.json(mock.customerPartyDetails)
  } else {
    const param = req.body;
    console.log("param serverdev findcustomer:::", param);
    // res.json(mock.customerPartyDetails);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/customer/findCustomer', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      // console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});


router.get('/testServer', (req, res) => {
  winston.info("**********************************************");
  winston.info("Node service is up and running. Test SUCCESS!!");
  winston.info("**********************************************");
  printlog("API Service is up!");
});

router.post('/testGetDNList', (req, res) => {

  if (req.body.reqValue == '044') {
    res.json(mock.getDropDownDN044);
  } else {
    res.json(mock.getDropDownDN042);
  }

});

router.post('/validateDN', (req, res) => {


  res.json(mock.validateDNReserved);

  //  res.json(mock.validateDNReserveFailure);


});


router.get('/getTreeData', (req, res) => {

  if (mock.isMock) {
    res.json(mock.getCLV);
  }
});

router.post('/bundle/items', (req, res) => {
  //printlog('EXPRESS REQUEST TO bundle/items: ', req._parsedUrl.pathname, req.body);
  const param = req.body;
  //printlog('EXPRESS REQUEST TO bundle/items PARAM: ',param);
  if (mock.isMock) {
    res.json(mock.bundleditems);
  }
});


router.post('/task/details', (req, res) => {
  //printlog('EXPRESS REQUEST TO task/details: ', req._parsedUrl.pathname, req.body);
  const param = req.body;
  //printlog('EXPRESS REQUEST TO task/details PARAM: ',param);
  if (mock.isMock) {
    res.json(mock.taskDetails);
  }
});

router.post('/products/search', (req, res) => {
  const param = req.body;
  if (mock.isMock) {
    res.json(mock.searchProducts);
  }
});




router.post('/postPayerDetail', (req, res) => {
  console.log("Api ::postPayerDetail ");
  if (mock.isMock) {
    res.json(mock.postPayerDetail)
  } else {
    const param = req.body;

    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/account', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/search/products/scope', (req, res) => {
  const param = req.body;
  winston.info("Get Scope Items::/search/products/scope::", mock.searchProductsScope);
  if (mock.isMock) {
    res.json(mock.searchProductsScope);
  }
});

router.post('/formdata', (req, res) => {
  const param = req.body;
  if (mock.isMock) {
    res.json(mock.formdata);
  }
});

router.post('/uploadDocument', (req, res) => {
  console.log("Upload Document API ---- :: ");
  delete req.body["getDocumentResponse"];
  if (mock.isMock) {
    res.json(mock.uploadDocument)
  }
  else {
    const param = req.body;
    console.log("param serverdev::: upload document", param);

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
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
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
  }
  else {
    const param = req.body;
    console.log("param serverdev::: get document", param);

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
      console.log("themeResp::::", themeResp);
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
  }
  else {
    const param = req.body;
    console.log("param serverdev::: get document", param);

    axiosInstance.delete(app.get('apiPrefix') + '/hobsrestgateway/customerdocuments/tibcustomerdocuments/delete',
      {
        headers: {
          'Content-Type': 'application/json',
          'opID': req.session.options.headers.opID,
          'buID': req.session.options.headers.buID,
          'userID': req.session.options.headers.userID,
          'Authorization': 'Basic Zm9fdXNlcjpmb191c2Vy',
          'language': req.session.options.headers.lang,
          'channel': 'CSA'
        },
        data: param
      }).then(resp => {
        console.log("themeResp::::", resp.data);
        //printlog(themeResp.data);
        res.json(resp.data);
      });
  }
});

router.post('/addNotes', (req, res) => {
  console.log("get addNotes API :: ");
  if (mock.isMock) {
    res.json(mock.addNotes)
  }
  else {
    const param = req.body;
    console.log("param serverdev::: get document", param);

    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/getcustomerdocuments/tibcustomerdocuments/fetch/current', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getNotesDetails', (req, res) => {
  console.log("get getNotesDetails API :: ");
  if (mock.isMock) {
    res.json(mock.getNotesDetails)
  }
  else {
    res.json(mock.getNotesDetails)
    // const param = req.body;
    // console.log("param serverdev::: get document", param);

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
  }
});

router.patch('/associateAccount', (req, res) => {
  if (mock.isMock) {
    res.json(mock.associateAccount)
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.patch(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/associateAccount', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});


router.post('/getProcessFlowForService', (req, res) => {

  if (mock.isMock) {
    res.json(mock.getProcessFlowForService);
  } else {
    // res.json(mock.getProcessFlowForService);
    printlog('EXPRESS REQUEST TO getProcessFlowForService: ', req._parsedUrl.pathname, req.body);
    const param = req.body.serviceType;
    printlog('EXPRESS REQUEST TO getProcessFlowForService PARAM: ', param);
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/getProcessFlowForService?serviceList=' + param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      //  printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});


router.post('/getPreOrderCheck', (req, res) => {

  if (mock.isMock) {
    res.json(mock.getPreOrderCheck);
  } else {
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


router.post('/partyEnabled/order', (req, res) => {
  console.log("Api partyEnabled:: ", req.body);
  if (mock.isMock) {
    res.json(mock.partyEnabled)
  } else {
    const param = req.body;
    const urlString = req.body.generalSearch;
    let baseUrl = '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/' + '?activeContact=' + param.activeContact + '&fields=' + param.fields;
    console.log("Base Url :: ", baseUrl)
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + baseUrl
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post("/validateDOB", (req, res) => {
  console.log("DOB::", req.body.reqValue);
  var splcheck = /[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\?]/;
  var alphacheck = /^[A-Za-z]+$/;
  if ((req.body.reqValue != null) || (req.body.reqValue != undefined) || (req.body.reqValue == ' ') || (req.body.reqValue == '')) {
    if (alphacheck.test(req.body.reqValue) || splcheck.test(req.body.reqValue)) {
      console.log("alpha error!!")
      res.json({ data: mock.dateValidationalphaError });
    }
    else {
      var actualDate = new Date(req.body.reqValue);
      var currentDate = new Date();
      var age = currentDate.getFullYear() - actualDate.getFullYear();
      var month = currentDate.getMonth() - actualDate.getMonth();
      if (
        month < 0 ||
        (month === 0 && currentDate.getDate() < actualDate.getDate())
      ) {
        age--;
      }
      let isValid = false;
      if (age >= 23 && age <= 80) {
        isValid = true;
        res.json({ data: mock.dateValidationSuccess });
      } else {
        res.json({ data: mock.dateValidationError });
      }
    }
  }
});

router.post('/contactPartyEnabledV2', (req, res) => {
  console.log("Api partyEnabled:: customer", req.body);
  if (mock.isMock) {
    res.json(mock.partyEnabled)
  } else {
    const param = req.body;
    const urlString = req.body.generalSearch;
    let baseUrl = '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/v2' + '?activeContact=' + encodeURIComponent(param.activeContact) + '&fields=' + encodeURIComponent('associatedEntityID=') + encodeURIComponent(param.associatedEntityID) + encodeURIComponent('&') + 'partyRoleTypeID=' + encodeURIComponent('PRIMARY,BILLING,INSTALLATION,SECONDARY');
    //let baseUrl = '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/' + '?activeContact=' + param.activeContact + '&fields=associatedEntityID=' + param.associatedEntityID;
    console.log("Base Url :: ", baseUrl)
    req.session.options.headers.domainID = "CSA";
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + baseUrl
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/deleteContactPartyEnabled', (req, res) => {
  console.log("deleteContactPartyEnabled API customer :: ", req.body.payload);
  if (mock.isMock) {
    // res.json(mock.deleteParty)
    console.log("HI MAN IN THE customer.JS");
  } else {
    const param = req.body.payload;
    console.log("param serverdev::: delete PartyEnabled", param);

    axiosInstance.delete(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/' + param, req.session.options).then(resp => {
      console.log("themeResp::::", resp.data);
      //printlog(themeResp.data);
      res.json(resp.data);
    });
  }
});

router.post('/list/deleteContactPartyEnabled', (req, res) => {
  console.log("deleteContactPartyEnabled API customer :: ", req.body.payload);
  if (mock.isMock) {
    // res.json(mock.deleteParty)
    console.log("HI MAN IN THE customer.JS");
  } else {
    const param = req.body.payload;
    console.log("param serverdev::: delete list PartyEnabled", param);

    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/list/remove', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});
//edit - individual contact // edit - organisational contact
function formatDate(value) {
  let date = new Date(value);

  return [
    date.getFullYear(),
    date.toLocaleString('default', { month: '2-digit' }),
    date.getDate()
  ].join('-');
}
function titleCase(str) {
  return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
}
router.post('/editContact', (req, res) => {
  console.log("req for edit contact:::", req.body);

  if (mock.isMock) {
    if (req.body.context.formId == 'contact.app.ContactDetails.edit') {
      res.json(mock.contactEdit)
    } else {
      // res.json(mock.basicDetailsB2C)
    }
  }
  else {
    let formId = req.body.context.formId;
    if (req.body.context.tagid != null) {
      let tagId = req.body.context.tagid;
      if (tagId.includes('PRIMARY')) {
        formId = req.body.context.formId + '.primary';
      }
    }
    else if (req.body.context.data != null && req.body.context.data.partyRoleType != null && req.body.context.data.partyRoleType.partyRoleTypeID != null && req.body.context.data.partyRoleType.partyRoleTypeID == 'PRIMARY') {
      formId = req.body.context.formId + '.primary';
    }
    console.log("edit contact body:::", req.body, formId)
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + formId, req.session.options)
    ]).then(axios.spread((themeResp) => {
      if (req.body.context.formId == 'contact.app.ContactDetails.edit') {
        let requestData = req.body.context.data
        console.log("final req data 111::", requestData);
        let inputFormArray = JSON.parse(themeResp.data.responseObject.formData)
        inputFormArray.forEach(eachItem => {
          console.log("eachitem data:::", eachItem);
          if (eachItem.key == "title") {
            //console.log("final req data::", requestData);
            eachItem.value = requestData.party.individualName[0].formOfAddress
            //console.log("final eachItem.value::", eachItem.value);
          }
          else if (eachItem.key == "firstName") {
            //console.log("final req data firstname::", requestData);
            eachItem.value = requestData.party.individualName[0].givenName
            //console.log("final eachItem.value firstname::", eachItem.value);
          }
          else if (eachItem.key == "middleName") {
            //console.log("final req data middleName::", requestData);
            eachItem.value = requestData.party.individualName[0].middleName
            //console.log("final eachItem.value middleName::", eachItem.value);
          }
          else if (eachItem.key == "lastName") {
            //console.log("final req data lastName::", requestData);
            eachItem.value = requestData.party.individualName[0].familyName
            //console.log("final eachItem.value lastName::", eachItem.value);
          }
          else if (eachItem.key == "gender") {
            console.log("final req data gender::", requestData);
            if(requestData.party.gender != null){
              eachItem.value = titleCase(requestData.party.gender);
            }
            //console.log("final eachItem.value gender::", eachItem.value);
          }
          else if (eachItem.key == "email") {
            //console.log("final req data email::", requestData);
            eachItem.value = requestData.party.contactMedium.primaryEmailID
            //console.log("final eachItem.value email::", eachItem.value);
          }
          else if (eachItem.key == "mobileNumber") {
            //console.log("final req data mobileNumber::", requestData);
            eachItem.value = requestData.party.contactMedium.dayContactNumber
            //console.log("final eachItem.value mobileNumber::", eachItem.value);
          }
          else if (eachItem.key == "dateOfBirth") {
            //console.log("final req data dateOfBirth::", requestData);
            eachItem.value = formatDate(requestData.party.dateOfBirth);
            //console.log("final eachItem.value dateOfBirth::", eachItem.value);
          }
          else if (eachItem.key == "addressLine1") {
            //console.log("final req data addressLine1::", requestData);
            eachItem.value = requestData.party.contactMedium.address[0].addressLine1
            //console.log("final eachItem.value addressLine1::", eachItem.value);
          }
          else if (eachItem.key == "addressLine2") {
            //console.log("final req data addressLine2::", requestData);
            eachItem.value = requestData.party.contactMedium.address[0].addressLine2
            //console.log("final eachItem.value addressLine2::", eachItem.value);
          }
          else if (eachItem.key == "addressLine3") {
            //console.log("final req data addressLine3::", requestData);
            eachItem.value = requestData.party.contactMedium.address[0].addressLine3
            //console.log("final eachItem.value addressLine3::", eachItem.value);
          }
          else if (eachItem.key == "city") {
            //console.log("final req data city::", requestData);
            eachItem.value = requestData.party.contactMedium.address[0].city
            //console.log("final eachItem.value city::", eachItem.value);
          }
          else if (eachItem.key == "state") {
            //console.log("final req data state::", requestData);
            eachItem.value = requestData.party.contactMedium.address[0].countryCode
            //console.log("final eachItem.value state::", eachItem.value);
          }
          else if (eachItem.key == "country") {
            //console.log("final req data country::", requestData);
            eachItem.value = requestData.party.contactMedium.address[0].countryCode
            //console.log("final eachItem.value country::", eachItem.value);
          }
          else if (eachItem.key == "pincode") {
            //console.log("final req data pincode::", requestData);
            eachItem.value = requestData.party.contactMedium.address[0].pinCode
            //console.log("final eachItem.value pincode::", eachItem.value);
          }
          else if (eachItem.key == "marketingPreference" && requestData.party.customIndividualParty != null &&
            requestData.party.customIndividualParty.individualAttributes.attribute[0] != null
            && requestData.party.customIndividualParty.individualAttributes.attribute != null
            && requestData.party.customIndividualParty.individualAttributes.attribute[0] != null) {
            eachItem.value = requestData.party.customIndividualParty.individualAttributes.attribute[0].attributeValue
          }
        })
        themeResp.data.responseObject.formData = JSON.stringify(inputFormArray)
        themeResp.data.responseObject.formId = req.body.context.formId;
        res.json(themeResp.data);
      }
      else if (req.body.context.formId == 'contact.app.OrgContactDetails.edit') {
        let requestData = req.body.context.data
        //console.log("final req data 111::", requestData);
        let inputFormArray = JSON.parse(themeResp.data.responseObject.formData)
        inputFormArray.forEach(eachItem => {
          //console.log("eachitem data:::", eachItem);
          if (eachItem.key == "organizationName") {
            //console.log("final req data::", requestData);
            requestData.party.organizationName.filter(ele => ele.nameType == 'Normal').forEach(ele => {
              eachItem.value = ele.tradingName;
            })
            // eachItem.value = requestData.party.organizationName[0].formOfAddress
            //console.log("final eachItem.value::", eachItem.value);
          }
          else if (eachItem.key == "organizationShortName") {
            //console.log("final req data organizationShortName::", requestData);
            requestData.party.organizationName.filter(ele => ele.nameType == 'ShortName').forEach(ele => {
              eachItem.value = ele.tradingName;
            })
            //console.log("final eachItem.value organizationShortName::", eachItem.value);
          }
          else if (eachItem.key == "tIN") {
            //console.log("final req data tIN::", requestData);
            eachItem.value = requestData.party.partyIdentification[0].id
            //console.log("final eachItem.value tIN::", eachItem.value);
          }
          else if (eachItem.key == "email") {
            //console.log("final req data email::", requestData);
            eachItem.value = requestData.party.contactMedium[0].primaryEmailID
            //console.log("final eachItem.value email::", eachItem.value);
          }
          else if (eachItem.key == "mobileNumber") {
            //console.log("final req data mobileNumber::", requestData);
            eachItem.value = requestData.party.contactMedium[0].dayContactNumber
            //console.log("final eachItem.value mobileNumber::", eachItem.value);
          }
          else if (eachItem.key == "addressLine1") {
            //console.log("final req data addressLine1::", requestData);
            eachItem.value = requestData.party.contactMedium[0].address[0].addressLine1
            //console.log("final eachItem.value addressLine1::", eachItem.value);
          }
          else if (eachItem.key == "addressLine2") {
            //console.log("final req data addressLine2::", requestData);
            eachItem.value = requestData.party.contactMedium[0].address[0].addressLine2
            //console.log("final eachItem.value addressLine2::", eachItem.value);
          }
          else if (eachItem.key == "addressLine3") {
            //console.log("final req data addressLine3::", requestData);
            eachItem.value = requestData.party.contactMedium[0].address[0].addressLine3
            //console.log("final eachItem.value addressLine3::", eachItem.value);
          }
          else if (eachItem.key == "city") {
            //console.log("final req data city::", requestData);
            eachItem.value = requestData.party.contactMedium[0].address[0].city
            //console.log("final eachItem.value city::", eachItem.value);
          }
          else if (eachItem.key == "state") {
            //console.log("final req data state::", requestData);
            eachItem.value = requestData.party.contactMedium[0].address[0].stateOrProvince
            //console.log("final eachItem.value state::", eachItem.value);
          }
          else if (eachItem.key == "country") {
            //console.log("final req data country::", requestData);
            eachItem.value = requestData.party.contactMedium[0].address[0].countryCode
            //console.log("final eachItem.value country::", eachItem.value);
          }
          else if (eachItem.key == "pincode") {
            //console.log("final req data pincode::", requestData);
            eachItem.value = requestData.party.contactMedium[0].address[0].pinCode
            //console.log("final eachItem.value pincode::", eachItem.value);
          }
        })
        themeResp.data.responseObject.formData = JSON.stringify(inputFormArray)
        res.json(themeResp.data);
      }
      else if (req.body.context.formId == 'contact.app.ThingContactDetails.edit') {
        let requestData = req.body.context.data
        //console.log("final req data 111::", requestData);
        let inputFormArray = JSON.parse(themeResp.data.responseObject.formData)
        inputFormArray.forEach(eachItem => {
          //console.log("eachitem data:::", eachItem);
          if (eachItem.key == "name") {
            //console.log("final req data::", requestData);
            eachItem.value = requestData.party.name;
            //console.log("final eachItem.value::", eachItem.value);
          }
          else if (eachItem.key == "partRefID") {
            //console.log("final req data partRefID::", requestData);
            eachItem.value = requestData.party.inventoryIDofPart
            //console.log("final eachItem.value partRefID::", eachItem.value);
          }
          else if (eachItem.key == "type") {
            //console.log("final req data type::", requestData);
            eachItem.value = requestData.party.type
            //console.log("final eachItem.value type::", eachItem.value);
          }
          else if (eachItem.key == "addressLine1") {
            //console.log("final req data addressLine1::", requestData);
            eachItem.value = requestData.party.address.addressLine1
            //console.log("final eachItem.value addressLine1::", eachItem.value);
          }
          else if (eachItem.key == "addressLine2") {
            //console.log("final req data addressLine2::", requestData);
            eachItem.value = requestData.party.address.addressLine2
            //console.log("final eachItem.value addressLine2::", eachItem.value);
          }
          else if (eachItem.key == "addressLine3") {
            //console.log("final req data addressLine3::", requestData);
            eachItem.value = requestData.party.address.addressLine3
            //console.log("final eachItem.value addressLine3::", eachItem.value);
          }
          else if (eachItem.key == "city") {
            //console.log("final req data city::", requestData);
            eachItem.value = requestData.party.address.city
            //console.log("final eachItem.value city::", eachItem.value);
          }
          else if (eachItem.key == "state") {
            //console.log("final req data state::", requestData);
            eachItem.value = requestData.party.address.stateOrProvince
            //console.log("final eachItem.value state::", eachItem.value);
          }
          else if (eachItem.key == "country") {
            //console.log("final req data country::", requestData);
            eachItem.value = requestData.party.address.countryCode
            //console.log("final eachItem.value country::", eachItem.value);
          }
          else if (eachItem.key == "pincode") {
            //console.log("final req data pincode::", requestData);
            eachItem.value = requestData.party.address.pinCode
            //console.log("final eachItem.value pincode::", eachItem.value);
          }
          else if (eachItem.key == "email") {
            //console.log("final req data email::", requestData);
            eachItem.value = requestData.contactMedium[0].primaryEmailID
            //console.log("final eachItem.value email::", eachItem.value);
          }

        })
        themeResp.data.responseObject.formData = JSON.stringify(inputFormArray)
        res.json(themeResp.data);
      }
      else if (req.body.context.formId == 'contact.app.ContactDetails.addNew') {
        if (req.body.context.data != null) {
          let requestData = req.body.context.data
          // console.log("final req data 111::", requestData);
          let inputFormArray = JSON.parse(themeResp.data.responseObject.formData)
          inputFormArray.forEach(eachItem => {
            //console.log("eachitem data:::", eachItem);
            if (eachItem.key == "title") {
              //console.log("final req data::", requestData);
              eachItem.value = requestData.individualName[0].formOfAddress
              //console.log("final eachItem.value::", eachItem.value);
            }
            else if (eachItem.key == "firstName") {
              //console.log("final req data firstname::", requestData);
              eachItem.value = requestData.individualName[0].givenName
              //console.log("final eachItem.value firstname::", eachItem.value);
            }
            else if (eachItem.key == "middleName") {
              //console.log("final req data middleName::", requestData);
              eachItem.value = requestData.individualName[0].middleName
              //console.log("final eachItem.value middleName::", eachItem.value);
            }
            else if (eachItem.key == "lastName") {
              //console.log("final req data lastName::", requestData);
              eachItem.value = requestData.individualName[0].familyName
              //console.log("final eachItem.value lastName::", eachItem.value);
            }
            else if (eachItem.key == "gender") {
              //console.log("final req data lastName::", requestData);
              eachItem.value = titleCase(requestData.gender);
              //console.log("final eachItem.value gender::", eachItem.value);
            }
            else if (eachItem.key == "email") {
              //console.log("final req data email::", requestData);
              eachItem.value = requestData.contactMedium.primaryEmailID
              //console.log("final eachItem.value email::", eachItem.value);
            }
            else if (eachItem.key == "mobileNumber") {
              //console.log("final req data mobileNumber::", requestData);
              eachItem.value = requestData.contactMedium.dayContactNumber
              //console.log("final eachItem.value mobileNumber::", eachItem.value);
            }
            else if (eachItem.key == "dateOfBirth") {
              //console.log("final req data dateOfBirth::", requestData);
              eachItem.value = formatDate(requestData.dateOfBirth)
              //console.log("final eachItem.value dateOfBirth::", eachItem.value);
            }
          })
          themeResp.data.responseObject.formData = JSON.stringify(inputFormArray)
        }
        themeResp.data.responseObject.formId = req.body.context.formId;
        res.json(themeResp.data);
      }
      else if (req.body.context.formId == 'contact.app.AddressDetails.addNew') {
        res.json(themeResp.data);
      } else if (req.body.context.formId == 'order.app.AdvanceSearchcustomerAddress.capture') {
        res.json(themeResp.data);
      } else if (req.body.context.formId == 'contact.app.OrgContactDetails.addNew') {
        // //console.log("ORG:::form:::")
        if (req.body.context.data != null) {
          let requestData = req.body.context.data
          //console.log("final req data 111::", requestData);
          let inputFormArray = JSON.parse(themeResp.data.responseObject.formData)
          inputFormArray.forEach(eachItem => {
            //console.log("eachitem data:::", eachItem);
            if (eachItem.key == "organizationName") {
              //console.log("final req data::", requestData);
              requestData.organizationName.filter(ele => ele.nameType == 'Normal').forEach(ele => {
                eachItem.value = ele.tradingName;
              })
              // eachItem.value = requestData.organizationName[0].formOfAddress
              //console.log("final eachItem.value::", eachItem.value);
            }
            else if (eachItem.key == "organizationShortName") {
              //console.log("final req data organizationShortName::", requestData);
              requestData.organizationName.filter(ele => ele.nameType == 'ShortName').forEach(ele => {
                eachItem.value = ele.tradingName;
              })
              //console.log("final eachItem.value organizationShortName::", eachItem.value);
            }
            else if (eachItem.key == "tIN") {
              //console.log("final req data tIN::", requestData);
              eachItem.value = requestData.partyIdentification[0].id
              //console.log("final eachItem.value tIN::", eachItem.value);
            }
            else if (eachItem.key == "email") {
              //console.log("final req data email::", requestData);
              eachItem.value = requestData.contactMedium[0].primaryEmailID
              //console.log("final eachItem.value email::", eachItem.value);
            }
            else if (eachItem.key == "mobileNumber") {
              //console.log("final req data mobileNumber::", requestData);
              eachItem.value = requestData.contactMedium[0].dayContactNumber
              //console.log("final eachItem.value mobileNumber::", eachItem.value);
            }
          })
          themeResp.data.responseObject.formData = JSON.stringify(inputFormArray)
        }
        res.json(themeResp.data);
      }
      else if (req.body.context.formId == 'contact.app.AddressDetails.edit') {
        let requestData = req.body.context.data
        console.log("final req data AddressDetails::", requestData);
        let inputFormArray = JSON.parse(themeResp.data.responseObject.formData)
        if (requestData != undefined) {
          inputFormArray.forEach(eachItem => {
            if (eachItem.key == "addressLine1") {
              eachItem.value = requestData.addressLine1
            }
            else if (eachItem.key == "addressLine2") {
              eachItem.value = requestData.addressLine2
            }
            else if (eachItem.key == "addressLine3") {
              eachItem.value = requestData.addressLine3
            }
            else if (eachItem.key == "city") {
              eachItem.value = requestData.city
            }
            else if (eachItem.key == "state") {
              eachItem.value = requestData.stateOrProvince
            }
            else if (eachItem.key == "country") {
              eachItem.value = requestData.countryCode
            }
            else if (eachItem.key == "pincode") {
              eachItem.value = requestData.pinCode
            }

          })
          themeResp.data.responseObject.formData = JSON.stringify(inputFormArray)
        }
        res.json(themeResp.data);
      }
      else if (req.body.context.formId == 'contact.app.ThingTypeDetails.addNew') {
        //console.log("THING:::form:::", themeResp.data)
        if (req.body.context.data != null) {
          let requestData = req.body.context.data
          //console.log("final req data 111::", requestData);
          let inputFormArray = JSON.parse(themeResp.data.responseObject.formData)
          inputFormArray.forEach(eachItem => {
            //console.log("eachitem data:::", eachItem);
            if (eachItem.key == "name") {
              //console.log("final req data::", requestData);
              eachItem.value = requestData.name;
              //console.log("final eachItem.value::", eachItem.value);
            }
            else if (eachItem.key == "partRefID") {
              //console.log("final req data partRefID::", requestData);
              eachItem.value = requestData.inventoryIDofPart
              //console.log("final eachItem.value partRefID::", eachItem.value);
            }
            else if (eachItem.key == "type") {
              //console.log("final req data type::", requestData);
              eachItem.value = requestData.type
              //console.log("final eachItem.value type::", eachItem.value);
            }
          })
          themeResp.data.responseObject.formData = JSON.stringify(inputFormArray)
        }
        res.json(themeResp.data);
      }
      else {
        //res.json(themeResp.data);
      }
    }
    )).catch(error => {
      handleServiceErros(error, res);
    });
  }
});


router.post('/contact/searchpartyall', (req, res) => {
  console.log("Api partyEnabled::contact ", req.body);
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


router.post("/updatePartyEnabled", (req, res) => {
  console.log("updatePartyEnabled APIcustomer :: ");
  if (mock.isMock) {
    // res.json(mock.updateParty)
    console.log("HI apicustomer.JS");
  } else {
    const param = req.body;
    console.log("param serverdev::: delete PartyEnabled", param);
    param.forEach(element => {
      if (element.partyRoleType.partyRoleTypeID == 'PRIMARY' && element.party.partyType == 'INDIVIDUAL') {
        console.log("createContact------------setting ------->");
        element.party.customIndividualParty = {};
        element.party.customIndividualParty.individualAttributes = {};
        element.party.customIndividualParty.individualAttributes.attribute = [];
        let attr = {};
        attr.attributeName = "marketingPreference";
        attr.attributeValue = element.formData[0].marketingPreference;
        element.party.customIndividualParty.individualAttributes.attribute.push(attr);
      }
    })
    axiosInstance
      .post(
        app.get("apiPrefix") +
        "/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/update/" +
        param.id,
        JSON.stringify(param),
        req.session.options
      )
      .then((resp) => {
        console.log("themeResp::::", resp.data);
        //printlog(themeResp.data);
        res.json(resp.data);
      });
  }
});


router.post("/updatePartyList", (req, res) => {
  console.log("updatePartyList APIcustomer :: ");
  if (mock.isMock) {
    // res.json(mock.updateParty)
    console.log("HI apicustomer.JS");
  } else {
    const param = req.body;
    console.log("param serverdev::: delete PartyEnabled", param);
    param.forEach(element => {
      if (element.partyRoleType.partyRoleTypeID == 'PRIMARY' && element.party.partyType == 'INDIVIDUAL') {
        console.log("createContact------------setting ------->");
        element.party.customIndividualParty = {};
        element.party.customIndividualParty.individualAttributes = {};
        element.party.customIndividualParty.individualAttributes.attribute = [];
        let attr = {};
        attr.attributeName = "marketingPreference";
        attr.attributeValue = element.formData[0].marketingPreference;
        element.party.customIndividualParty.individualAttributes.attribute.push(attr);
      }
    })
    axiosInstance
      .post(
        app.get("apiPrefix") +
        "/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/list/update",
        JSON.stringify(param),
        req.session.options
      )
      .then((resp) => {
        console.log("themeResp::::", resp.data);
        //printlog(themeResp.data);
        res.json(resp.data);
      });
  }
});

router.post('/createContact', (req, res) => {
  console.log("Contact API customer:: ");
  if (mock.isMock) {
    res.json(mock.contactForIndividual)
  }
  else {
    const param = req.body;
    console.log("param serverdev customer:::", param);

    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/create', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("themeResp customer::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.get('/getOrderId', (req, res) => {
  if (mock.isMock) {
    //Added hardcored oredrId instead of putting it in Mock.
    // Reason : This is api is only returning OrderId without Key.
    res.json("O12345678");
  } else {
    console.log("Inside Order Id generation.")
    const param = req.body;


    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/tibchassisrestservice/rest/uimetadataservice/sequence/next/Order/ORDER_ID?opId=' + req.session.options.headers.opID + '&buId=' + req.session.options.headers.buID + '&userId=' + req.session.options.headers.userID
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getChassisForm', (req, res) => {
  if (mock.isMock) {

    //Added hardcored oredrId instead of putting it in Mock.
    // Reason : This is api is only returning OrderId without Key.
    // res.json("O12345678");

    if (req.body.context == "order.app.individual.capture") {
      res.json(mock.indgenericfrom);
    } else if (req.body.context == "order.app.organisation.capture") {
      res.json(mock.getOrganisationFormChassis);
    } else if (req.body.context == "order.app.address.capture") {
      res.json(mock.getAddressFormChassis);
    } else if (req.body.context == "order.app.serviceattributes.capture") {
      res.json(mock.mockFormElementServiceAttribute);
    } else if (req.body.context == "order.app.customerDetails.capture") {
      res.json(mock.mockFormElementCustomerDetails);
    } else if (req.body.context == "order.app.leadCreation.capture") {
      res.json(mock.mockFormElementLeadCreation);
    } else {
      res.json(mock.getChassisForm)
    }
  } else {
    console.log("Inside getChassisForm")
    const param = req.body;

    const context = req.body.context;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/tibchassisrestservice/rest/uimetadataservice/formelement/' + context + '?opId=' + req.session.options.headers.opID + '&buId=' + req.session.options.headers.buID + '&userId=' + req.session.options.headers.userID + '&language=' + req.session.options.headers.lang
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getChassisFormValidation', (req, res) => {
  if (mock.isMock) {

    //Added hardcored oredrId instead of putting it in Mock.
    // Reason : This is api is only returning OrderId without Key.
    // res.json("O12345678");

    if (req.body.context == "order.app.individual.capture") {
      res.json(mock.indvalidationform);
    } else if (req.body.context == "order.app.organisation.capture") {
      res.json(mock.getOrganisationValidation);
    } else if (req.body.context == "order.app.address.capture") {
      res.json(mock.getAddressFormChassisValidation);
    } else if (req.body.context == "order.app.serviceattributes.capture") {
      res.json(mock.mockCtrlContextServiceAttribute);
    } else if (req.body.context == "order.app.customerDetails.capture") {
      res.json(mock.mockCtrlContextCustomerDetails);
    } else if (req.body.context == "order.app.leadCreation.capture") {
      res.json(mock.mockCtrlContextLeadCreation);
    } else {
      res.json(mock.getChassisFormValidation);
    }
  } else {
    console.log("Inside getChassisForm")
    const param = req.body;

    const context = req.body.context;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/tibchassisrestservice/rest/uimetadataservice/contextattr/context/' + context + '?opId=' + req.session.options.headers.opID + '&buId=' + req.session.options.headers.buID + '&userId=' + req.session.options.headers.userID + '&language=' + req.session.options.headers.lang
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/getRefParamData', (req, res) => {
  if (mock.isMock) {

    res.json(mock.pcfilterAttributes)

  } else {
    printlog("Inside getRefParamData", req)
    const param = req.body;

    const context = req.body.context;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/tibchassisrestservice/rest/uimetadataservice/controlparam/context/' + context + '?opId=' + req.session.options.headers.opID + '&buId=' + req.session.options.headers.buID + '&language=' + req.session.options.headers.lang
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post('/leadCustomerCreation', (req, res) => {
  if (mock.isMock) {
    res.json(mock.leadCustomerCreation)
  } else {
    delete req.body.payload["formData"];
    console.log("Lead Creation Request :: ", req.body.payload)
    res.json(mock.leadCustomerCreation)

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

router.post('/customer/loadConfiguredRoles', (req, res) => {
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

router.post('/getLogApiPrefix', (req, res) => {
  if (envConst.ENV == 'prod') {
    res.json("https://" + envConst.LOG_PREFIX + "," + app.get('envDevelopmentMode') + "," + app.get('envLogLevel'));
  } else {
    res.json(app.get('envLogServicePrefix') + "," + app.get('envDevelopmentMode') + "," + app.get('envLogLevel'));
  }
});

router.post('/editCustomerProfileDetails', (req, res) => {
  if (mock.isMock) {
    res.json(mock.editCustomerProfileDetails);
  } else {
    console.log("editCustomerProfileDetails::req payload", req.body.payload)
    let updatedFormData={},
    data = req.body.payload.customerDetails;
    updatedFormData["name"] = (data.name != null && data.name != undefined) ? data.name : "";
    updatedFormData["status"] = (data.status != null && data.status != undefined) ? data.status : "";
    updatedFormData["customerId"] = (data.id != null && data.id != undefined) ? data.id : "";  
    updatedFormData["customerCategory"] = (data.category != null && data.category != undefined) ? data.category : "";
    updatedFormData["customerSegment"] = (data.segment != null && data.segment != undefined) ? data.segment.toUpperCase() : "";
    updatedFormData["customerType"] = (data.type != null && data.type != undefined) ? data.type.toUpperCase() : "";
    updatedFormData["customerSubType"] = (data.subType != null && data.subType != undefined) ? data.subType : "";
    updatedFormData["organizationName"] = (data.engagedParty != null && data.engagedParty != undefined && 
        data.engagedParty.name != null && data.engagedParty.name != undefined) ? data.engagedParty.name : "";
    updatedFormData["organizationShortName"] =  (data.engagedParty != null && data.engagedParty != undefined && 
        data.engagedParty.shortName != null && data.engagedParty.shortName != undefined) ? data.engagedParty.shortName : "";
    updatedFormData["corpCode"] = (data.corpCode != null && data.corpCode != undefined) ? data.corpCode : "";
    updatedFormData["tIN"] = (data.tIN != null && data.tIN != undefined) ? data.tIN : "";

    let defaultAddressChar = {};
    data.contactMedium.forEach(element => {
      this.defaultAddress = element;
      if (this.defaultAddress.characteristic.addressType.toLowerCase() === "default") {
        defaultAddressChar = this.defaultAddress.characteristic;
      }
    });
   updatedFormData["email"] = (defaultAddressChar.emailAddress != null && defaultAddressChar.emailAddress != undefined) ? defaultAddressChar.emailAddress : "";
   updatedFormData["mobileNumber"] = (defaultAddressChar.phoneNumber != null && defaultAddressChar.phoneNumber != undefined) ? defaultAddressChar.phoneNumber : "";
   updatedFormData["dateOfBirth"] = (defaultAddressChar.dateOfBirth != null && defaultAddressChar.dateOfBirth != undefined) ? defaultAddressChar.dateOfBirth : "";
   updatedFormData["addressLine1"] = (defaultAddressChar.street2 != null && defaultAddressChar.street2 != undefined) ? defaultAddressChar.street2 : "";
   updatedFormData["addressLine2"] = (defaultAddressChar.line3 != null && defaultAddressChar.line3 != undefined) ? defaultAddressChar.line3 : "";
   updatedFormData["addressLine3"] = (defaultAddressChar.line4 != null && defaultAddressChar.line4 != undefined) ? defaultAddressChar.line4 : "";
   updatedFormData["state"] = (defaultAddressChar.stateOrProvince != null && defaultAddressChar.stateOrProvince != undefined) ? defaultAddressChar.stateOrProvince : "";
   updatedFormData["country"] = (defaultAddressChar.country != null && defaultAddressChar.country != undefined) ? defaultAddressChar.country : "";
   updatedFormData["pincode"] = (defaultAddressChar.postCode != null && defaultAddressChar.postCode != undefined) ? defaultAddressChar.postCode : "";
     
    let addressUpdatedArray = req.body.payload.formArray;
    let keyArr = Object.keys(updatedFormData)
    for (let i = 0; i < addressUpdatedArray.length; i++) {
      for (let key of keyArr) {
        if (key == addressUpdatedArray[i].key) {
          console.log("Inside addressUpdatedArray -- ")
          if (addressUpdatedArray[i].type != "button") {
            addressUpdatedArray[i].value = updatedFormData[key]
          }
        }
      }
    }

    addressUpdatedArray["name"] = updatedFormData["name"];
    addressUpdatedArray["status"] = updatedFormData["status"];
    addressUpdatedArray["customerId"] = updatedFormData["customerId"];
    console.log("editCustomerProfileDetails addressUpdatedArray ----  ", addressUpdatedArray)
    res.json(addressUpdatedArray);
  }
});


router.patch('/customerUpdate', (req, res) => {
  console.log("Inside customerUpdate=================",  req.body.payload)
  if (mock.isMock) {
    res.json(mock.customerUpdate)
  } else {
    const param = req.body.payload.customerid;
    console.log("Inside customerUpdate else=================", req.session.options)
    axios.all([
      axiosInstance.patch(app.get('apiPrefix') + '/hobsrestgateway/crmservices/openApi/customer/update/' + param
        , req.body.payload.request, req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log(":Inside customerUpdate themeResp.data=================", themeResp.data)
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });

  }
});
module.exports = router;