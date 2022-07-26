var winston = require("./winston");
var express = require('express');
var router = express.Router();
const mock = require("./mockResp.js");
const appConfig = require("./appConfig.js");
const axios = require("axios");
var app = express();
const formdata = require('./dashboardforms.js');
const envConst = require("./envConst.js");
const https = require("https");
var mysql = require('mysql');
var path = require('path');
var fs = require('fs');
var formService = require(envConst.HOOK_FORM_ORDER_APP);
app.set(
  "contextPath",
  "https://" + envConst.HOST + ":" + envConst.PORT + envConst.APP_CONTEXT
);
app.set("apiPrefix", "https://" + envConst.API_PREFIX);
app.set(
  "envLogServicePrefix",
  "https://" + envConst.HOST + ":" + envConst.PORT
);
app.set("envDevelopmentMode", envConst.ENV_DEVELOPMENT_MODE);
app.set("userCallPrefix", "https://" + envConst.USER_CALL_PREFIX);
app.set("envLogLevel", envConst.ENV_LOGLEVEL);
console.log("-----", envConst.API_PREFIX);
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
axiosInstance.interceptors.request.use((request) => {
  console.log("AXIOS >> request >", request.method, request.url, request.data);
  return request;
});
axiosInstance.interceptors.response.use((response) => {
  console.log("AXIOS >> response >", response.status, response.config.url);
  return response;
});
axiosInstance.interceptors.request.use((config) => {
  config.headers["request-startTime"] = process.hrtime();
  return config;
});

var user = { cas_user: null, cas_user_info: {} };
var appendQueryParams = function (url) {
  const fullParam =
    "?login=" +
    user.cas_user +
    "&opId=" +
    user.cas_user_info.opId +
    "&buId=" +
    user.cas_user_info.buId +
    "&language=" +
    user.cas_user_info.language;
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
//     "Content-Type": "application/json",
//     opID: "HOB",
//     buID: "DEFAULT",
//     userID: "584235",
//     Authorization: "Basic Zm9fdXNlcjpmb191c2Vy",
//     lang: "ENG",
//     channel: "CSA",
//     language: "ENGLISH",
//   },
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
    printlog("Error", error.message);
    res.json(error.message);
  }
  //res.json(error);
}
function callOtherUserSession(user, req, res) {
  // console.log("callOtherUserSession----->");
  axios
    .all([
      axiosInstance.get(
        app.get("userCallPrefix") + envConst.APP_CONTEXT + "/api/dashboard/user"),
      axiosInstance.get(
        app.get("userCallPrefix") + envConst.APP_CONTEXT + "/api/cpq/user"),
      axiosInstance.get(
        app.get("userCallPrefix") + envConst.APP_CONTEXT + "/api/customer/user"),
    ])
    .then(
      axios.spread((themeResp) => {
        //console.log("themeResp-ghhhggfddd-", themeResp.data);
        res.json(user);
      })
    )
    .catch((error) => { console.error("error here --->", error) });
}
function getToken(user, req, res) {
  //console.log("getToken----->", req.session);
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
        //console.log("themeResp--", themeResp.data);
        user.cas_user_info.authorization = themeResp.data;
        //console.log("user-ccc-", user);
        let options = {
          headers: {
            'Content-Type': 'application/json',
            'opID': user.cas_user_info.opId,
            'buID': user.cas_user_info.buId,
            'userID': user.cas_user,
            'Authorization': "Basic d29sdmVfdGVzdDpUY3NAMTIzNA==",
            'lang': user.cas_user_info.language,
            'groupID': user.cas_user_info.groupId
          }
        };
        req.session.options = {}
        req.session.options = options;
        req.session.save();
        console.log("options-setting in session-", req.session.options);
        //res.json(themeResp.data);
        callOtherUserSession(user, req, res);
      })
    )
    .catch((error) => { console.error("error here --->", error) });
}

