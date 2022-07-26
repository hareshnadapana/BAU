var winston = require('./winston');
var express = require('express');
var router = express.Router();
const mock = require('./mockResp.js');
const axios = require('axios');
var app = express();

const envConst = require('./envConst.js');
const https = require('https');

app.set('apiPrefix', 'https://' + envConst.API_PREFIX);
app.set('cpqbusinessservicePrefix', '/hobsrestgateway/cpqbusinessservices');
app.set('dashboardservicePrefix', '/hobsrestgateway/dashboardservice');
app.set('cpqgeneratedocumentservicePrefix', '/hobsrestgateway/cpqgeneratedocumentservice');
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
  config.headers['request-startTime'] = process.hrtime();
  return config;
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
//     'userID': 'cpq_sp_nh1',
//     'groupId': 'CPQ_CHN',
//     'Authorization': 'Basic Y3BxX3NwX25oMTpjcHFfc3Bfbmgx',
//     'lang': 'ENG',
//     'channel': 'CSA',
//     'language': 'ENG'
//   }
// };

function handleServiceErrors(error, res) {
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
}


function getToken(user, req, res) {
  // console.log("getToken--cpq--->", req.session);
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
        //console.log("themeResp-cpq-", themeResp.data);
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
        req.session.options = {};
        req.session.options = options;
        req.session.save();
        console.log("options-setting cpq in session-", req.session.options);
        res.json(user);
      })
    )
    .catch((error) => { console.error("error here --->", error); });
}

router.get("/cpq/user", (req, res) => {
  //printlog('EXPRESS : /user start');
  if (mock.isMock) {
    res.json(mock.user);
  }
  let sessionUser = "";
  console.log("/api/user-cpq-");
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
        })).catch((error) => { console.error("error here --->", error); });
      })
    ).catch((error) => { console.error("error here --->", error); });
});

router.post("/cpq/loadConfiguredRoles", (req, res) => {
  if (mock.isMock) {
    res.json(mock.dataSetRoleMapDetails);
  } else {
    console.log("Inside loadConfiguredRoles", req.body.roleList);
    const roles = req.body.roleList;
    axios
      .all([
        axiosInstance.get(
          app.get("apiPrefix") + "/tibchassisrestservice/rest/uimetadataservice/datasets/role/all?roles=" + roles + "&opId=" + req.session.options.headers.opID + "&buId=" + req.session.options.headers.buID + "&language=" + req.session.options.headers.lang),
      ])
      .then(
        axios.spread((themeResp) => {
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErrors(error, res);
      });
  }
});

router.get("/getSession", (req, res) => {
  res.json(req.session);
});

router.post('/getControlParamCpq', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + '/tibchassisrestservice/rest/uimetadataservice/controlparams/CPQ/' + param.paramKey + '?opId=' + user.cas_user_info.opId + '&buId=' + user.cas_user_info.buId + '&language=' + user.cas_user_info.language)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/callExternalApi', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    var apiUrl = req.body.optionsApi;
    const param = req.body.optionsApiReq;
    var postFlag = false;
    if (apiUrl.startsWith('POST>')) {
      postFlag = true;
      apiUrl = apiUrl.substring(5);
    }
    var completeUrl = "";
    if (apiUrl.includes('https://') || apiUrl.includes('http://')) {
      completeUrl = apiUrl;
    }
    else {
      completeUrl = app.get('apiPrefix') + apiUrl;
    }
    if (!postFlag) {
      axios.all([
        axiosInstance.get(completeUrl + '/' + (param ? param : ''), req.session.options)
      ])
        .then(axios.spread((themeResp) => {
          res.json({ "apiUrl": req.body.optionsApi, "response": themeResp.data });
        })).catch(error => {
          handleServiceErrors(error, res);
        });
    }
    else {
      axios.all([axiosInstance.post(completeUrl, param, req.session.options)])
        .then(axios.spread((themeResp) => {
          res.json({ "apiUrl": req.body.optionsApi, "response": themeResp.data });
        })).catch(error => {
          handleServiceErrors(error, res);
        });
    }
  }
});


router.post('/getServiceListCpq', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    let param;
    param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getServiceListOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getUserInfo', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getUserInfoOpenApi',
        req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/createLead', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    // printlog('EXPRESS REQUEST TO createLead: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    // printlog('EXPRESS REQUEST TO createLead PARAM: ',param);  
    printlog(req.session.options.headers);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/createLeadOpenApi', param, req.session.options)
      // axiosInstance.post('http://localhost:8086/cpqfeatures/createLeadOpenApi', param , req.session.options)
    ]).then(axios.spread((themeResp) => {
      //  printlog(themeResp.data);
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/searchLead', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    printlog('EXPRESS REQUEST TO searchLead: ', req._parsedUrl.pathname, req.body);
    const param = req.body;
    printlog('headers:', req.session.options.headers);
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/searchLeadOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getLead', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getLeadOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/updateLead', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/updateLeadOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/findAddressCpq', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/findAddressOpenApi/' + param.searchPinCode, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/createBulkLead', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/createBulkLead', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/validateBulkLead', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/validateBulkLead', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getCustomerEnterprise', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/Customer/getCustomerEnterpriseOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/initiateOpportunity', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/initiateOpportunityOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/saveOpportunity', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/saveOpportunityOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/searchOpportunity', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/searchOpportunityOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getOpportunity', (req, res) => {
  //res.json({"opportunityId":"12256","leadId":"13432","opportunityName":"ABCAKHIL","opportunitySource":"Campaign","opportunityType":"Standard","currency":"PHP","probability":0.0,"territoryCodeOrRegion":"2900664 - Mitchelle Anne Delumpa","stage":"Qualified","autoAssignFlag":false,"opportunityRisksFlag":false,"opportunityPotentialFlag":false,"solutionOptionsFlag":false,"serviceType":["Biz Fiber Connect","PAYTV Hotel"],"assignedToGroup":"CPQ_CHN","assignedToUser":"HOBADMIN","createdByUser":"HOBADMIN","opportunityCreatedDate":"Nov 8, 2021 7:39:37 PM","createdByGroup":"CPQ_CHN","opportunityLastUpdateDate":"Nov 8, 2021 7:40:11 PM","closedDate":"Nov 10, 2021 12:00:00 AM","contacts":[{"contactRole":"Primary","title":"MR","firstName":"NEW CNT","middleName":"","lastName":"NEW CNT","contactNumber":"+639876543211","emailAddress":"abd@mail.com","preferredModeOfCommunication":"EMAIL","gender":"MALE","addressMasterVoList":[{"addressMasterId":"AD35790186","province":"test","city":"test","barangay":"test","village":"","street":"test","pinCode":1212,"buildingName":"","floor":"","landmark":"","addressQualifier":"RESIDENTIAL"}],"partyId":"200092604","contactId":"99190204","associatedEntityID":"C1379002","associatedEntityType":"CUSTOMER","accountRefType":"CUSTOMER","accountRefId":"C1379002","nationality":"","partyType":"INDIVIDUAL","contactExtension":{"customerContactPosition":"new"}}],"customerId":"C1379002","extension":{"opportunitySize":"123","createdByGroup":"CPQ_CHN"},"opportunityBusId":"O7406","interactionModel":[],"competitors":[],"updatedBy":"HOBADMIN","updatedOnDate":"08/11/2021 19:40:11","createdOnDate":"08/11/2021 19:39:37","solutionAdviser":[],"age":"0","stageAge":"0"});
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getOpportunityOpenApi' + '/' + param.opportunityId, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/updateOpportunity', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/editOpportunityOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/updateSalesEntityStatus', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/updateSalesEntityStatusOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getTargetUsersWithGroup', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getTargetUsersWithGroupOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getTargetGroups', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getTargetGroupsOpenApi', req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getStateTrasitionList', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getStateTrasitionListOpenApi/' + param.entity + '/' + param.context + '/' + param.fromState, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/uploadDocumentCpq', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/uploadDocumentOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/searchDocumentCpq', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/searchDocumentOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getDocumentCpq', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getDocumentOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/deleteDocumentCpq', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/deletedocument', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/generateCpqQuoteDocument', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqgeneratedocumentservicePrefix') + '/generatedocument/generateCpqQuoteDocumentOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/generateCpqQuoteDocumentFromHtml', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqgeneratedocumentservicePrefix') + '/generatedocument/generateCpqQuoteDocumentFromHtml', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/updateSalesEntityStatusAndCaptureRemarks', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/updatesalesentitystatusAndCaptureRemarksOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/captureRemarks', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/captureRemarksOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/initiateQuote', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/initiateQuoteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/searchQuote', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/searchQuoteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/searchQuoteForLatestQuoteVersion', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/searchQuoteForLatestQuoteVersionOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/createSite', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/site/createSiteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/findSite', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/site/findSiteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/addSiteToQuoteLine', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/site/addSiteToQuotelineOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/bulkCreateSite', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/site/bulkCreateSiteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/validateBulkSite', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/site/validateBulkSiteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/removeSite', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/removeSiteOpenAPI', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/captureConnectedSite', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/captureConnectedSiteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/removePackage', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/removePackagesOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/removeService', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/removeServiceOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getOffers', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/searchProductsOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});