router.get("/order/user", (req, res) => {
  //printlog('EXPRESS : /user start');
  if (mock.isMock) {
    res.json(mock.user);
  }
  let sessionUser = "";
  console.log("/api/user--");
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

router.get("/logoutHost", (req, res) => {
  console.log("EXPRESS REQUEST TO logoutHost: ", envConst.CAS_PREFIX);
  res.json(envConst.CAS_PREFIX);
});
router.post("/getRefDependentDataFinal", (req, res) => {
  console.log("enter in apiorder Dependent getRefData", req.body);
  if (mock.isMock) {
    console.log("mock for dependnecy");
    const param = req.body;
    let referanceName = req.body["referenceName"];
    let refVal = req.body["reqValue"];
    console.log(
      "enter in apiorder dependency getRefData mock true",
      referanceName,
      refVal
    );

    if (referanceName == "COUNTRY") {
      if (refVal == "India") {
        let resfrmock = mock.stateIndia;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      } else if (refVal == "United States") {
        let resfrmock = mock.stateUS;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      }
    } else if (referanceName == "State") {
      if (refVal == "Texas") {
        let resfrmock = mock.cityTexas;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      } else if (refVal == "California") {
        let resfrmock = mock.cityCalifornia;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      } else if (refVal == "TamilNadu") {
        let resfrmock = mock.cityTN;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      } else if (refVal == "Kerala") {
        let resfrmock = mock.cityKerala;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      } else if (refVal == "Karnataka") {
        let resfrmock = mock.cityKarnataka;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }

        console.log("resObject--->", resObject);
        res.json(resObject);
      }
    } else if (referanceName == "customerCategory") {
      if (refVal == "RES") {
        let resfrmock = mock.categoryResidential;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      } else if (refVal == "VIP") {
        let resfrmock = mock.categoryVIP;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      } else if (refVal == "WHS") {
        let resfrmock = mock.categoryWHS;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      }
    } else if (referanceName == "invoiceMedia") {
      if (refVal == "EMAIL") {
        let resfrmock = mock.invoiceFormatEmail;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      }
      if (refVal == "Paper") {
        let resfrmock = mock.invoiceFormatPaper;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      }
      if (refVal == "WhiteMail and Email") {
        let resfrmock = mock.invoiceFormatWhitemailandEmail;
        console.log(resfrmock[0].refValues);
        var resObject = [];
        for (index = 0; index < resfrmock[0].refValues.length; index++) {
          console.log(resfrmock[0].refValues[index]);
          var map = {};
          map["value"] = resfrmock[0].refValues[index].id;
          map["label"] = resfrmock[0].refValues[index].displayText;
          map["disabled"] = true;
          resObject.push(map);
        }
        console.log("resObject--->", resObject);
        res.json(resObject);
      }
    }

    //console.log('res/////', res.json(mock.stateIndia))
  } else {
    let baseUrl =
      "/tibchassisrestservice/rest/referencedataservice/refdatadependencyauth/context/";
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

    baseUrl =
      baseUrl +
      context +
      "/domain/" +
      domain +
      "/entity/" +
      entity +
      "/referenceName/" +
      referanceName +
      "/referenceValue/" +
      refVal +
      "?opId=" +
      req.session.options.headers.opID +
      "&buId=" +
      req.session.options.headers.buID +
      "&language=" +
      req.session.options.headers.lang +
      "&userId=" +
      req.session.options.headers.userID;
    console.log("baseUrl for dependency", baseUrl);

    axios
      .all([axiosInstance.get(app.get("apiPrefix") + baseUrl, req.session.options)])
      .then(
        axios.spread((themeResp) => {
          res.json(formService.getRefDependentDataFinal(themeResp));
        })
      )
      .catch((error) => {
        console.log("error", error);
        handleServiceErros(error, res);
      });
  }
});
router.post("/getRefData", (req, res) => {
  console.log("enter in apiorder Dependent getRefData", req.body);
  if (mock.isMock) {
    if (req.body.domain == "ORDER-APP") {
      res.json(mock.refDataOrderApp);
    }

    console.log("No mock response available :: ");
  } else {
    let baseUrl =
      "/tibchassisrestservice/rest/referencedataservice/referencedataauth/";
    let domain = req.body.domain;
    let context = req.body.context;
    let entity = req.body.entity;
    let referanceName = req.body.referanceName;

    const param = req.body;
    console.log("domain part", req.body.domain);
    console.log("context part", context);
    console.log("entity part", entity);
    console.log("referanceName part", referanceName);

    baseUrl =
      baseUrl +
      domain +
      "/" +
      context +
      "/" +
      entity +
      "/" +
      "?opId=" +
      req.session.options.headers.opID +
      "&buId=" +
      req.session.options.headers.buID +
      "&language=" +
      req.session.options.headers.lang +
      "&userId=" +
      req.session.options.headers.userID;
    console.log("baseUrl", baseUrl);

    axios
      .all([axiosInstance.get(app.get("apiPrefix") + baseUrl, req.session.options)])
      .then(
        axios.spread((themeResp) => {
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        console.log("error", error);
        handleServiceErros(error, res);
      });
  }
});
router.post("/getListViewDocumentList", (req, res) => {
  console.log("getListViewDocumentList API :: ");

  res.json(mock.getListViewDocumentList);

});
router.post("/quickOrder", (req, res) => {
  console.log("quickOrder API :: ");
  if (mock.isMock) {
    console.log("quickOrder API :: ", mock.isMock);
    res.json(mock.quickOrdersubmit);
  } else {
    const param = req.body;
    const addressFormData = param.addressFormData;
    //Can be customized by CE for their own addressFields
    param.individual.contactMedium[0].characteristic["street1"] = addressFormData.addressLine1;
    param.individual.contactMedium[0].characteristic["street2"] = addressFormData.addressLine2;
    param.individual.contactMedium[0].characteristic["street3"] = addressFormData.addressLine3;
    param.individual.contactMedium[0].characteristic["city"] = addressFormData.city;
    param.individual.contactMedium[0].characteristic["postCode"] = addressFormData.pincode;
    param.individual.contactMedium[0].characteristic["stateOrProvince"] = addressFormData.state;
    param.individual.contactMedium[0].characteristic["country"] = addressFormData.country;
    delete param["basicDetailsFormData"];
    delete param["addressFormData"]
    console.log("param quickOrder:::", param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/quickOrder",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});
router.post("/addrelatednotes", (req, res) => {
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
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getrelatednotes", (req, res) => {
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
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getrecommendation", (req, res) => {
  console.log("getrecommendation API :: ", req.body);
  if (mock.isMock) {
    console.log("addrecommendation API :: ", mock.isMock);
    res.json(mock.getrecommendations);
  } else {
    console.log("addrecommendation API :: ", mock.isMock);
    res.json(mock.getrecommendations);
  }
});

router.post("/getRefDataFinal/order", (req, res) => {
  console.log("enter in apiorder getRefData", req.body);
  if (mock.isMock) {
    const param = req.body;
    const speci = req.body.referanceName;
    console.log("enter in apiorder getRefData", speci);
    if (speci == "CURRENCY") {
      res.json(mock.CURRENCY);
    } else if (speci == "ACCT_SEGMENT") {
      res.json(mock.ACCT_SEGMENT);
    } else if (speci == "TAX_CODE") {
      res.json(mock.TAX_CODE);
    } else if (speci == "PARTY_TYPE" && req.body.entity == "ACCOUNT") {
      res.json(mock.PARTY_TYPE);
    } else if (speci == "CONTACT_ROLE" && req.body.entity == "ACCOUNT") {
      res.json(mock.CONTACT_ROLE);
    } else if (speci == "PAYMENT_MODE") {
      res.json(mock.PAYMENT_MODE);
    } else if (speci == "ACCOUNT_TYPE") {
      res.json(mock.ACCOUNT_TYPE);
    } else if (speci == "INVOICE_MEDIA") {
      res.json(mock.invoicemedia);
    } else if (req.body.referanceName == "TITLE") {
      res.json(mock.title);
      console.log("after getting mock", res.json(mock.title));
    } else if (req.body.referanceName == "BILL_FREQUENCY") {
      res.json(mock.billFreq);
      console.log("after getting mock", res.json(mock.billFreq));
    } else if (req.body.referanceName == "BILL_CYCLE") {
      res.json(mock.billCycle);
      console.log("after getting mock", res.json(mock.billCycle));
    } else if (req.body.referanceName == "INVOICE_PREFEENCE") {
      res.json(mock.invoicePref);
      console.log("after getting mock", res.json(mock.invoicePref));
    } else if (
      req.body.referanceName == "CONTACT_ROLE" &&
      req.body.entity == "CUSTOMER"
    ) {
      res.json(mock.contactRole);
      console.log("after getting mock", res.json(mock.contactRole));
    } else if (
      req.body.referanceName == "PARTY_TYPE" &&
      req.body.entity == "CUSTOMER"
    ) {
      res.json(mock.partyTypeForCust);
      console.log("after getting mock", res.json(mock.partyTypeForCust));
    } else if (speci == "COUNTRY") {
      res.json(mock.COUNTRY);
    }

    console.log("res/////", res.json(mock.getRefData));
  } else {
    let baseUrl =
      "/tibchassisrestservice/rest/referencedataservice/referencedataauth/";
    let domain = req.body.domain;
    let context = req.body.context;
    let entity = req.body.entity;
    let referanceName = req.body.referanceName;

    const param = req.body;
    console.log("domain part", req.body.domain);
    console.log("context part", context);
    console.log("entity part", entity);
    console.log("referanceName part", referanceName);

    baseUrl =
      baseUrl +
      domain +
      "/" +
      context +
      "/" +
      entity +
      "/" +
      referanceName +
      "?opId=" +
      req.session.options.headers.opID +
      "&buId=" +
      req.session.options.headers.buID +
      "&language=" +
      req.session.options.headers.lang +
      "&userId=" +
      req.session.options.headers.userID;
    console.log("baseUrl", baseUrl);

    axios
      .all([axiosInstance.get(app.get("apiPrefix") + baseUrl, req.session.options)])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          console.log("ACCT_SEGMENT////", themeResp);
          var resObject = [];
          console.log("ACCT_SEGMENT////", themeResp);

          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        console.log("error", error);
        handleServiceErros(error, res);
      });
  }
});

router.post('/searchFeasibiltyHeaderList', (req, res) => {
  console.log("searchFeasibiltyHeaderList::::", req.body);
  const param = req.body;
  if (mock.isMock) {
    res.json(mock.searchFeasibiltyHeaderList);
  }
  else {
    res.json(mock.searchFeasibiltyHeaderList);

  }
});

router.post('/brnResultsHeaderList', (req, res) => {
  console.log("brnResultsHeaderList::::", req.body);
  const param = req.body;
  if (mock.isMock) {
    res.json(mock.brnResultsHeaderList);
  }
  else {
    res.json(mock.brnResultsHeaderList);

  }
});


router.post("/searchCustomer", (req, res) => {
  if (mock.isMock) {
    res.json(mock.searchGlobal);
  } else {
    //printlog('EXPRESS REQUEST TO searchCustomer: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO searchCustomer PARAM: ',param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/crmservices/customer/details",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getPaymentReceipt", (req, res) => {
  if (mock.isMock) {
    console.log("enter in serverDev getPaymentReceipt");
    res.json(mock.getPaymentReceipt);
  } else {
    res.json(mock.getPaymentReceipt);
  }
});

router.post("/updateTaskStatus", (req, res) => {
  if (mock.isMock) {
    console.log("enter in serverDev updateTaskStatus");
    res.json(mock.updateTaskStatus);
  } else {
    const param = req.body.payload;
    console.log("param updateTaskStatus:::", param);
    axios
      .all([
        axiosInstance.patch(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/updateTaskStatus",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getProcessFlowForServiceCE", (req, res) => {
  if (mock.isMock) {
    res.json(mock.getProcessFlowForService);
  } else {
    const param = req.body.serviceType;

    // const param = req.body;

    console.log("EXPRESS REQUEST TO getProcessFlowForServiceCE PARAM: ", req.body);
    let packageID = "PB19102";
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/getProcessFlowForService?serviceList=" +
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          printlog("getProcessFlowForServiceCE res", themeResp.data);
          console.log("getProcessFlowForServiceCE res", themeResp.data);
          if (
            themeResp.data.responseObject &&
            themeResp.data != null &&
            null != themeResp.data.responseStatusList &&
            null != themeResp.data.responseStatusList.status &&
            themeResp.data.responseStatusList.status[0].statusType.toUpperCase() ==
            "SUCCESS"
          ) {
            //Object.entries(themeResp.data.responseObject).forEach((data) => {
            console.log("each prcessFlow object", themeResp.data.responseObject.PerformFeasibility);
            if (null != themeResp.data.responseObject && null != themeResp.data.responseObject.PerformFeasibility) {
              let newParam = {
                size: "100",
                from: "0",
                searchFilters: {
                  customerId: req.body.customerId,
                },
              };
              axios
                .all([
                  axiosInstance.post(
                    app.get("apiPrefix") +
                    "/hobsrestgateway/crmservices/customer/findCustomer",
                    newParam,
                    req.session.options
                  ),
                ])
                .then(
                  axios.spread((themeRespFindCustomer) => {
                    console.log("themeRespFindCustomer::::", themeRespFindCustomer.data);
                    //printlog(themeResp.data);
                    // res.json(themeResp.data);

                    if (
                      themeRespFindCustomer.data.responseObject
                        .customerSummary &&
                      themeRespFindCustomer.data.responseObject
                        .customerSummary.length > 0
                    ) {
                      let addresscheckParam = {
                        requestObject: {
                          serviceQualificationItem: [
                            {
                              service: {
                                serviceSpecification: {
                                  name: req.body.serviceType,
                                },
                                place: [
                                  {
                                    name: themeRespFindCustomer.data
                                      .responseObject.customerSummary[0]
                                      .stringifiedAddress,
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      };
                      axios
                        .all([
                          axiosInstance.post(
                            app.get("apiPrefix") +
                            "/hobsrestgateway/omconsoleservices/services/serviceQualification",
                            addresscheckParam,
                            req.session.options
                          ),
                        ])
                        .then(
                          axios.spread((themeRespFinal) => {
                            // themeRespFinal.data = {...themeRespFinal.data,performFeasibility:true}
                            console.log(
                              "themeRespFinal serviceQualification:::",
                              themeRespFinal.data,
                              themeRespFinal.data.responseObject
                                .serviceQualificationItem
                            );
                            // res.json(themeRespFinal.data);
                            if (
                              (themeRespFinal.data != null &&
                                null !=
                                themeRespFinal.data.responseStatusList &&
                                null !=
                                themeRespFinal.data.responseStatusList
                                  .status &&
                                themeRespFinal.data.responseStatusList.status[0].statusType.toUpperCase() ==
                                "SUCCESS" &&
                                themeRespFinal.data.responseObject.qualificationResult.toUpperCase() ==
                                "QUALIFIED")
                            ) {
                              console.log("Request Body For ReasonCode :: ", req.body.reasonCode)
                              let param1 = { "channelId": "Pulse", "userTokenString": "wolve_test", "ServiceType": req.body.serviceType, "productType": "Package,PACKAGE", "productCategory": req.body.serviceType, "isAlacarte": false };

                              let dealerparam = {
                                "retrieveDealerInput": {
                                  "listOfCelRetrieveDealerProfileRequest": {
                                    "partnerContact": {
                                      "loginName": "S115124941"
                                    }
                                  }
                                }
                              };
                              let cobpParam = {
                                "sourcePassId": null,
                                "sourcePackageID": req.body.pkgID,
                                "targetPackageID": null,
                                "targetPassId": null,
                                "convergence": "N",
                                "ep": "",
                                "source": "",
                                "age": ""
                              }

                              axios
                                .all([
                                  //axiosInstance.post(app.get('apiPrefix')+'/hobsrestgateway/cartservices/cart/getEligibleProductOffering/v2',param
                                  axiosInstance.post(
                                    app.get("apiPrefix") +
                                    "/hobsrestgateway/cartservices/cart/getEligibleProductOffering/v2?from=0&size=3000",
                                    param1,
                                    req.session.options
                                  ),
                                  axiosInstance.post(
                                    "https://sit.hobs.celcom.com.my/dealerRetrieval/dealerRetrieval",
                                    dealerparam, {
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'SourceApplicationID': 'DTE',
                                      'UUID': 'app_selfcare',
                                      'buId': 'DEFAULT',
                                      'channel': 'ONL',
                                      'interactionDate': '2019-07-03T16:15:00+05:30',
                                      'interactionId': 'I207556616443',
                                      'lang': 'ENG',
                                      'opId': 'HOB',
                                      'serviceName': 'SubmitOrder',
                                      'triggeredBy': 'user101',
                                      'password': 'password'
                                    }
                                  }

                                  ),
                                  axiosInstance.post(
                                    "https://dev.hobs.celcom.com.my/hobsrestgateway/cobpfetchservices/order/v1/fetchCobpMatrix",
                                    cobpParam, {
                                    headers: {
                                      'content-type': 'application/json',

                                      'accept': '*/*',

                                      'accept-encoding': 'gzip, deflate, br',
                                      'connection': 'keep-alive',

                                      'opId': 'HOB',
                                      'buId': 'DEFAULT'
                                    }
                                  }
                                  )

                                ])
                                .then(
                                  axios.spread((themeRespOffers, dealerResp, cobpResp) => {
                                    //printlog(themeResp.data);
                                    if (
                                      themeRespOffers.data &&
                                      themeRespOffers.data
                                        .responseStatusList &&
                                      themeRespOffers.data.responseStatusList
                                        .status[0].statusCode == "0000"
                                    ) {
                                      const dealerPartNo = [];
                                      if (null != dealerResp.data && null != dealerResp.data.retrieveDealerOutput && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0] && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0] && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine) {
                                        for (let i = 0; i < dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine.length; i++) {
                                          if (null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i] && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct) {
                                            for (let j = 0; j < dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct.length; j++) {
                                              if (null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct[j].partNo) {
                                                dealerPartNo.push(dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct[j].partNo);
                                              }
                                            }
                                          }

                                        }
                                      }

                                      const crpMatrixtargetPackageID = [];
                                      if (null != cobpResp.data && null != cobpResp.data.fetchCobpMatrixResponse && null != cobpResp.data.fetchCobpMatrixResponse.responseBody && null != cobpResp.data.fetchCobpMatrixResponse.responseBody.packagedetails && null != cobpResp.data.fetchCobpMatrixResponse.responseBody.packagedetails.listOfCRPTarget) {
                                        for (let i = 0; i < cobpResp.data.fetchCobpMatrixResponse.responseBody.packagedetails.listOfCRPTarget.length; i++) {
                                          if (null != cobpResp.data.fetchCobpMatrixResponse.responseBody.packagedetails.listOfCRPTarget[i].targetPackageID) {
                                            crpMatrixtargetPackageID.push(cobpResp.data.fetchCobpMatrixResponse.responseBody.packagedetails.listOfCRPTarget[i].targetPackageID)
                                          }
                                        }
                                      }

                                      console.log("Length of CRP matrix", crpMatrixtargetPackageID.length)
                                      console.log("Length1", dealerPartNo.length);

                                      const common = [];
                                      for (let i = 0; i < themeRespOffers.data.responseObject.length; i++) {
                                        if (crpMatrixtargetPackageID.includes(themeRespOffers.data.responseObject[i].productSpecID) == true) {
                                          common.push(themeRespOffers.data.responseObject[i].productSpecID)
                                        }


                                      }
                                      console.log("Length of common", common.length);

                                      const commonPlans = [];
                                      for (let i = 0; i < common.length; i++) {
                                        if (dealerPartNo.includes(common[i])) {
                                          commonPlans.push(common[i]);
                                        }
                                      }

                                      console.log("Length of commonPlans", commonPlans.length);
                                      const finalPlans = [];
                                      for (let i = 0; i < themeRespOffers.data.responseObject.length; i++) {
                                        if (commonPlans.includes(themeRespOffers.data.responseObject[i].productSpecID))
                                          finalPlans.push(themeRespOffers.data.responseObject[i]);
                                      }

                                      console.log("Length of Final Plans", finalPlans.length);
                                      themeRespOffers.data.responseObject = finalPlans;


                                      res.json(themeRespOffers.data);
                                    }
                                    else {
                                      themeRespOffers.data.responseStatusList =
                                      {
                                        status: [
                                          {
                                            statusCode: "9999",
                                            errorStatusDescription: "Error",
                                            statusType: "Error",
                                          },
                                        ],
                                      };
                                      res.json(themeRespOffers.data);
                                    }
                                  })
                                )
                                .catch((error) => {
                                  handleServiceErros(error, res);
                                });
                            } else {
                              themeRespFinal.data.responseStatusList = {
                                status: [
                                  {
                                    statusCode: "9999",
                                    errorStatusDescription: "Error Not Qualified",
                                    statusType: "Error",
                                  },
                                ],
                              };
                              res.json(themeRespFinal.data);
                            }
                          })
                        )
                        .catch((error) => {
                          handleServiceErros(error, res);
                        });
                    } else {
                      let errResp = {
                        responseStatusList: {
                          status: [
                            {
                              statusCode: "9999",
                              errorStatusDescription: "Error customer summary not there",
                              statusType: "Error",
                            },
                          ],
                        },
                      };
                      res.json({ ...themeRespFindCustomer.data, errResp });
                    }
                  })
                )
                .catch((error) => {
                  handleServiceErros(error, res);
                });
            }
            console.log("requesttttt Bodyyy", req.body);
            let param1 = { "channelId": "Pulse", "userTokenString": "wolve_test", "ServiceType": req.body.serviceType, "productType": "Package,PACKAGE", "productCategory": req.body.serviceType, "isAlacarte": false };

            let dealerparam = {
              "retrieveDealerInput": {
                "listOfCelRetrieveDealerProfileRequest": {
                  "partnerContact": {
                    "loginName": "S115124941"
                  }
                }
              }
            };
            let cobpParam = {
              "sourcePassId": null,
              "sourcePackageID": packageID,
              "targetPackageID": null,
              "targetPassId": null,
              "convergence": "N",
              "ep": "",
              "source": "",
              "age": ""
            };
            console.log("cobpParam", cobpParam);
            axios
              .all([
                //axiosInstance.post(app.get('apiPrefix')+'/hobsrestgateway/cartservices/cart/getEligibleProductOffering/v2',param
                axiosInstance.post(
                  app.get("apiPrefix") +
                  "/hobsrestgateway/cartservices/cart/getEligibleProductOffering/v2?from=0&size=3000",
                  param1,
                  req.session.options
                ),
                axiosInstance.post(
                  "https://sit.hobs.celcom.com.my/dealerRetrieval/dealerRetrieval",
                  dealerparam, {
                  headers: {
                    'Content-Type': 'application/json',
                    'SourceApplicationID': 'DTE',
                    'UUID': 'app_selfcare',
                    'buId': 'DEFAULT',
                    'channel': 'ONL',
                    'interactionDate': '2019-07-03T16:15:00+05:30',
                    'interactionId': 'I207556616443',
                    'lang': 'ENG',
                    'opId': 'HOB',
                    'serviceName': 'SubmitOrder',
                    'triggeredBy': 'user101',
                    'password': 'password'
                  }
                }

                ),
                axiosInstance.post(
                  "https://dev.hobs.celcom.com.my/hobsrestgateway/cobpfetchservices/order/v1/fetchCobpMatrix",
                  cobpParam, {
                  headers: {
                    'content-type': 'application/json',

                    'accept': '*/*',

                    'accept-encoding': 'gzip, deflate, br',
                    'connection': 'keep-alive',

                    'opId': 'HOB',
                    'buId': 'DEFAULT'
                  }
                }
                )
              ])
              .then(
                axios.spread((themeRespOffers, dealerResp, cobpResp) => {
                  //printlog(themeResp.data);
                  if (
                    themeRespOffers.data &&
                    themeRespOffers.data.responseStatusList &&
                    themeRespOffers.data.responseStatusList.status[0]
                      .statusCode == "0000"
                  ) {
                    const dealerPartNo = [];
                    if (null != dealerResp.data && null != dealerResp.data.retrieveDealerOutput && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0] && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0] && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine) {
                      for (let i = 0; i < dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine.length; i++) {
                        if ((null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i] && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct && null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct)) {
                          for (let j = 0; j < dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct.length; j++) {

                            if (null != dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct[j].partNo) {
                              dealerPartNo.push(dealerResp.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct[j].partNo);
                            }
                          }
                        }

                      }
                    }

                    const crpMatrixtargetPackageID = [];
                    if (null != cobpResp.data && null != cobpResp.data.fetchCobpMatrixResponse && null != cobpResp.data.fetchCobpMatrixResponse.responseBody && null != cobpResp.data.fetchCobpMatrixResponse.responseBody.packagedetails && null != cobpResp.data.fetchCobpMatrixResponse.responseBody.packagedetails.listOfCRPTarget) {
                      for (let i = 0; i < cobpResp.data.fetchCobpMatrixResponse.responseBody.packagedetails.listOfCRPTarget.length; i++) {
                        if (null != cobpResp.data.fetchCobpMatrixResponse.responseBody.packagedetails.listOfCRPTarget[i].targetPackageID) {
                          crpMatrixtargetPackageID.push(cobpResp.data.fetchCobpMatrixResponse.responseBody.packagedetails.listOfCRPTarget[i].targetPackageID)
                        }
                      }
                    }

                    console.log("Length of CRP matrix", crpMatrixtargetPackageID.length)
                    console.log("Length1", dealerPartNo.length);

                    const common = [];
                    for (let i = 0; i < themeRespOffers.data.responseObject.length; i++) {
                      if (crpMatrixtargetPackageID.includes(themeRespOffers.data.responseObject[i].productSpecID) == true) {
                        common.push(themeRespOffers.data.responseObject[i].productSpecID)
                      }


                    }
                    console.log("Length of common", common.length);

                    const commonPlans = [];
                    for (let i = 0; i < common.length; i++) {
                      if (dealerPartNo.includes(common[i])) {
                        commonPlans.push(common[i]);
                      }
                    }

                    console.log("Length of commonPlans", commonPlans.length);
                    const finalPlans = [];
                    for (let i = 0; i < themeRespOffers.data.responseObject.length; i++) {
                      if (commonPlans.includes(themeRespOffers.data.responseObject[i].productSpecID))
                        finalPlans.push(themeRespOffers.data.responseObject[i]);
                    }

                    console.log("Length of Final Plans", finalPlans.length);
                    themeRespOffers.data.responseObject = finalPlans;
                    res.json(themeRespOffers.data);
                  } else {
                    themeRespOffers.data.responseStatusList = {
                      status: [
                        {
                          statusCode: "9999",
                          errorStatusDescription: "Error when feasibility not required",
                          statusType: "Error",
                        },
                      ],
                    };
                    res.json(themeRespOffers.data);
                  }
                })
              )
              .catch((error) => {
                handleServiceErros(error, res);
              });
            // themeResp.data = {...themeResp.data,performFeasibility:false,serviceType:req.body.serviceType}
            // console.log("themeRespFinal :::",themeResp.data)
            // res.json(themeResp.data);
          }
          //});
          else {
            themeResp.data.responseStatusList = {
              status: [
                {
                  statusCode: "9999",
                  errorStatusDescription: "Error in getProcessFlowForService call",
                  statusType: "Error",
                },
              ],
            };
            res.json(themeResp.data);
          }
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getEligibleProductOffering/order", (req, res) => {
  if (mock.isMock) {
    res.json(mock.eligibleProductOffering);
  }
  else {
    console.log("Request Body", req.body.form);
    const param = {
      "retrieveDealerInput": {
        "listOfCelRetrieveDealerProfileRequest": {
          "partnerContact": {
            "loginName": "S115124941"
          }
        }
      }
    };
    let urlString = ""
    delete param["feasibilityResponse"];
    console.log("Paramm :: ", param);

    // let param1 = { "channelID": "Pulse", "userTokenString": "wolve_test", "productType": "Package,PACKAGE", "isAlacarte": false };
    let param1 = { "channelId": "Pulse", "userTokenString": "wolve_test", "ServiceType": req.body.serviceType, "productType": "Package,PACKAGE", "productCategory": req.body.serviceType, "isAlacarte": false };

    //printlog('EXPRESS REQUEST TO getEligibleProductOffering PARAM: ',param);
    if (param.cartInstanceIdentifier !== null && param.cartInstanceIdentifier !== undefined) {
      urlString = "/hobsrestgateway/cartservices/cart/getEligibleProductOffering/v2?from=0&size=3000&cartInstanceIdentifier=" + param.cartInstanceIdentifier
    }
    else {
      urlString = "/hobsrestgateway/cartservices/cart/getEligibleProductOffering/v2?from=0&size=3000"
    }
    delete param["cartInstanceIdentifier"];
    console.log('EXPRESS REQUEST TO getEligibleProductOffering PARAM: ', param1);
    //console.log('EXPRESS REQUEST TO getEligibleProductOffering PARAM: ', param2);

    axios
      .all([
        //axiosInstance.post(app.get('apiPrefix')+'/hobsrestgateway/cartservices/cart/getEligibleProductOffering/v2',param
        axiosInstance.post(
          app.get("apiPrefix") +
          urlString,
          param1,
          req.session.options
        ),
        axiosInstance.post(
          "https://sit.hobs.celcom.com.my/dealerRetrieval/dealerRetrieval",
          param, {
          headers: {
            'Content-Type': 'application/json',
            'SourceApplicationID': 'DTE',
            'UUID': 'app_selfcare',
            'buId': 'DEFAULT',
            'channel': 'ONL',
            'interactionDate': '2019-07-03T16:15:00+05:30',
            'interactionId': 'I207556616443',
            'lang': 'ENG',
            'opId': 'HOB',
            'serviceName': 'SubmitOrder',
            'triggeredBy': 'user101',
            'password': 'password'
          }
        }

        )

      ])
      .then(
        axios.spread((themeResp, themeResp1) => {
          console.log("dealer response", themeResp1.data);
          const dealerPartNo = [];
          if (null != themeResp1.data && null != themeResp1.data.retrieveDealerOutput && null != themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse && null != themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0] && null != themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner && null != themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0] && null != themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine && null != themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine) {
            for (let i = 0; i < themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine.length; i++) {
              if (null != themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i] && null != themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct && null != themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct) {
                for (let j = 0; j < themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct.length; j++) {
                  if (null != themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct[j].partNo) {
                    dealerPartNo.push(themeResp1.data.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].listOfProductLine.productLine[i].listOfInternalProduct.internalProduct[j].partNo);
                  }
                }
              }
            }

          }

          console.log("Length1", dealerPartNo.length);
          // const common = [];
          // for (let i = 0; i < themeResp.data.responseObject.length; i++) {
          //   if (dealerPartNo.includes(themeResp.data.responseObject[i].productSpecID) == true) {
          //     common.push(themeResp.data.responseObject[i].productSpecID)
          //   }


          // }
          // console.log("Length of common", common.length);
          const finalPlans = [];

          if (
            themeResp.data &&
            themeResp.data.responseStatusList &&
            themeResp.data.responseStatusList.status[0]
              .statusCode == "0000"
          ) {
            for (let i = 0; i < themeResp.data.responseObject.length; i++) {
              if (dealerPartNo.includes(themeResp.data.responseObject[i].productSpecID))
                finalPlans.push(themeResp.data.responseObject[i]);
            }
            console.log("Length of Final plans", finalPlans.length);
            themeResp.data.responseObject = finalPlans;
          }
          // if (
          //   themeResp.data &&
          //   themeResp.data.responseStatusList &&
          //   themeResp.data.responseStatusList.status[0]
          //     .statusCode == "9901"
          // ){
          //   res.json(themeResp.data);
          // }



          res.json(themeResp.data);

        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }



});

router.post("/getDeviceCategories", (req, res) => {
  console.log("EXPRESS REQUEST TO getDeviceCategories: ");
  if (mock.isMock)
    res.json(mock.deviceCategories);
  else {
    console.log('EXPRESS REQUEST TO getDeviceCategories: filterPayload',req.body.filterPayload);
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/cartservices/device/getDeviceCategories?filters='
         + req.body.filterPayload, req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("getDeviceCategories::::themeResp.data ", themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post("/searchDeviceByCategory", (req, res) => {
  console.log("devices searchDeviceByCategory", req.body);
  if (mock.isMock) {
    res.json(mock.eligibleDeviceOffering);
  } else {
    const param = req.body;
    let baseUrl =
      "/hobsrestgateway/cartservices/device/searchDeviceByCategory";
    console.log("SearchDeviceByCategory Base Url :: ", baseUrl);
    axios
      .all([axiosInstance.post(app.get("apiPrefix") + baseUrl, param, req.session.options)])
      .then(
        axios.spread((themeResp) => {
          console.log("SearchDeviceByCategory::::themeResp.data ", themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});
router.post("/searchProductOfferingBySpecification", (req, res) => {
  console.log("devices searchProductOfferingBySpecification", req.body);
  if (mock.isMock) {
    res.json(mock.searchProductOfferingBySpecification);
  } else {
    const param = req.body.payload;
    let baseUrl =
      "/hobsrestgateway/cartservices/device/searchProductOfferingBySpecification";
    console.log("SearchProductOfferingBySpecification Base Url :: ", baseUrl);
    axios
      .all([axiosInstance.post(app.get("apiPrefix") + baseUrl, param, req.session.options)])
      .then(
        axios.spread((themeResp) => {
          console.log("SearchProductOfferingBySpecification::::themeResp.data ", themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});
router.post("/getAvailableBundlesForDevice", (req, res) => {
  console.log("EXPRESS REQUEST TO getAvailableBundlesForDevice: ");
  if (mock.isMock)
    res.json(mock.availableBundlesForDevice);
  else {
    console.log('EXPRESS REQUEST TO getAvailableBundlesForDevice: req.body.deviceID',req.body.deviceID);
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/cartservices/device/getAvailableBundlesForDevice?deviceIDList='
         + req.body.deviceID, req.session.options)
    ]).then(axios.spread((themeResp) => {
      console.log("getAvailableBundlesForDevice themeResp::::", themeResp);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post("/getServiceList", (req, res) => {
  if (mock.isMock) {
    res.json(mock.servicesList);
  } else {
    console.log(
      "EXPRESS REQUEST TO getServiceList: ",
      req._parsedUrl.pathname,
      req.body
    );
    const param = req.body;
    console.log("EXPRESS REQUEST TO getServiceList PARAM: ", param);

    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") + "/TIBPCServices/services/getServiceList",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getAppConfigJson", (req, res) => {
  if (mock.isMock) {
    res.json(mock.getAppConfigJson);
  } else {
    const param = req.body.projectName;
    console.log("param App COnfig :: ", param, req.session.options);
    //printlog('EXPRESS REQUEST TO getcartforsubscription PARAM: ',param);
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/hobsrestgateway/tibchassisservices/appSettingsData/FrontOffice/" +
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getcartforsubscription", (req, res) => {
  if (mock.isMock) {
    res.json(mock.getcartforsubscription);
  } else {
    //printlog('EXPRESS REQUEST TO getcartforsubscription: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO getcartforsubscription PARAM: ',param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/loadSubscribedProductsInCart",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
          //res.json('{"cartInstanceIdentifier": "3438286b-0711-4ebe-ad45-9832c32952fa", "invokingSystemID": "frontoffice","responseStatusList": { "status": [{ "statusCode": "20000","statusDescription": "Details sent in the response", "statusType": "Success", "statusCategory": "Success"}]}}');
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/basicDetailsCheck", (req, res) => {
  if (mock.isMock) {
    res.json(mock.basicDetailsCheckRes);
  } else {
    //wolverine changes 
  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append('client_id', 'aAue6lkxYKrQpwAgF6CDxNsmvKIa')
  params.append('client_secret', 'iUX7P09Y9S8zq5KmxFIFDxaQ0AQa')

  const hd = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  }

  axios.post("https://igw.apistg.celcom.com.my/token", params, hd)
    .then((result) => {
      token = result.data.access_token
      const param1 = {
        "customerIdType": "",
        "customerIdNo":req.body.formData.form1.idNumber,
        "system": "All"
      }
     if(req.body.formData.form1.CustomerlegalID == "New NRIC" ){
       param1.customerIdType = "1"
     }
     if(req.body.formData.form1.CustomerlegalID == "Old NRIC" ){
      param1.customerIdType = "0"
    }
    if(req.body.formData.form1.CustomerlegalID == "Passport" ){
      param1.customerIdType = "2"
    }
    if(req.body.formData.form1.CustomerlegalID == "Military" ){
      param1.customerIdType = "3"
    }
    if(req.body.formData.form1.CustomerlegalID == "Police" ){
      param1.customerIdType = "4"
    }
      axios.post(
        "https://igw.apistg.celcom.com.my/customer-account-blacklistinfo-query/v1.0/accounts/blacklistinfo",
        param1,
        {
          headers: {
            "Authorization": "Bearer "+ token,
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        }
      )
        .then((result) => {
          if (result.data.internal.status == 'Failed' && result.data.external.status == 'Failed') {
            res.json(mock.basicDetailsCheckRes);
          } else {
            console.log("You are Blacklisted")
            mock.blacklistChkFailedRes.responseStatusList.status[0].statusDescription = "Customer ID: " + param1.customerIdNo + " is blacklisted";
            res.json(mock.blacklistChkFailedRes)
          }
            res.json(themeResp1.data);
          })
          .catch((error) => {
            console.log("error", error)
            //handleServiceErros(error, res);
          });
      })
  }
});

function handleFeasibilityError(error, req, res) {
  const respData = {
    "responseStatusList": {
      "status": [
        {
          "statusCode": "1000",
          "statusDescription": error,
          "statusType": "Error"
        }
      ]
    },
    "responseObject": {
      "qualificationResult": "Not Qualified",
      "serviceQualificationItem": [
        {
          "service": {
            "serviceSpecification": {
              "name": req.body.requestObject.serviceQualificationItem[0].service.serviceSpecification.name
            }
          }
        }
      ]
    }
  }
  res.json(respData);
}

router.post("/feasibilityCheck", (req, res) => {
  if (mock.isMock) {
    res.json(mock.feasibilityCheck);
  } else {
    var array = req.body.requestObject.serviceQualificationItem[0].service.place[0].name.split(',');
    var jsonObj = {};
    for (var i = 0 ; i < array.length; i++) {
        jsonObj["array" + (i+1)] = array[i];
    }
    const reqData = {
      "interactionId" : "8",
      "interactionDate" : "Thu, 22 Apr 2021 07:25:51 GMT",
      "sourceApplication" : "PPMS",
      "requestObject" :{
        "city" : jsonObj.array4 ? jsonObj.array4 : "",
        "postalCode": jsonObj.array7? jsonObj.array7 : ""
      }
    }
    axios
      .all([
        axiosInstance.post(
          "https://sit.hobs.celcom.com.my/hobsrestgateway/manageaddressservice/address/checkserviceability",
          reqData,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          console.log("zzz themeResp :", themeResp);
          const respData = {
            "responseStatusList": {
              "status": [
                {
                  "statusCode": themeResp.data.status.statusCode,
                  "statusDescription": themeResp.data.status.statusDescription,
                  "statusType": themeResp.data.status.statusName
                }
              ]
            },
            "responseObject": themeResp.data.responseObject
          }
          if (themeResp.data.status.statusCode === "0000"){
            res.json(respData);
          }
          else {
            handleFeasibilityError(error, req, res);
          }
        })
      )
      .catch((error) => {
        handleFeasibilityError(error, req, res);
      });
  }
});

router.post("/getCustomerDetails", (req, res) => {
  if (mock.isMock) {
    res.json(mock.getCustomerDetails);
  } else {
    const param = req.body;
    console.log("param serverdev getAccountContactDetails:::", param);
    // res.json(mock.customerPartyDetails);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/CRMBusinessServices/services/CRMBusinessRestServices/getCustomerDetails",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          console.log("themeResp::::1", themeResp);
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getFormatedAddressData", (req, res) => {
  if (mock.isMock) {
    res.json(mock.feasibilityCheck);
  } else {
    res.json(formService.getFormatedAddressData(req));
  }
});

router.post("/getShoppingCart", (req, res) => {
  if (mock.isMock) {
    res.json(mock.getShoppingCart);
  } else {
    const userID = req.body.userID;
    const cartInstanceIdentifier = req.body.cartInstanceIdentifier;
    if (null != cartInstanceIdentifier && undefined != cartInstanceIdentifier) {
      //  console.log('EXPRESS REQUEST TO getShoppingCartByUser: ', req._parsedUrl.pathname);
      //console.log("suren getShoppingCart for ",cartInstanceIdentifier);
      const param = req.body.userID;
      //  console.log('EXPRESS REQUEST TO getcartforsubscription PARAM: ',param);
      axios
        .all([
          axiosInstance.get(
            app.get("apiPrefix") +
            "/hobsrestgateway/cartservices/cart/getShoppingCartByID/?id=" +
            cartInstanceIdentifier,
            req.session.options
          ),
        ])
        .then(
          axios.spread((themeResp) => {
            console.log(themeResp.data);
            res.json(themeResp.data);
          })
        )
        .catch((error) => {
          handleServiceErros(error, res);
        });
    } else {
      //printlog('EXPRESS REQUEST TO getcartforsubscription: ', req._parsedUrl.pathname, req.body);
      const param = req.body;
      //printlog('EXPRESS REQUEST TO getcartforsubscription PARAM: ',param);
      axios
        .all([
          axiosInstance.post(
            app.get("apiPrefix") +
            "/hobsrestgateway/cartservices/cart/getShoppingCart",
            param,
            req.session.options
          ),
        ])
        .then(
          axios.spread((themeResp) => {
            //printlog(themeResp.data);
            res.json(themeResp.data);
          })
        )
        .catch((error) => {
          handleServiceErros(error, res);
        });
    }
  }
});

router.post("/getShoppingCartByUser", (req, res) => {
  if (mock.isMock) {
    res.json(mock.addToCart);
  } else {
    //  console.log('EXPRESS REQUEST TO getShoppingCartByUser: ', req._parsedUrl.pathname);
    const param = req.body.userID;
    //  console.log('EXPRESS REQUEST TO getcartforsubscription PARAM: ',param);
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/getShoppingCartByUser/?userToken=" +
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          console.log(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/addAppointment", (req, res) => {
  if (mock.isMock) {
    res.json(mock.addAppointment);
  } else {
    // res.json(mock.addAppointment)
    const param = req.body;
    console.log(param);
    if (null != param["getSlotResponse"]) {
      console.log("param removed");
      delete param["getSlotResponse"];
    }
    console.log(param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/omconsoleservices/appointment/addAppointment/" +
          req.body.cartInstanceIdentifier,
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          console.log("themeResp::::", themeResp);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/editAppointment", (req, res) => {
  if (mock.isMock) {
    res.json(mock.editAppointment);
  } else {
    // res.json(mock.editAppointment)
    const param = req.body;
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/omconsoleservices/appointment/editAppointment/" +
          req.body.cartInstanceIdentifier,
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/removeAppointment", (req, res) => {
  if (mock.isMock) {
    res.json(mock.removeAppointment);
  } else {
    // res.json(mock.removeAppointment)
    const param = req.body;
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/omconsoleservices/appointment/removeAppointment/" +
          req.body.cartInstanceIdentifier,
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getAppointment", (req, res) => {
  if (mock.isMock) {
    res.json(mock.getAppointmentDetails);
  } else {
    // res.json(mock.getAppointmentDetails)
    const urlString = req.body.cartInstanceIdentifier;
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/hobsrestgateway/omconsoleservices/appointment/retrieveAppointment/" +
          urlString,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getAppointmentSlots", (req, res) => {
  if (mock.isMock) {
    res.json(mock.getAppointmentSlots);
  } else {
    // res.json(mock.getAppointmentSlots)
    const param = req.body;
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/omconsoleservices/appointment/searchAppointment",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getcustomerSubscriptions", (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    //printlog('EXPRESS REQUEST TO getcustomerSubscriptions: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    // printlog('EXPRESS REQUEST TO getcustomerSubscriptions PARAM: ',param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/crmservices/customer/details",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //  printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.get("/sseEvents", (req, res) => {
  sendSSE(req, res);
});

function sendSSE(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  let counter = 0;
  var id = new Date().toLocaleTimeString();
  // Sends a SSE every 5 seconds on a single connection.
  setInterval(function () {
    constructSSE(res, id, new Date().toLocaleTimeString(), ++counter);
  }, 5000);
  constructSSE(res, id, new Date().toLocaleTimeString(), ++counter);
}

function constructSSE(res, id, data, counter) {
  //res.write('id: ' + id + '\n');
  res.write("data: " + JSON.stringify(mock.addToCart) + "\n\n");
}

function debugHeaders(req) {
  sys.puts("URL: " + req.url);
  for (var key in req.headers) {
    sys.puts(key + ": " + req.headers[key]);
  }
  sys.puts("\n\n");
}

router.get("/getColelctionCheck", (req, res) => {
  if (mock.isMock) {
    res.json(mock.collectionCheck);
  } else {
    res.json(mock.collectionCheck);
  }
});

router.get("/getCreditCheck", (req, res) => {
  if (mock.isMock) {
    res.json(mock.creditCheck);
  } else {
    res.json(mock.creditCheck);
  }
});

router.get("/validateOrder", (req, res) => {
  if (mock.isMock) {
    res.json(mock.validateOrder);
  } else {
    res.json(mock.validateOrder);
  }
});

router.post("/submitOrder/order", (req, res) => {
  if (mock.isMock) {
    res.json(mock.submitOrder);
  } else {
    const param = req.body;
    // const param1 = {

    //   "cartInstanceIdentifier": req.body.cartInstanceIdentifier,

    //   "requestObject": [

    //     {

    //       "taskName": "SRF Document",

    //       "taskStatus": "completed"

    //     }

    //   ]

    // }
    console.log("Request for submit Order", param);
    axios
      .all([
      //   axiosInstance.post(

      //   "https://dev.hobs.celcom.com.my/hobsrestgateway/cartservices/cart/updateTaskStatus",

      //   param1,

      //   req.session.options

      // ),
      axiosInstance.post(
        app.get("apiPrefix") +
        "/hobsrestgateway/cartservices/cart/submitOrder",
        param,
        req.session.options
      )

      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
         // console.log("SRF status Response", themeResp1);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.get("/addInteraction", (req, res) => {
  if (mock.isMock) {
    res.json(mock.addInteraction);
  } else {
    res.json(mock.addInteraction);
  }
});

router.get("/sendNotification", (req, res) => {
  if (mock.isMock) {
    res.json(mock.sendNotification);
  } else {
    res.json(mock.sendNotification);
  }
});

router.get("/checkForShipping", (req, res) => {
  if (mock.isMock) {
    res.json(mock.checkForShipping);
  } else {
    res.json(mock.checkForShipping);
  }
});

router.post("/findAddress", (req, res) => {
  console.log("Api :: ", req.body);
  if (mock.isMock) {
    res.json(mock.findAddress);
  } else {
    // axios
    //   .all([axiosInstance.post(app.get("apiPrefix") + baseUrl, param, req.session.options)])
    //   .then(
    //     axios.spread((themeResp) => {
    //       if (themeResp.data.statusList[0].statusCode == "0000") {
    //         res.json(formService.findAddress(themeResp));
    //       } else {
    //         res.json(themeResp.data);
    //       }
    //     })
    //   )
    //   .catch((error) => {
    //     handleServiceErros(error, res);
    //   });


    pth = path.join(__dirname, '/DigiCertGlobalRootCA.crt.pem')
    console.log("This is the path", pth)
    con_para = {
      host: '10.8.45.132',
      user: 'bizpartnerusr',
      password: 'bizpartnerc!1S',
      database: 'bizpartner',
      ssl: {
        ca: fs.readFileSync(pth)
      }
    }
    var conn = mysql.createConnection(con_para);
    conn.connect(function (err) {
      if (err) {
        console.log('error connecting: ' + err.stack);
        return;
      }
      console.log('connected as id ' + conn.threadId);
    });
    conn.query(`SELECT city, state, postalcode FROM pin_address_map WHERE postalcode='` + req.body.generalSearch +`'`, function (err, result) {
      if (err) {
        console.log('error creating table: ' + err.stack);
        return;
      }
      console.log("output ORI:::", result);
      // console.log("output SPICY:::", result.city);
      var string=JSON.stringify(result);
      console.log("output SPICY string :::", string);
      var json =  JSON.parse(string);
      console.log("output SPICY json :::", json);
      console.log("output SPICY json.city :::", json[0].city);
      var re = { data: json[0] }
      // res.json(re)
      res.json(formService.findAddress(re));
    });
  }
});

router.post("/duplicateCustomerCheck", (req, res) => {
  console.log("Api :: ");
  if (mock.isMock) {
    res.json(mock.duplicateCustomerCheck);
  } else {
    // res.json(mock.duplicateCustomerCheck)
    const param = req;
    console.log("Request duplicatee customer check :: ", req);
    console.log("param serverdev:::", param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/crmservices/duplicateCheckCustomer/checkDuplicateCustomer",
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

router.get("/creditCheck", (req, res) => {
  console.log("Api :: ");
  if (mock.isMock) {
    res.json(mock.creditCheckRes);
  } else {
    res.json(mock.creditCheckRes);
  }
});

router.post("/createCustomer", (req, res) => {
  console.log("Customer API :: ");
  if (mock.isMock) {
    res.json(mock.customer);
  } else {

    delete req.body["customer"]["customerCategory"];
    delete req.body["customer"]["customerSegment"];
    req.body["customer"]["customerContact"][0]["contactMedium"][0]["address"][0]["addressLine4"] = req.body["formData"][1]["addressLine4"];
    req.body["customer"]["customerContact"][0]["contactMedium"][0]["address"][0]["addressLine5"] = req.body["formData"][1]["addressLine5"];
    req.body["customer"]["customerContact"][0]["contactMedium"][0]["address"][0]["addressLine6"] = req.body["formData"][1]["addressLine6"];
    req.body["customer"]["customerContact"][0]["party"]["individualName"][0]["formOfAddress"] = req.body["formData"][0]["title"];
    // wolverine changes start - 23/03/22
    // req.body["customer"]["customerContact"][0]["contactMedium"][0]["telephoneNumber"] = req.body["formData"][0]["basicmobilenumber"];
    //23/02/22

    req.body.customer.customerContact[0].party.identification[0] =
    {
      "id": req.body.formData[0].idNumber,
      "idType": req.body.formData[0].CustomerlegalID
    }
    //req.body.customer.party.legalID = req.body.formData[0].idNumber;
    req.body.customer.party.identification[0] =
    {
      "id": req.body.formData[0].idNumber,
      "idType": req.body.formData[0].CustomerlegalID
    }
    const date = req.body.formData[0].dateOfBirth;

    const event2 = new Date(date);

    const date1 = event2.toLocaleDateString();

    const [day, month, year] = date1.split('/');

    const result = [year, month, day].join('-');
    var finalDOB = result + "+08:00";

    //req.body.formData[0].dateOfBirth = result + timeResult;
    req.body.formData[0].dateOfBirth = finalDOB;
    req.body.customer.customerContact[0].party.dateOfBirth = finalDOB;
    req.body.customer.party.dateOfBirth = finalDOB;
    console.log("final date", req.body.customer.customerContact[0].party.dateOfBirth)
    // req.body.customer.party.dateOfBirth = req.body.formData[0].dateOfBirth;
    req.body.customer.customerContact[0].party.gender = req.body.formData[0].gender;
    req.body.customer.party.gender = req.body.formData[0].gender;
    req.body["customer"]["customerContact"][0]["party"]["customIndividualParty"] = {
      "individualAttributes": {
        "attribute": [
          {
            "attributeName": "race",
            "attributeId": "contact.extension.addlinfo.race",
            "attributeValue": req.body["formData"][0]["race"]
          },
          {
            "attributeName": "homeNumber",
            "attributeId": "contact.extension.addlinfo.homeNumber",
            "attributeValue": req.body["formData"][0]["homeNumber"]
          },
          {
            "attributeName": "officeNumber",
            "attributeId": "contact.extension.addlinfo.officeNumber",
            "attributeValue": req.body["formData"][0]["officeNumber"]
          },
          {
            "attributeName": "alternateMobileNumber",
            "attributeId": "contact.extension.addlinfo.alternateMobileNumber",
            "attributeValue": req.body["formData"][0]["alternateMobileNumber"]
          },
          {
            "attributeName": "alternateContactNumber",
            "attributeId": "contact.extension.addlinfo.alternateContactNumber",
            "attributeValue": req.body["formData"][0]["alternateContactNumber"]
          },
          {
            "attributeName": "mothermaidenname",
            "attributeId": "contact.extension.addlinfo.mothermaidenname",
            "attributeValue": req.body["formData"][0]["mothermaidenname"]
          },
          {
            "attributeName": "businessRegistrationNumber",
            "attributeId": "contact.extension.addlinfo.businessRegistrationNumber",
            "attributeValue": req.body["formData"][0]["businessRegistrationNumber"]
          },
          {
            "attributeName": "company",
            "attributeId": "contact.extension.addlinfo.company",
            "attributeValue": req.body["formData"][0]["company"]
          },
          {
            "attributeName": "CustomerlegalID",
            "attributeId": "contact.extension.addlinfo.CustomerlegalID",
            "attributeValue": req.body["formData"][0]["CustomerlegalID"]
          },
          {
            "attributeName": "idNumber",
            "attributeId": "contact.extension.addlinfo.idNumber",
            "attributeValue": req.body["formData"][0]["idNumber"]
          }


        ]
      }
    };
    req.body.customer.customerCategory = "Consumer";
    req.body.customer.customerSegment = "Retail";
    const param = req.body;
    console.log("param serverdev:::", param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") + "/hobsrestgateway/crmservices/customer",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          console.log("themeResp::::", themeResp.data);
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getShippingContact", (req, res) => {
  if (mock.isMock) {
    //printlog("entering to getShippingAddress mock api");
    res.json(mock.getShippingContact);
  } else {
    //const param =
    customerId = req.body.customerID;
    urlString = req.body.cartInstanceIdentifier;
    console.log("getShippingContact req :::", req);
    console.log("getShippingContact req body:::", req.body);
    console.log(
      "getShippingContact url :::",
      app.get("apiPrefix") +
      "/hobsrestgateway/omconsoleservices/shippingservices/getShippingContact/" +
      urlString
    );
    //res.json(mock.getShippingContact)
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/hobsrestgateway/omconsoleservices/shippingservices/getShippingContact/" +
          urlString +
          "?customerId=" +
          customerId,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          printlog(themeResp);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/makePaymentCE", (req, res) => {
  if (mock.isMock) {
    console.log("enter in serverDev makePaymentCE");
    res.json(mock.getPaymentReceipt);
  } else {
    res.json(mock.getPaymentReceipt);
  }
});

router.post("/makePayment", (req, res) => {
  if (mock.isMock) {
    console.log("enter in serverDev makePaymentCE");
    res.json(mock.makePayment);
  } else {
    // res.json(mock.makePayment)
    const param = req.body.payload;
    const addTocartCartResponse = req.body.payload.makePaymentAddToCartResponse;
    const cartId =
      req.body.payload.makePaymentAddToCartResponse.responseObject
        .cartUniqueIdentifier;
    const customerName = req.body.payload.customerName;
    delete req.body.payload["makePaymentFormData"];
    delete req.body.payload["makePaymentAddToCartResponse"];
    delete req.body.payload["customerName"];

    console.log("param serverdev Payment Make -- :::", param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/TibBillingCommonServices/services/TIBBillingCommonServicesREST/rest/makePaymentCommon",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          if (
            undefined != themeResp.data.statusList &&
            themeResp.data.statusList != null &&
            themeResp.data.statusList[0].statusCode == "0000"
          ) {
            var payload = {};
            var reqObject = [];
            var taskDetails = {};
            taskDetails["taskName"] = "ProcessPayment";
            taskDetails["taskStatus"] = "completed";
            reqObject.push(taskDetails);
            payload["cartInstanceIdentifier"] = cartId;
            payload["requestObject"] = reqObject;

            axios
              .all([
                axiosInstance.patch(
                  app.get("apiPrefix") +
                  "/hobsrestgateway/cartservices/cart/updateTaskStatus",
                  payload,
                  req.session.options
                ),
              ])
              .then(
                axios.spread((themeResp1) => {
                })
              )
              .catch((error) => {
                handleServiceErros(error, res);
              });
          }
          let paymentReceipt = {};
          paymentReceipt["Customer Name"] = customerName;
          paymentReceipt["Transaction Amount"] =
            req.body.payload.payment.paymentAmountBaseCurrency.units +
            " " +
            req.body.payload.payment.paymentAmountBaseCurrency.amount;
          paymentReceipt["Payment Mode"] =
            req.body.payload.payment.paymentItem[0].paymentMethod.paymentMethodId;
          paymentReceipt["Payment Reference Id"] = themeResp.data.paymentRefID;
          const moment = require("moment");
          const d = new Date(req.body.payload.payment.paymentDate);
          paymentReceipt["Payment Date"] = moment(d).format("DD/MM/YYYY");
          paymentReceipt["Payment status"] = "Success";

          themeResp.data["paymentReceipt"] = paymentReceipt;
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/downloadPaymentCE", (req, res) => {
  if (mock.isMock) {
    console.log("enter in serverDev downloadPaymentCE");
    res.json(mock.getPaymentReceipt);
  } else {

    let data = req.body.payload.paymentData;
    let customerName;
    for (var property in data) {
      console.log(property, ":", data[property]);
      if (property == "Customer Name") {
        customerName = data[property];
      }
    }
    res.json({
      fileName: customerName + ".pdf",
      data: data,
    });
  }
});

router.post("/getJSONFormData", (req, res) => {
  if (mock.isMock) {
    if (req.body.context.formId == "order.app.basicDetails.capture") {
      res.json(mock.basicDetails);
    } else if (req.body.context.formId == "home.searchCustomer.capture") {
      res.json(mock.searchCustomerForm);
    } else if (req.body.context.formId == "order.app.basicDetailsB2C.capture") {
      res.json(mock.basicDetailsB2C);
    } else if (req.body.context.formId == "order.app.basicDetailsB2B.capture") {
      res.json(mock.basicDetailsB2B);
    } else if (
      req.body.context.formId == "order.app.customerDetailsDisplay.capture"
    ) {
      res.json(mock.customerDetailsDisplay);
    } else if (
      req.body.context.formId == "order.app.basicAddressDetails.capture"
    ) {
      res.json(mock.basicAddressDetails);
    } else if (
      req.body.context.formId == "order.app.serviceattributes.capture"
    ) {
      res.json(mock.serviceattributes);
    } else if (
      req.body.context.formId == "order.app.organizationCustomer.capture"
    ) {
      res.json(mock.organizationCustomer);
    } else if (
      req.body.context.formId == "order.app.individualCustomer.capture"
    ) {
      res.json(mock.individualCustomer);
    } else if (req.body.context.formId == "order.app.customerAddress.capture") {
      res.json(mock.customerAddress);
    } else if (
      req.body.context.formId ==
      "order.app.serviceAvailabilityAddressPF.capture"
    ) {
      res.json(mock.serviceAvailabilityAddressPF);
    } else if (
      req.body.context.formId == "order.app.createContactAddress.capture"
    ) {
      res.json(mock.createContactAddress);
    } else if (
      req.body.context.formId == "order.app.addContactAccountAddress.capture"
    ) {
      res.json(mock.addContactAccountAddress);
    } else if (
      req.body.context.formId == "order.app.contactCreationOrganization.capture"
    ) {
      res.json(mock.contactCreationOrganization);
    } else if (
      req.body.context.formId == "order.app.contactCreationIndividual.capture"
    ) {
      res.json(mock.contactCreationIndividual);
    } else if (
      req.body.context.formId == "order.app.basicDetailsLeadCreation.capture"
    ) {
      res.json(mock.basicDetailsLeadCreation);
    } else if (
      req.body.context.formId ==
      "order.app.contactCreationOrganizationPrimary.capture"
    ) {
      res.json(mock.contactCreationOrganizationPrimary);
    } else if (
      req.body.context.formId ==
      "order.app.contactCreationOrganizationSecondary.capture"
    ) {
      res.json(mock.contactCreationOrganizationSecondary);
    } else if (
      req.body.context.formId ==
      "order.app.contactCreationIndividualSecondary.capture"
    ) {
      res.json(mock.contactCreationIndividualSecondary);
    } else if (
      req.body.context.formId ==
      "order.app.contactCreationIndividualPrimary.capture"
    ) {
      res.json(mock.contactCreationIndividualPrimary);
    } else if (
      req.body.context.formId == "order.app.serviceattributesB2C.capture"
    ) {
      res.json(mock.serviceattributesB2C);
    } else if (
      req.body.context.formId == "order.app.serviceattributesB2B.capture"
    ) {
      res.json(mock.serviceattributesB2B);
    } else if (
      req.body.context.formId == "order.app.accountBillingPrepaid.capture"
    ) {
      res.json(mock.accountBillingPrepaid);
    } else if (
      req.body.context.formId == "order.app.accountBillingPostpaid.capture"
    ) {
      res.json(mock.accountBillingPostpaid);
    } else if (
      req.body.context.formId ==
      "order.app.accountBillingPreferenceDetailsPostpaid.capture"
    ) {
      res.json(mock.accountBillingPreferenceDetailsPostpaid);
    } else if (
      req.body.context.formId ==
      "order.app.accountAdditionalDetailsPostpaid.capture"
    ) {
      res.json(mock.accountAdditionalDetailsPostpaid);
    } else if (
      req.body.context.formId ==
      "order.app.accountAdditionalDetailsPrepaid.capture"
    ) {
      res.json(mock.accountAdditionalDetailsPrepaid);
    } else if (
      req.body.context.formId ==
      "order.app.accountBillingPreferenceDetailsPrepaid.capture"
    ) {
      res.json(mock.accountBillingPreferenceDetailsPrepaid);
    } else if (
      req.body.context.formId == "order.app.accountBasicDetails.capture"
    ) {
      res.json(mock.accountBasicDetails);
    } else if (
      req.body.context.formId == "order.app.customerProfileB2C.capture"
    ) {
      res.json(mock.customerProfileB2C);
    } else if (
      req.body.context.formId == "order.app.customerProfileB2B.capture"
    ) {
      res.json(mock.customerProfileB2B);
    } else if (
      req.body.context.formId == "order.app.customerAdditionalDetails.capture"
    ) {
      res.json(mock.customerAdditionalDetails);
    } else if (
      req.body.context.formId ==
      "order.app.AdvanceSearchcustomerAddress.capture"
    ) {
      res.json(mock.advanceSearchCustomerAddress);
    } else if (req.body.context.formId == "order.app.configureOfferFilter.capture") {
      res.json(mock.configureOfferFilter);
    }
    else if (req.body.context.formId == "order.app.configureAddonFilter.capture") {
      res.json(mock.configureAddonFilter);
    }
    else if (req.body.context.formId == "order.app.addNotes.capture") {
      res.json(mock.addNotesForm);
    }
    else if (req.body.context.formId == "quickorder.app.basicDetails.capture") {
      res.json(mock.QuickOrderBasicDetails);
    }
    else if (req.body.context.formId == "quickorder.app.basicAddressDetails.capture") {
      res.json(mock.QuickOrderAddressCapture);
    }
    else if (req.body.context.formId == "quickOrder.app.reviewScreen.capture") {
      res.json(mock.QuickOrderReviewScreenCapture);
    }

  } else {
    console.log("getJSONFormData req body:::", req.body);
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/" +
          req.body.context.formId,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          res.json(formService.getJSONFormData(themeResp, req));
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/addShippingContact", (req, res) => {
  if (mock.isMock) {
    res.json(mock.addShippingDetailsRes);
  } else {
    urlString = req.body.cartInstanceIdentifier;
    console.log("addShippingContact req :::", req);
    console.log("addShippingContact req body:::", req.body);
    console.log(
      "addShippingContact url :::",
      app.get("apiPrefix") +
      "/hobsrestgateway/omconsoleservices/shippingservices/addShippingContact/" +
      urlString
    );

    const param = req.body;
    console.log(param);

    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/omconsoleservices/shippingservices/addShippingContact/" +
          urlString,
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          printlog(themeResp);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/updateShippingContact", (req, res) => {
  if (mock.isMock) {
    res.json();
  } else {
    console.log("updateShippingContact req :::", req);
    console.log("updateShippingContact req body:::", req.body);
    console.log(
      "updateShippingContact url :::",
      app.get("apiPrefix") +
      "/hobsrestgateway/omconsoleservices/shippingservices/updateShippingContact/" +
      req.body.cartInstanceIdentifier
    );
    urlString = req.body.cartInstanceIdentifier;
    const param = req.body;
    console.log(param);
    axios
      .all([
        axiosInstance.patch(
          app.get("apiPrefix") +
          "/hobsrestgateway/omconsoleservices/shippingservices/updateShippingContact/" +
          urlString,
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          printlog(themeResp);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/removeShippingContact", (req, res) => {
  if (mock.isMock) {
    res.json(mock.removeShippingContactRes);
  } else {
    console.log("removeShippingContact req :::", req);
    console.log("removeShippingContact req body:::", req.body);
    console.log(
      "removeShippingContact url :::",
      app.get("apiPrefix") +
      "/hobsrestgateway/omconsoleservices/shippingservices/removeShippingContact/" +
      req.body.cartInstanceIdentifier
    );

    const param = req.body.contactIdentifier;
    console.log(param);

    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/omconsoleservices/shippingservices/removeShippingContact/" +
          req.body.cartInstanceIdentifier,
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          printlog(themeResp);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getShippingSummary", (req, res) => {
  if (mock.isMock) {
    res.json(mock.getShippingSummary);
  } else {
    console.log("getShippingSummary req :::", req);
    console.log("getShippingSummary req body:::", req.body);
    //console.log("getShippingSummary url :::", app.get('apiPrefix') + '/hobsrestgateway/omconsoleservices/shippingservices/getShippingSummary/' + urlString)

    urlString = req.body.cartInstanceIdentifier;
    //const param = req.body;
    //.json(mock.getShippingSummary)

    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/hobsrestgateway/omconsoleservices/shippingservices/getShippingSummary/" +
          urlString,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          console.log("Res ==== ", themeResp);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        console.log("Error ====", error);
        handleServiceErros(error, res);
      });
  }
});

router.post("/addShippingDetailsForProducts", (req, res) => {
  if (mock.isMock) {
    res.json(mock.addShippingDetailsForProductsRes);
  } else {
    console.log("addShippingDetailsForProducts req :::", req);
    console.log("addShippingDetailsForProducts req body:::", req.body);
    console.log(
      "addShippingDetailsForProducts url :::",
      app.get("apiPrefix") +
      "/hobsrestgateway/omconsoleservices/shippingservices/addShippingDetailsForProducts/" +
      req.body.cartInstanceIdentifier
    );

    const param = req.body;
    console.log(param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/omconsoleservices/shippingservices/addShippingDetailsForProducts/" +
          req.body.cartInstanceIdentifier,
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          printlog(themeResp);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getConfigurableOffer", (req, res) => {
  if (mock.isMock) {
    res.json(mock.offerForConfiguration);
  } else {
    //printlog('EXPRESS REQUEST TO getConfigurableOffer: ', req._parsedUrl.pathname, req.body);
    const param={
      "qualificationCriteria": {
          "channelID": "Pulse"
      },
      "requestObject": req.body.requestObject,
      "userTokenString": req.body.userTokenString ,
      "cartInstanceIdentifier":req.body.cartInstanceIdentifier
  };
//  const param = req.body;
    delete param["action"];
    const param1 = {
      "companyBRNId": "CELCOMTEST2018",
      "devicePartNumber": "MDR10077",
      "groupName": "PPA",
      "planPartNumber": "PB10850",
      "source": ""
    }
    // delete param["action"];
    //printlog('EXPRESS REQUEST TO getConfigurableOffer PARAM: ',param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/getConfigurableItemForProductOffering",
          param,
          req.session.options
        ),
        axiosInstance
          .post(
            "https://dte.ms.st.celcom.com.my/siebel-vas-corporatesubsidy-details-ms/siebel/getVASCorporatesubsidyDetails",
            param1, {
            headers: {
              "accept": "*/*",
              "Content-Type": "application/json"
            }
          }
          )

      ])
      .then(
        axios.spread((themeResp, themeResp1) => {
          //let themeResp1.data = themeResp1.data
          console.log("themeResp.data1", themeResp1.data);
          let celVasCorporateSubsidy = {
            celPlanPartNumber: "",
            celvasPartNumber: "",
            celWaiverFlag: ""
          };


          let celVasCorporateSubsidyArray = [];
          if (null != themeResp1.data && null != themeResp1.data.listOfCelVasCorporateSubsidyIo && null != themeResp1.data.listOfCelVasCorporateSubsidyIo.celVasCorporateSubsidy) {
            for (let i = 0; i < themeResp1.data.listOfCelVasCorporateSubsidyIo.celVasCorporateSubsidy.length; i++) {

              celVasCorporateSubsidy.celvasPartNumber = themeResp1.data.listOfCelVasCorporateSubsidyIo.celVasCorporateSubsidy[i].celvasPartNumber;
              celVasCorporateSubsidy.celWaiverFlag = themeResp1.data.listOfCelVasCorporateSubsidyIo.celVasCorporateSubsidy[i].celWaiverFlag;
              celVasCorporateSubsidy.celPlanPartNumber = themeResp1.data.listOfCelVasCorporateSubsidyIo.celVasCorporateSubsidy[i].celPlanPartNumber;

              celVasCorporateSubsidyArray.push(celVasCorporateSubsidy);

            }
          }
          console.log("VAluee", celVasCorporateSubsidy);


          // for (let i = 0; i < celVasCorporateSubsidyArray.length; i++) {
          //   console.log("Responseeee of Siebel API", celVasCorporateSubsidyArray[i])
          // }
          console.log("Length", celVasCorporateSubsidyArray.length);
          console.log("Length123", themeResp.data.responseObject[0].relatedProducts.length);
          for (let n = 0; n < celVasCorporateSubsidyArray.length; n++) {
            if (celVasCorporateSubsidyArray[0].celPlanPartNumber == themeResp.data.responseObject[0].productOfferingID) {
              for (let j = 0; j < celVasCorporateSubsidyArray.length; j++) {
                if (null != themeResp.data && null != themeResp.data.responseObject[0] && null != themeResp.data.responseObject[0].relatedProducts) {
                  for (let i = 0; i < themeResp.data.responseObject[0].relatedProducts.length; i++) {
                    if (celVasCorporateSubsidyArray[j].celvasPartNumber == themeResp.data.responseObject[0].relatedProducts[i].productOfferingID && celVasCorporateSubsidyArray[j].celWaiverFlag == 'Y') {
                      console.log("In If Block")
                      console.log("Label", themeResp.data.responseObject[0].relatedProducts[i].productDesc);

                      for (let k = 0; k < themeResp.data.responseObject[0].relatedProducts[i].productSpecCharacteristic.length; k++) {
                        console.log("Lengthhhhhh", themeResp.data.responseObject[0].relatedProducts[i].productSpecCharacteristic.length)
                        themeResp.data.responseObject[0].relatedProducts[i].productSpecCharacteristic[k].isMandatory = true;

                      }
                    }
                    else if (celVasCorporateSubsidyArray[j].celvasPartNumber == themeResp.data.responseObject[0].relatedProducts[i].productOfferingID && celVasCorporateSubsidyArray[j].celWaiverFlag == 'N') {

                      for (let k = 0; k < themeResp.data.responseObject[0].relatedProducts[i].productSpecCharacteristic.length; k++) {
                        console.log("Lengthhhhhh", themeResp.data.responseObject[0].relatedProducts[i].productSpecCharacteristic.length)
                        themeResp.data.responseObject[0].relatedProducts[i].productSpecCharacteristic[k].isMandatory = false;
                      }
                    }


                  }
                }
              }
            }
          }

          //console.log("Final Response", themeResp.data);


          // console.log("ThemeResp data for offers", themeResp.data);
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getPricingBasedOnAttribute", (req, res) => {
  if (mock.isMock) {
    res.json(mock.pricingBasedOnAttribute);
  } else {
    //printlog('EXPRESS REQUEST TO getPricingBasedOnAttribute: ', req._parsedUrl.pathname, req.body);
    const param = req.body;

    //printlog('EXPRESS REQUEST TO getPricingBasedOnAttribute PARAM: ',param);
    //printlog('EXPRESS REQUEST TO getPricingBasedOnAttribute PARAM: ',req.headers);
    //printlog('EXPRESS REQUEST TO getPricingBasedOnAttribute PARAM: ',param.requestObject);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/configureBundle",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/reconfigureCartItem", (req, res) => {
  if (mock.isMock) {
    res.json(mock.addToCart);
  } else {
    const param = req.body;
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/reconfigureCartItem",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.patch("/reconfigureCart", (req, res) => {
  if (mock.isMock) {
    res.json(mock.updateQuantity);
  } else {
    const param = req.body;
    axios
      .all([
        axiosInstance.patch(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/reconfigureCart",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.patch("/associateCustomer", (req, res) => {
  if (mock.isMock) {
    res.json(mock.associateCustomer);
  } else {
    const param = req.body;
    axios
      .all([
        axiosInstance.patch(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/associateCustomer",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.patch("/removeItemFromCart", (req, res) => {
  if (mock.isMock) {
    res.json(mock.removeItemFromCart);
  } else {
    const param = req.body;
    axios
      .all([
        axiosInstance.patch(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/removeItemFromCart",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/updateItemQuantity", (req, res) => {
  if (mock.isMock) {
    res.json(mock.updateQuantity);
  } else {
    const param = req.body;
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/updateItemQuantity",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/addToCart", (req, res) => {
  if (mock.isMock) {
    //printlog('EXPRESS REQUEST TO addToCart from mock: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO addToCart PARAM from mock: ',param);
    res.json(mock.addToCart);
  } else {
    //printlog('EXPRESS REQUEST TO addToCart: ', req._parsedUrl.pathname, req.body);
    const param = req.body;

    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',param);
    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',req.headers);
    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',param.requestObject);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/addItemToCart",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/addItemsToCart", (req, res) => {
  if (mock.isMock) {
    //printlog('EXPRESS REQUEST TO addToCart from mock: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO addToCart PARAM from mock: ',param);
    res.json(mock.addToCart);
  } else {
    //printlog('EXPRESS REQUEST TO addToCart: ', req._parsedUrl.pathname, req.body);
    const param = req.body;

    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',param);
    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',req.headers);
    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',param.requestObject);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/addItemsToCart",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/addProductToCart", (req, res) => {
  if (mock.isMock) {
    //printlog('EXPRESS REQUEST TO addToCart from mock: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO addToCart PARAM from mock: ',param);
    res.json(mock.addProductToCart);
  } else {
    //printlog('EXPRESS REQUEST TO addToCart: ', req._parsedUrl.pathname, req.body);
    const param = req.body;

    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',param);
    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',req.headers);
    //printlog('EXPRESS REQUEST TO addToCart PARAM: ',param.requestObject);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/addProductToCart",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/addAddonToCart", (req, res) => {
  if (mock.isMock) {
    const param = req.body;
    res.json(mock.addAddonToCart);
  } else {
    const param = req.body;
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/addPreConfiguredProductToCart",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getProductResponse", (req, res) => {
  if (mock.isMock) {
    const param = req.body.productId;
    res.json(mock.getProductResponse);
  } else {
    // res.json(mock.getProductResponse)
    const param = req.body.productId;
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/getProduct/?productID=" +
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/changePrimaryOffering", (req, res) => {
  if (mock.isMock) {
    const param = req.body;
    res.json(mock.changePrimaryOffering);
  } else {
    const param = req.body;
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/changePrimaryOffering",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getContracts", (req, res) => {
  if (mock.isMock) {
    const param = req.body;
    res.json(mock.getContracts);
  } else {
    const param = req.body;
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/getContractsForProducts",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getContractOptions", (req, res) => {
  if (mock.isMock) {
    const param = req.body;
    res.json(mock.getContractOptions);
  } else {
    //res.json(mock.getContractOptions);
    const param = req.body;
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/getContractMigrationOptions",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/confirmcart", (req, res) => {
  if (mock.isMock) {
    //printlog('EXPRESS REQUEST TO confirmcart: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',param);
    res.json(mock.confirmcart);
  } else {
    //printlog('EXPRESS REQUEST TO confirmcart: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',param);
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',req.headers);
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',param.requestObject);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/confirmCart",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});


router.post("/checkProductQualification", (req, res) => {
  if (mock.isMock) {
    const param = req.body;
    res.json(mock.checkProductQualification);
  } else {
    //res.json(mock.checkProductQualification);``
    //printlog('EXPRESS REQUEST TO checkProductQualification: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    //printlog('EXPRESS REQUEST TO checkProductQualification PARAM: ',param);
    //printlog('EXPRESS REQUEST TO checkProductQualification PARAM: ',req.headers);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/checkProductQualification",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getMarketList", (req, res) => {
  if (mock.isMock) {
    console.log("enter in serverDev getMarketList");
    res.json(mock.getMarketList);
  } else {
    res.json(mock.getMarketList);
  }
});

router.post("/addressChange", (req, res) => {
  if (mock.isMock) {
    console.log("enter in serverDev addressChange");
    let tempData = {
      address: req.body.newAddress,
    };
    var map = {};
    map["responseStatusList"] = mock.checkAddress.responseStatusList;
    map["responseObject"] = tempData;
    res.json(map);
  } else {
    let tempData = {
      address: req.body.newAddress,
    };
    var map = {};
    map["responseStatusList"] = mock.checkAddress.responseStatusList;
    map["responseObject"] = tempData;
    res.json(map);
  }
});

router.post("/checkAddress", (req, res) => {
  if (mock.isMock) {
    console.log("enter in serverDev checkAddress", req.body);
    var map = {};
    let resfrmock = mock.checkAddress.responseObject.address;
    let temp = {
      checkFlag: true,
    };
    let keyArr = Object.keys(req.body.checkAddress);
    var checkAddressFormData = {};
    for (let key of keyArr) {
      if (key != "serviceAvailabilty") {
        checkAddressFormData[key] = req.body.checkAddress[key];
      }
    }
    let tempData = {
      address: checkAddressFormData,
      checkFlag: false,
    };
    const objKeys = Object.keys(resfrmock[0]);
    const objKey = Object.keys(req.body.checkAddress);
    let i = 0;
    let a = 0;
    Object.entries(objKeys).forEach((entry) => {
      Object.entries(objKey).forEach((ent) => {
        if (entry[1] == ent[1]) {
          i = i + 1;
          let val = resfrmock[0];
          let res = req.body.checkAddress;
          if (val[entry[1]] == res[entry[1]]) {
            a = a + 1;
          }
        }
      });
    });
    if (i == a) {
      map["responseStatusList"] = mock.checkAddress.responseStatusList;
      map["responseObject"] = temp;
    } else {
      map["responseStatusList"] = mock.checkAddress.responseStatusList;
      map["responseObject"] = tempData;
    }
    res.json(map);
  } else {
    const param = req.body;
    console.log("param checkAddress:::", param);
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/hobsrestgateway/crmservices/subscriber/getInstallationAddress?subscriberID=" +
          param.subscriberId,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          res.json(formService.checkAddress(themeResp, req, mock.checkAddress.responseStatusList));
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getReferenceData", (req, res) => {
  if (mock.isMock) {
    console.log("enter in serverDev getReferenceData");
    res.json(mock.getReferenceData);
  } else {
    let baseUrl =
      "/tibchassisrestservice/rest/referencedataservice/referencedataauth/";
    let domain = req.body.domain;
    let context = req.body.context;
    let entity = req.body.entity;
    let referanceName = req.body.referanceName;

    const param = req.body;
    console.log("domain part", req.body.domain);
    console.log("context part", context);
    console.log("entity part", entity);
    console.log("referanceName part", referanceName);

    baseUrl =
      baseUrl +
      domain +
      "/" +
      context +
      "/" +
      entity +
      "/" +
      referanceName +
      "?opId=" +
      req.session.options.headers.opID +
      "&buId=" +
      req.session.options.headers.buID +
      "&language=" +
      req.session.options.headers.lang +
      "&userId=" +
      req.session.options.headers.userID;
    console.log("baseUrl", baseUrl);

    axios
      .all([axiosInstance.get(app.get("apiPrefix") + baseUrl, req.session.options)])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});
router.post("/getPartyDetails", (req, res) => {
  if (mock.isMock) {
    res.json(mock.customerPartyDetails);
  } else {
    const param = req.body;
    console.log("param serverdev getAccountContactDetails:::", param);
    // res.json(mock.customerPartyDetails);
    //Wolverine Changes
    delete req.body.from;
    const customerid = req.body.searchFilters.customerId;
    delete req.body.searchFilters.customerId;
    delete req.body.searchFilters.customerName;
    delete req.body.searchFilters.size;
    req.body.searchFilters.customerid = customerid;
    //changes end here
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/crmservices/customer/findCustomer",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          // console.log("themeResp::::", themeResp);
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getAccountContactDetails", (req, res) => {
  if (mock.isMock) {
    res.json(mock.customerPartyDetails);
  } else {
    const param = req.body;
    console.log("param serverdev getAccountContactDetails:::", param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/partymanagementservices/partymanagement/search",
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

router.post("/getAccountLookUpDetails", (req, res) => {
  if (mock.isMock) {
    res.json(mock.accountLookUpDetails);
  } else {
    const param = req.body;
    console.log("param serverdev getAccountLookUpDetails:::", param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") + "/hobsrestgateway/crmservices/account/details",
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

router.post("/getParentAccountDetail", (req, res) => {
  console.log("Api :: ", req.body);
  if (mock.isMock) {
    res.json(mock.getParentAccountDetail);
  } else {
    // res.json(mock.getParentAccountDetail)
    const param = req.body;
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',param);
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',req.headers);
    //printlog('EXPRESS REQUEST TO confirmcart PARAM: ',param.requestObject);
    console.log("Api ---:: ", param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/crmservices/customer/details",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((accountResp) => {
          console.log("accountResp :: ", accountResp.data);
          res.json(accountResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});
router.post("/getCountryRefData", (req, res) => {
  if (mock.isMock) {
    console.log("enter in apiorder getCountryRefData");
    res.json(mock.getCountryRefData);
  } else {
    let baseUrl =
      "/tibchassisrestservice/rest/referencedataservice/referencedataauth/";
    let domain = req.body.domain;
    let context = req.body.context;
    let entity = req.body.entity;
    let referanceName = req.body.referanceName;

    const param = req.body;
    console.log("domain part", req.body.domain);
    console.log("context part", context);
    console.log("entity part", entity);
    console.log("referanceName part", referanceName);

    baseUrl =
      baseUrl +
      domain +
      "/" +
      context +
      "/" +
      entity +
      "/" +
      referanceName +
      "?opId=" +
      req.session.options.headers.opID +
      "&buId=" +
      req.session.options.headers.buID +
      "&language=" +
      req.session.options.headers.lang +
      "&userId=" +
      req.session.options.headers.userID;
    console.log("baseUrl", baseUrl);

    axios
      .all([axiosInstance.get(app.get("apiPrefix") + baseUrl, req.session.options)])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/createContact", (req, res) => {
  console.log("Contact API :: ");
  if (mock.isMock) {
    res.json(mock.contactForIndividual);
  } else {
    const param = req.body;
    console.log("param serverdev Contact:::", param);
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/create",
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

router.post("/getretainOfferAddress", (req, res) => {
  if (mock.isMock) {
    console.log("enter in serverDev getretainOfferAddress");
    res.json(mock.retainOfferAddress);
  } else {
    const param = req.body;
    console.log("param serverdev Contact:::", param);
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/hobsrestgateway/crmservices/subscriber/getInstallationAddress?subscriberID=" +
          param.subscriberId,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          console.log("themeResp::::", themeResp);
          //printlog(themeResp.data);
          if (null != themeResp.data.responseObject && null != themeResp.data.responseObject.addressID) {
            delete themeResp.data.responseObject["addressID"];
          }
          if (null != themeResp.data.responseObject && null != themeResp.data.responseObject.customAddress) {
            delete themeResp.data.responseObject["customAddress"];
          }
          if (null != themeResp.data.responseObject && null != themeResp.data.responseObject.addressType) {
            delete themeResp.data.responseObject["addressType"];
          }
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.get("/testServer", (req, res) => {
  winston.info("**********************************************");
  winston.info("Node service is up and running. Test SUCCESS!!");
  winston.info("**********************************************");
  printlog("API Service is up!");
});

router.post("/testGetDNList", (req, res) => {
  if (req.body.reqValue == "044") {
    res.json(mock.getDropDownDN044);
  } else {
    res.json(mock.getDropDownDN042);
  }
});

router.post("/validateDN", (req, res) => {
  res.json(mock.validateDNReserved);

  //  res.json(mock.validateDNReserveFailure);
});

router.get("/getTreeData", (req, res) => {
  if (mock.isMock) {
    res.json(mock.getCLV);
  }
});

router.post("/bundle/items", (req, res) => {
  //printlog('EXPRESS REQUEST TO bundle/items: ', req._parsedUrl.pathname, req.body);
  const param = req.body;
  //printlog('EXPRESS REQUEST TO bundle/items PARAM: ',param);
  if (mock.isMock) {
    res.json(mock.bundleditems);
  }
});

router.post("/task/details", (req, res) => {
  //printlog('EXPRESS REQUEST TO task/details: ', req._parsedUrl.pathname, req.body);
  const param = req.body;
  //printlog('EXPRESS REQUEST TO task/details PARAM: ',param);
  if (mock.isMock) {
    res.json(mock.taskDetails);
  }
});

router.post("/products/search", (req, res) => {
  const param = req.body;
  if (mock.isMock) {
    res.json(mock.searchProducts);
  }
});

router.post("/postPayerDetail", (req, res) => {
  console.log("Api ::postPayerDetail ");
  if (mock.isMock) {
    res.json(mock.postPayerDetail);
  } else {
    //wolverine changes start here
    req.body.customerAccount.customerId = req.body.customer.customerID;
    req.body.customerAccount.customerBillCycle = {
      "billingFrequency": "MONTHLY",
      //BIll cycle is auto calculated.
      "customerBillCycleId": "03"
    };
    const date = req.body.contactFormData[0].dateOfBirth;

    const event2 = new Date(date);

    const date1 = event2.toLocaleDateString();

    const [day, month, year] = date1.split('/');

    const result = [year, month, day].join('-');
    var finalDOB = result + "+08:00";

    req.body.contactFormData[0].dateOfBirth = finalDOB;
    req.body.customerAccount.customerAccountContact[0].contact.party.dateOfBirth = finalDOB;
    req.body.customerAccount.customerAccountContact[0].contact.party.gender = req.body.contactFormData[0].gender;

    req.body.customerAccount.name = req.body.contactFormData[0].firstName + " " + req.body.contactFormData[0].lastName;
    req.body.customerAccount.creditLimit = "7000000";
    req.body.customerAccount.budgetCenter = "10";

    req.body.customerAccount.customerBillFormat.customerBillFormatId = req.body.accountBillingPrefDetailsFormData.invoicePreference
    req.body.customerAccount.customerBillFormat.customerBillPresentationMedia =
      [{
        "name": req.body.accountBillingPrefDetailsFormData.billMedia,
        "presentationFormat": "NORMAL_FONT"
      }];

    req.body.customerAccount.preferedPaymentMethod = {
      "type": req.body.accountBillingPrefDetailsFormData.preferedPaymentMethod
    };
    req.body.customerAccount.customerAccountContact[0].contact.party.legalID = req.body.contactFormData[0].idNumber;
    req.body.customerAccount.customerAccountContact[0].contact.party.identification = [
      {
        "id": req.body.contactFormData[0].idNumber,
        "idType": req.body.contactFormData[0].CustomerlegalID
      }]
    req.body.customerAccount.customCustomerAccount = {
      "attributes": [
        {
          "attributeName": "billType",
          "attributeId": "account.extension.accountInfo.billType",
          "attributeValue": req.body.accountBillingPrefDetailsFormData.billType
        },
        {
          "attributeName": "billMedia",
          "attributeId": "account.extension.accountInfo.billMedia",
          "attributeValue": req.body.accountBillingPrefDetailsFormData.billMedia
        },
        {
          "attributeName": "billingemailAddress",
          "attributeId": "account.extension.accountInfo.billingemailAddress",
          "attributeValue": req.body.accountBillingPrefDetailsFormData.billingemailAddress
        },
        {
          "attributeName": "creditTreatmentCode",
          "attributeId": "account.extension.accountInfo.creditTreatmentCode",
          "attributeValue": 6
        }
      ]
    }

    req.body.customerAccount.customerAccountContact[0].contact.party.customIndividualParty = {
      "individualAttributes": {
        "attribute": [
          {
            "attributeName": "firstName",
            "attributeId": "contact.extension.addlinfo.firstName",
            "attributeValue": req.body.contactFormData[0].firstName
          },
          {
            "attributeName": "lastName",
            "attributeId": "contact.extension.addlinfo.lastName",
            "attributeValue": req.body.contactFormData[0].lastName
          },
          {
            "attributeName": "gender",
            "attributeId": "contact.extension.addlinfo.gender",
            "attributeValue": req.body.contactFormData[0].gender


          },
          {
            "attributeName": "race",
            "attributeId": "contact.extension.addlinfo.race",
            "attributeValue": req.body.contactFormData[0].race
          },
          {
            "attributeName": "nationality",
            "attributeId": "contact.extension.addlinfo.nationality",
            "attributeValue": req.body.contactFormData[0].nationality
          },
          {
            "attributeName": "homeNumber",
            "attributeId": "contact.extension.addlinfo.homeNumber",
            "attributeValue": req.body.contactFormData[0].homeNumber
          },
          {
            "attributeName": "officeNumber",
            "attributeId": "contact.extension.addlinfo.officeNumber",
            "attributeValue": req.body.contactFormData[0].officeNumber
          },
          {
            "attributeName": "alternateContactNumber",
            "attributeId": "contact.extension.addlinfo.alternateContactNumber",
            "attributeValue": req.body.contactFormData[0].alternateContactNumber
          },
          {
            "attributeName": "mothermaidenname",
            "attributeId": "contact.extension.addlinfo.mothermaidenname",
            "attributeValue": req.body.contactFormData[0].mothermaidenname
          }
        ]
      }
    }

    req.body.customerAccount.customerAccountContact[0].contact.contactMedium[0].address[0].addressLine4 = req.body.contactFormData[1].addressLine4;

    req.body.customerAccount.customerAccountContact[0].contact.contactMedium[0].address[0].addressLine5 = req.body.contactFormData[1].addressLine5;

    req.body.customerAccount.customerAccountContact[0].contact.contactMedium[0].address[0].addressLine6 = req.body.contactFormData[1].addressLine6;


    //changes end here
    const param = req.body;
    console.log("Create Account", param)
    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") + "/hobsrestgateway/crmservices/account",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          console.log("themeResp::::", themeResp);
          //printlog(themeResp.data);
          // themeResp.data.customerAccount.customerAccountContact[0].contact.party.dateOfBirth =  req.body.customerAccount.customerAccountContact[0].contact.party.dateOfBirth;
          // console.log("date of birth check", themeResp.data.customerAccount.customerAccountContact[0].contact.party.dateOfBirth);
          // themeResp.data.customerAccount.customerAccountContact[0].contact.party.dateOfBirth = "1993-06-15+08:00"
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/search/products/scope", (req, res) => {
  const param = req.body;
  winston.info(
    "Get Scope Items::/search/products/scope::",
    mock.searchProductsScope
  );
  if (mock.isMock) {
    res.json(mock.searchProductsScope);
  }
});

router.post("/formdata", (req, res) => {
  const param = req.body;
  if (mock.isMock) {
    res.json(mock.formdata);
  }
});

router.post("/uploadDocument", (req, res) => {
  console.log("Upload Document API ---- :: ");
  delete req.body["getDocumentResponse"];
  if (mock.isMock) {
    res.json(mock.uploadDocument);
  } else {
    const param = req.body;
    delete param["uploadDocFormData"];

    // console.log("param serverdev::: upload document", param);

    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/customerdocuments/tibcustomerdocuments/add",
          param,
          {
            headers: {
              "Content-Type": "application/json",
              opID: req.session.options.headers.opID,
              buID: req.session.options.headers.buID,
              userID: req.session.options.headers.userID,
              Authorization: req.session.options.headers.Authorization,
              language: req.session.options.headers.lang,
              channel: "CSA",
            },
          }
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          // console.log("themeResp::::", themeResp);
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getDocumentList", (req, res) => {
  console.log("get Document List API :: ");
  if (mock.isMock) {
    res.json(mock.getDocumentList);
  } else {
    const param = req.body;
    console.log("param serverdev::: get document", param);
    delete param["cartInstanceIdentifier"];
    delete param["customerCategory"];
    delete param["customerSegment"];
    delete param["customerType"];

    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/getcustomerdocuments//tibcustomerdocuments/fetch/current",
          param,
          {
            headers: {
              "Content-Type": "application/json",
              opID: req.session.options.headers.opID,
              buID: req.session.options.headers.buID,
              userID: req.session.options.headers.userID,
              Authorization: req.session.options.headers.Authorization,
              language: req.session.options.headers.lang,
              channel: "CSA",
            },
          }
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          // console.log("themeResp::::", themeResp);
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/deleteDocument", (req, res) => {
  console.log("deleteDocument API :: ");
  if (mock.isMock) {
    res.json(mock.deleteDocument);
  } else {
    const param = req.body;
    console.log("param serverdev::: get document", param);

    axiosInstance
      .delete(
        app.get("apiPrefix") +
        "/hobsrestgateway/customerdocuments/tibcustomerdocuments/delete",
        {
          headers: {
            "Content-Type": "application/json",
            opID: req.session.options.headers.opID,
            buID: req.session.options.headers.buID,
            userID: req.session.options.headers.userID,
            Authorization: req.session.options.headers.Authorization,
            language: req.session.options.headers.lang,
            channel: "CSA",
          },
          data: param,
        }
      )
      .then((resp) => {
        console.log("themeResp::::", resp.data);
        //printlog(themeResp.data);
        res.json(resp.data);
      });
  }
});

router.post("/addNotes", (req, res) => {
  console.log("get addNotes API :: ");
  if (mock.isMock) {
    res.json(mock.addNotes);
  } else {
    const param = req.body;
    console.log("param serverdev::: get document", param);

    axios
      .all([
        axiosInstance.post(
          app.get("apiPrefix") +
          "/hobsrestgateway/getcustomerdocuments/tibcustomerdocuments/fetch/current",
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

router.post("/getNotesDetails", (req, res) => {
  console.log("get getNotesDetails API :: ");
  if (mock.isMock) {
    res.json(mock.getNotesDetails);
  } else {
    res.json(mock.getNotesDetails);
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

router.post("/csaFeasibilityCheckAddress", (req, res) => {
  console.log("get csaFeasibilityCheckAddress API :: ", req.body);
  if (mock.isMock) {
    res.json(req.body);
  } else {
    res.json(req.body);
  }
});

router.patch("/associateAccount", (req, res) => {
  if (mock.isMock) {
    res.json(mock.associateAccount);
  } else {
    const param = req.body;
    axios
      .all([
        axiosInstance.patch(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/associateAccount",
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/associateAddress", (req, res) => {
  if (mock.isMock) {
    res.json(mock.associateAddress);
  } else {
    //res.json(mock.associateAddress);
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/addRelatedEntities', param
        , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });
  }
});

router.post("/getProcessFlowForService", (req, res) => {
  if (mock.isMock) {
    res.json(mock.getProcessFlowForService);
  } else {
    // res.json(mock.getProcessFlowForService);
    printlog(
      "EXPRESS REQUEST TO getProcessFlowForService: ",
      req._parsedUrl.pathname,
      req.body
    );
    const param = req.body.serviceType;
    printlog("EXPRESS REQUEST TO getProcessFlowForService PARAM: ", param);
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/hobsrestgateway/cartservices/cart/getProcessFlowForService?serviceList=" +
          param,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //  printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getPrepaidBalance", (req, res) => {
  console.log('EXPRESS REQUEST TO getPrepaidBalance req.body: ', req.body);
  console.log('EXPRESS REQUEST TO getPrepaidBalance res: ', res);
  /* Sample req.body - begins here */
  /*--------
  req.body:  {
    customerID: 'C39618353',
    accountID: 'A36246561',
    subscriptionID: 'S36758350',
    userTokenString: 'fo_user'
  }  
  ----------*/
  /* Sample req.body - ends here */
  if (!mock.isMock) {
    console.log('mock.getPrepaidBalance', mock.getPrepaidBalance);
    res.json(mock.getPrepaidBalance);
  } else {
    // TODO for CE : Call the external API to get the PREPAID Balance and convert in the format of the mock.
    res.json(mock.getPrepaidBalance);
  }
});

router.post("/getPreOrderCheck", (req, res) => {
  if (mock.isMock) {
    res.json(mock.getPreOrderCheck);
  } else {
    const param = req.body;
    let baseUrl =
      "/hobsrestgateway/omconsoleservices/preordercheckservice/validateOrder";
    console.log("Base Url :: ", baseUrl);
    axios
      .all([axiosInstance.post(app.get("apiPrefix") + baseUrl, param, req.session.options)])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});


router.post("/partyEnabled", (req, res) => {
  console.log("Api partyEnabled:: Order", req.body);
  if (mock.isMock) {
    res.json(mock.partyEnabled);
  } else {

    const param = req.body;
    const urlString = req.body.generalSearch;
    // let baseUrl =  '/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/'+'?activeContact='+param.activeContact+'&fields='+param.fields;
    let baseUrl =
      "/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/v2?activeContact=Y&fields=associatedEntityID=" +
      param.customerID + '%26partyRoleTypeID=PRIMARY,BILLING,INSTALLATION,SECONDARY';
    console.log("Base Url :: ", baseUrl);
    req.session.options.headers.domainID = "CSA";
    axios
      .all([axiosInstance.get(app.get("apiPrefix") + baseUrl, req.session.options)])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/modify-gmap", (req, res) => {
  //   axios.all([
  //     axiosInstance.post("http://192.180.10.125:9099/crmswrapper/gmap", req.body, req.session.options)
  //   ]).then(axios.spread((themeResp) => {
  //     const resObject = themeResp["data"];
  //     res.json(resObject);
  // })).catch(error => {
  //     console.log("error",error)
  //     handleServiceErros(error, res);
  //   });
});

router.post("/updatePartyEnabled", (req, res) => {
  console.log("updatePartyEnabled API :: ");
  if (mock.isMock) {
    // res.json(mock.updateParty)
    console.log("HI MAN IN THE APIDASHBOARD.JS");
  } else {
    const param = req.body;
    console.log("param serverdev::: delete PartyEnabled", param);
    // app.get('apiPrefix') + '/hobsrestgateway/customerdocuments/tibcustomerdocuments/delete/'
    // https://172.16.177.67/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/update/
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

router.post("/deletePartyEnabled", (req, res) => {
  console.log("deletePartyEnabled API :: ");
  if (mock.isMock) {
    // res.json(mock.deleteParty)
    console.log("HI MAN IN THE APIDASHBOARD.JS");
  } else {
    const param = req.body;
    console.log("param serverdev::: delete PartyEnabled", param);

    axiosInstance
      .delete(
        app.get("apiPrefix") +
        "/hobsrestgateway/partymanagementservices/partyrolemanagement/partyRole/" +
        param.id,
        req.session.options
      )
      .then((resp) => {
        console.log("themeResp::::", resp.data);
        //printlog(themeResp.data);
        res.json(resp.data);
      });
  }
});

router.get("/getOrderId", (req, res) => {
  if (mock.isMock) {
    //Added hardcored oredrId instead of putting it in Mock.
    // Reason : This is api is only returning OrderId without Key.
    res.json("O12345678");
  } else {
    console.log("Inside Order Id generation.");
    const param = req.body;

    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/tibchassisrestservice/rest/uimetadataservice/sequence/next/Order/ORDER_ID?opId=" +
          req.session.options.headers.opID +
          "&buId=" +
          req.session.options.headers.buID +
          "&userId=" +
          req.session.options.headers.userID,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.get("/getCustomerId", (req, res) => {
  if (mock.isMock) {
    //Added hardcored oredrId instead of putting it in Mock.
    // Reason : This is api is only returning OrderId without Key.
    res.json("C39474337");
  } else {
    console.log("Inside Customer Id generation.");
    const param = req.body;

    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/tibchassisrestservice/rest/uimetadataservice/sequence/next/Customer/CUSTOMER_ID?opId=" +
          req.session.options.headers.opID +
          "&buId=" +
          req.session.options.headers.buID +
          "&userId=" +
          req.session.options.headers.userID,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getChassisForm", (req, res) => {
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
      res.json(mock.getChassisForm);
    }
  } else {
    console.log("Inside getChassisForm");
    const param = req.body;

    const context = req.body.context;
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/tibchassisrestservice/rest/uimetadataservice/formelement/" +
          context +
          "?opId=" +
          req.session.options.headers.opID +
          "&buId=" +
          req.session.options.headers.buID +
          "&userId=" +
          req.session.options.headers.userID +
          "&language=" +
          req.session.options.headers.lang,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getChassisFormValidation", (req, res) => {
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
    console.log("Inside getChassisForm");
    const param = req.body;

    const context = req.body.context;
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/tibchassisrestservice/rest/uimetadataservice/contextattr/context/" +
          context +
          "?opId=" +
          req.session.options.headers.opID +
          "&buId=" +
          req.session.options.headers.buID +
          "&userId=" +
          req.session.options.headers.userID +
          "&language=" +
          req.session.options.headers.lang,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/getRefParamData", (req, res) => {
  if (mock.isMock) {
    res.json(mock.pcfilterAttributes);
  } else {
    printlog("Inside getRefParamData", req);
    const param = req.body;

    const context = req.body.context;
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/tibchassisrestservice/rest/uimetadataservice/controlparam/context/" +
          context +
          "?opId=" +
          req.session.options.headers.opID +
          "&buId=" +
          req.session.options.headers.buID +
          "&language=" +
          req.session.options.headers.lang,
          req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

router.post("/leadCustomerCreation", (req, res) => {
  if (mock.isMock) {
    res.json(mock.leadCustomerCreation);
  } else {
    delete req.body.payload["formData"];
    console.log("Lead Creation Request :: ", req.body.payload);
    res.json(mock.leadCustomerCreation);
  }
});

//Wolverine Changes
router.post("/searchByCriteria", (req, res) => {
  if (mock.isMock) {
    res.json(mock.corporateSearch);
  } else {
    const paramTemp = req.body.queryFacet[0].data;
    console.log("ttt paramTemp :", paramTemp);
    
    let options = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    if(paramTemp.partytype && paramTemp.partytype[0] === "ORGANIZATION"){
      const param = {
        "accountnamekeyword": req.body.queryFacet[0].name === "ownerNameFacet" ? paramTemp.ownerName[0]: "",
        "brnId": req.body.queryFacet[0].name === "customerIDFacet" ? paramTemp['partyIdentification.id'][0] : ""
      }
      console.log("ttt BRN ORI");
      axios.all([
          axiosInstance.post('https://dte.ms.st.celcom.com.my/siebel-company-brn-details-retrieve-ms/siebel/companyBRNDetailsRetrieve', param, options)
      ]).then(axios.spread((themeResp) => {
          console.log('searchByCriteria Response :', themeResp.data);
          // printlog(themeResp);
          res.json(formService.getSearchByResult(themeResp,param));
          // res.json(themeResp.data);
      })).catch(error => {
        handleServiceErros(error, res);
          // console.log('searchByCriteria Error :', error);
      });
    } else {
      console.log("ttt BRN FAKE req body :", req.body);
      axios.all([
        axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/crmservices/subscriber/searchByCriteria?from=0&size=300&perfectMatch=N', req.body, req.session.options)
      ]).then(axios.spread((themeResp) => {
          //printlog(themeResp);
          console.log("ttt themeResp :", themeResp);
          const toJson = formService.getSearchByResultCriteria(themeResp,req.body);
          console.log("ttt toJson :", toJson);
          res.json(toJson);
          // res.json(formService.getSearchByResultCriteria(themeResp,req.body));
      })).catch(error => {
          handleServiceErros(error, res);
      });
    }

  }
});
// Changes ends here

router.post("/selectedCorporateId", (req, res) => {
  if (mock.isMock) {
    res.json(mock.corporateSearch);
  } else {
    var address = {};

    console.log(
      "Request for corporateSearch Data :: ",
      req.body
    );
    var search = []
    if (undefined != req.body.selectedCorporateId.businessRegistrationNumber &&
      null != req.body.selectedCorporateId.businessRegistrationNumber
    ) {
      address["businessRegistrationNumber"] =
        req.body.selectedCorporateId.businessRegistrationNumber;
    } if (undefined != req.body.selectedCorporateId.company &&
      null != req.body.selectedCorporateId.company
    ) {
      address["company"] =
        req.body.selectedCorporateId.company;
    } if (
      undefined != req.body.searchFormArrayValue.CustomerlegalID &&
      null != req.body.searchFormArrayValue.CustomerlegalID
    ) {
      address["CustomerlegalID"] = req.body.searchFormArrayValue.CustomerlegalID;
    } if (
      undefined != req.body.searchFormArrayValue.idNumber &&
      null != req.body.searchFormArrayValue.idNumber
    ) {
      address["idNumber"] = req.body.searchFormArrayValue.idNumber;
    } if (
      undefined != req.body.searchFormArrayValue.dateOfBirth &&
      null != req.body.searchFormArrayValue.dateOfBirth
    ) {
      address["dateOfBirth"] = req.body.searchFormArrayValue.dateOfBirth;
    } if (
      undefined != req.body.searchFormArrayValue.customerCategory &&
      null != req.body.searchFormArrayValue.customerCategory
    ) {
      address["customerCategory"] = req.body.searchFormArrayValue.customerCategory;
    }

    console.log("JSON Object for corporateSearch :: ", address);
    let searchFormUpdatedArray = req.body.searchFormArray;
    let keyArr = Object.keys(address);
    let keyArr2 = Object.keys(search);
    for (let i = 0; i < searchFormUpdatedArray.length; i++) {
      if (searchFormUpdatedArray[i].key == "panelDetails") {
        for (let j = 0; j < searchFormUpdatedArray[i].formData.length; j++) {
          for (let key of keyArr2) {
            if (key == searchFormUpdatedArray[i].formData[j].key) {
              searchFormUpdatedArray[i].formData[j].value = search[key];
            }
          }
        }
      }
      for (let key of keyArr) {
        // console.log("Inside addressUpdatedArray key -- ", key, searchFormUpdatedArray[i].key);
        if (key == searchFormUpdatedArray[i].key) {
          if (searchFormUpdatedArray[i].type != "button") {
            searchFormUpdatedArray[i].value = address[key];
          }
        }
      }
    }
    console.log(
      "addressUpdatedArrayaddressUpdatedArray ----  ",
      searchFormUpdatedArray
    );
    res.json(searchFormUpdatedArray);
  }
});
// Changes ends here

//Wolverine Changes
router.post("/validateDOB", (req, res) => {
  console.log("DOB::", req.body.reqValue);
  let dob = req.body.reqValue;
  req.body.reqValue = dob.substr(0, 10);
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
      if (age >= 18) {
        isValid = true;
        res.json({ data: mock.dateValidationSuccess });
      } else {
        res.json({ data: mock.dateValidationError });
      }
    }
  }
});
router.post("/dependentchildLookup", (req, res) => {
  console.log("DOB1::", req.body.reqValue);
  let actualDOB= req.body.reqValue;
  let dob =  req.body.reqValue;
  req.body.reqValue= (dob.substr(2, 2)+"-"+dob.substr(0, 2)+"-"+dob.substr(4, 4));
  var splcheck = /[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\?]/;
  var alphacheck = /^[A-Za-z]+$/;
  if ((req.body.reqValue != null) || (req.body.reqValue != undefined) || (req.body.reqValue == ' ') || (req.body.reqValue == '')) {
    if (alphacheck.test(req.body.reqValue) || splcheck.test(req.body.reqValue)) {
      console.log("alpha error!!")
      req.body.reqValue= (actualDOB.substr(2, 2)+"-"+actualDOB.substr(0, 2)+"-"+actualDOB.substr(4, 4));
      res.json({ data:req.body.reqValue,
                  msg: mock.dateValidationalphaError });
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
      if (age >= 18) {
        isValid = true;
        req.body.reqValue= (actualDOB.substr(2, 2)+"-"+actualDOB.substr(0, 2)+"-"+actualDOB.substr(4, 4));
        res.json({data:req.body.reqValue,
                  msg:mock.dateValidationSuccess });
      } else {
        req.body.reqValue= (actualDOB.substr(2, 2)+"-"+actualDOB.substr(0, 2)+"-"+actualDOB.substr(4, 4));
        res.json({ data: req.body.reqValue,
                    msg:  mock.dateValidationError});
      }
    }
  }
  // res.json({data:  req.body.reqValue});

});
router.post("/customInfo", (req, res) => {
  console.log("DOB1::", req.body.reqValue);
  // res.json({data:  req.body.reqValue});
  if (req.body.reqValue == "paper") {
    res.json({ data: mock.billTypeMessage });
  }
  else {
    res.json({ data: mock.defaultbillTypeMessage });
  }

});


router.post("/log/info", (req, res) => {
  winston.info(req.body.logMessage);
  res.json(mock.logMessage);
});

router.post("/log/debug", (req, res) => {
  winston.info("Debug logs");
  printlog("/log/debug called");
  winston.debug(req.body.logMessage);
  res.json(mock.logMessage);
});

router.post("/log/warn", (req, res) => {
  winston.warn(req.body.logMessage);
  res.send(mock.logMessage);
});

router.post("/log/error", (req, res) => {
  winston.error(req.body.logMessage);
  res.send(mock.logMessage);
});

router.post("/log/fatal", (req, res) => {
  winston.error(req.body.logMessage);
  res.send(mock.logMessage);
});

router.post("/order/loadConfiguredRoles", (req, res) => {
  if (mock.isMock) {
    res.json(mock.dataSetRoleMapDetails);
  } else {
    //res.json(mock.dataSetRoleMapDetails)
    console.log("Inside loadConfiguredRoles", req.body.roleList);
    const roles = req.body.roleList;
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") +
          "/tibchassisrestservice/rest/uimetadataservice/datasets/role/all?roles=" +
          roles +
          "&opId=" +
          req.session.options.headers.opID +
          "&buId=" +
          req.session.options.headers.buID +
          "&language=" +
          req.session.options.headers.lang
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //console.log("themeResp ",themeResp.data)
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});
router.get("/navigation", (req, res) => {
  res.json(appConfig.navigation);
});

router.get("/language", (req, res) => {
  console.log("language ----->", appConfig.language);
  res.json(appConfig.language);
});

router.get("/layoutConfig", (req, res) => {
  console.log("layoutConfig ----->", appConfig.layoutConfig);
  res.json(appConfig.layoutConfig);
});
router.get("/getLayoutList", (req, res) => {
  console.log("getLayoutList ----->", appConfig.layouts);
  res.json(appConfig.layouts);
});

router.get("/getHeaderFooter", (req, res) => {
  console.log("getHeaderFooter ----->", appConfig.headerFooterFixed);
  res.json(appConfig.headerFooterFixed);
});

router.post("/getLogApiPrefix", (req, res) => {
  if (envConst.ENV == "prod") {
    res.json(
      "https://" + envConst.LOG_PREFIX +
      "," +
      app.get("envDevelopmentMode") +
      "," +
      app.get("envLogLevel")
    );
  } else {
    res.json(
      app.get("envLogServicePrefix") +
      "," +
      app.get("envDevelopmentMode") +
      "," +
      app.get("envLogLevel")
    );
  }
});
router.post("/getDocumentValidationService", (req, res) => {
  // console.log("Request for validations :: ",req.body)
  res.json(mock.documentValidation);
});

router.post('/promotionsData', (req, res) => {
  console.log("promotionsData::", req.body);
  // const param = req.body;
  if (mock.isMock) {
    res.json(mock.promotionsData);

  }
  else {
    // res.json(mock.promotionsData);
    const param = req.body;
    console.log("promotions data::", param);
    // res.json(mock.promotionsData);
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/cartservices/recommendation/getGlobalPromotions',
        req.session.options)
    ]).then(axios.spread((themeResp) => {
      //console.log("themeResp::::", themeResp);
      //printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErros(error, res);
    });

  }
});
router.post('/eligibleOffers', (req, res) => {
  console.log("eligibleOffers::", req.body);
  // const param = req.body;
  if (mock.isMock) {
    res.json(mock.eligibleOffers);

  }
  else {
    // res.json(mock.promotionsData);
    const param = req.body;
    console.log("eligible offers::", param);
    // res.json(mock.promotionsData);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/cartservices/cart/getProductsForGlobalPromotion', param,
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

router.get("/getExternalUrl/order", (req, res) => {
  console.log("EXPRESS REQUEST TO getExternalUrl: ");
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

module.exports = router;