router.post('/addMultipleOffersAndProducts', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/addMultipleOffersAndProductsOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/overridePrice', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/overridePriceOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/customizeProduct', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/customizeProductOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/sendToCustomer', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/sendToCustomerOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/validateSalesOrder', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/validateSalesOrderOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/saveQuoteLine', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/saveQuoteLine', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/saveQuote', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/saveQuoteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/submitQuote', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/submitQuoteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/validateQuote', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/validateQuoteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getQuote', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getQuoteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getQuoteCustomized', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getQuoteCustomizedOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/editQuote', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/editQuoteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/trackQuote', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/trackQuoteOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/redirectWListDetail', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/redirectWListDetailOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getWListDetail', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getWListDetailOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/compareQuote', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/compareQuoteWithDifferentQuoteVersionOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/createOrder', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/createOrderOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/initiateOrderManagement', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/initiateOrderManagementOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/updateConversionProbability', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/updateConversionProbabilityOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getInteraction', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getInteractionOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/saveInteraction', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/saveInteractionOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/createQuoteFromCart', (req, res) => {
  if (mock.isMock) {
    res.json(mock.createQuoteFromCart);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/createQuoteFromCart', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getQuoteAssociatedWithSameOpp', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getQuoteAssociatedWithSameOpp', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getServiceDetails', (req, res) => {
  if (mock.isMock) {
    res.json(mock.getServiceDetails);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getServiceDetailsOpenAPI', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/captureAttributes', (req, res) => {
  if (mock.isMock) {
    res.json(mock.captureAttributes);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/captureAttributesOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/reAssignmentOfEntity', (req, res) => {
  if (mock.isMock) {
    res.json(mock.captureAttributes);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/reAssignmentOfEntity', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/captureQuoteTemplate', (req, res) => {
  if (mock.isMock) {
    res.json(mock.captureQuoteTemplate);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/captureQuoteTemplate', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/searchQuoteTemplate', (req, res) => {
  if (mock.isMock) {
    res.json(mock.searchQuoteTemplate);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/searchQuoteTemplateOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getQuoteTemplate', (req, res) => {
  if (mock.isMock) {
    res.json(mock.getQuoteTemplate);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getQuoteTemplate', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getTrendingProducts', (req, res) => {
  if (mock.isMock) {
    res.json(mock.getTrendingProducts);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/searchTrendingPackage', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/createQuoteFromAccounts', (req, res) => {
  if (mock.isMock) {
    res.json(mock.createQuoteFromAccounts);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/createQuoteFromAccounts', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getIntearctionRemarks', (req, res) => {
  if (mock.isMock) {
    res.json(mock.getIntearctionRemarks);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/searchInteractionRemarksOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/searchTINLead', (req, res) => {
  if (mock.isMock) {
    res.json(mock.searchTINLead);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/Customer/findPartyOpenApi' + '/' + param.TIN, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/createIndividualLead', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/createIndividualLeadOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getIndividualLead', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getIndividualLeadOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/updateIndividualLead', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/updateIndividualLeadOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/searchIndividualLead', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/searchIndividualLeadOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/createConsumerCustomer', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/createConsumerCustomerOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/findPartyCRM', (req, res) => {
  if (mock.isMock) {
    res.json(mock.findPartyCRM);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/Customer/findPartyCrmOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getCustomerDetailsByPartyId', (req, res) => {
  if (mock.isMock) {
    res.json(mock.getCustomerDetailsByPartyId);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/getCustomerDetailsByPartyIdOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/checkForExistingEmail', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/checkForExistingEmailOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
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

router.post('/dashboardLeadsByGroup', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('dashboardservicePrefix') + '/dashboard/lead/all/listByLimit/50', req.session.options)
      // axiosInstance.get('https://st2.hobs.tcs.com/hobsrestgateway/dashboardservice/dashboard/quote/revenueMonthly/team/sum'+'/'+param.date1+'/'+param.date2, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/dashboardOpportunityByGroup', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      // axiosInstance.get(app.get('apiPrefix') + app.get('dashboardservicePrefix') + '/dashboard/quote/revenueMonthly/team/sum'+'/'+param.date1+'/'+param.date2, req.session.options)
      axiosInstance.get(app.get('apiPrefix') + app.get('dashboardservicePrefix') + '/dashboard/opportunity/all/listByLimit/50', req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/dashboardQuotesByGroup', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      // axiosInstance.get(app.get('apiPrefix') + app.get('dashboardservicePrefix') + '/dashboard/quote/revenueMonthly/team/sum'+'/'+param.date1+'/'+param.date2, req.session.options)
      axiosInstance.get(app.get('apiPrefix') + app.get('dashboardservicePrefix') + '/dashboard/quote/all/listByLimit/50', req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getRevenueByGroup', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('dashboardservicePrefix') + '/dashboard/quote/revenueMonthly/all/sum' + '/' + param.date1 + '/' + param.date2, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getRevenueByGroupQuotes', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('dashboardservicePrefix') + '/dashboard/opportunity/all/listForWonLostPipeline' + '/' + param.date1 + '/' + param.date2 + '/' + param.type, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getOpportunityCategorization', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('dashboardservicePrefix') + '/dashboard/opportunity/count/getOpportunityDeatils' + '/' + param.date1 + '/' + param.date2, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/getAllOpportunityCategorization', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('dashboardservicePrefix') + '/dashboard/opportunity/all/list' + '/' + param.type + '/' + param.key + '/' + param.value + '/' + param.date1 + '/' + param.date2, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/checkActionAllowedSendDoc', (req, res) => {
  if (mock.isMock) {
    res.json(mock.custSubsServices);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.post(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/checkIfActionAllowedOnQuoteBasedOnWorkitemApplicabilityOpenApi', param, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

router.post('/fetchEntityWorkItemMap', (req, res) => {
  if (mock.isMock) {
    res.json(mock.fetchEntityWorkItemMap);
  } else {
    const param = req.body;
    axios.all([
      axiosInstance.get(app.get('apiPrefix') + app.get('cpqbusinessservicePrefix') + '/cpqfeatures/fetchEntityWorkItemMapOpenApi/QUOTE' + '/' +  param.quoteSeqNbr, req.session.options)
    ]).then(axios.spread((themeResp) => {
      res.json(themeResp.data);
    })).catch(error => {
      handleServiceErrors(error, res);
    });
  }
});

module.exports = router;