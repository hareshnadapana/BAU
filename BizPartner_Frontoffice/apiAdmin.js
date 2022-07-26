var winston = require('./winston');
var express = require('express');
var router = express.Router();
const mock = require('./mockResp.js');
const axios = require('axios');
var app = express();
var user = { cas_user: null, cas_user_info: {} };
const envConst = require('./envConst.js');
const https = require('https');
//const formdata = require('./dashboardforms.js');

app.set('apiPrefix', 'https://' + envConst.API_PREFIX);
app.set('envLogServicePrefix', 'https://' + envConst.HOST + ':' + envConst.PORT);
app.set('envDevelopmentMode', envConst.ENV_DEVELOPMENT_MODE);
app.set('envLogLevel', envConst.ENV_LOGLEVEL);
//console.log('HOST from js ---:', app.get('apiPrefix'));
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

// let req.session.options = {
//     headers: {
//         'Content-Type': 'application/json',
//         'opID': 'HOB',
//         'buID': 'DEFAULT',
//         'userID': 'fo_user',
//         'Authorization': 'Basic YXRfcmVnOmF0X3JlZw==',

//     }
// };
// let formOptions = {
//     headers: {
//         'Content-Type': 'application/json',
//         'opID': 'HOB',
//         'buID': 'DEFAULT',
//         'userID': 'fo_user',
//         'Authorization': 'Basic YXRfcmVnOmF0X3JlZw=='

//     }
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
    axios.all([
        axiosInstance.get(app.get('apiPrefix') + '/tibchassisrestservice/rest/uimetadataservice/controlparams/COMMON/FO~CRMS~UUIS?opId=' + user.cas_user_info.opId + '&buId=' + user.cas_user_info.buId + '&language=' + user.cas_user_info.language)
    ]).then(axios.spread((themeResp) => {
        console.log("themeResp--", themeResp.data);
        user.cas_user_info.authorization = themeResp.data;
        console.log("user-ccc-", user);
        req.session.options = {
            headers: {
                'Content-Type': 'application/json',
                'opID': user.cas_user_info.opId,
                'buID': user.cas_user_info.buId,
                'userID': user.cas_user,
                'Authorization': "Basic " + themeResp.data,
            }
        };
        req.session.options = {}
        req.session.options = options;
        req.session.save();
        console.log("options--", req.session.options);
        // res.json(themeResp.data);
    })).catch(error => {

    });
}

router.get('/admin/user', (req, res) => {
    //printlog('EXPRESS : /user start');
    if (mock.isMock) {
        res.json(mock.user);
    }
    let sessionUser = '';
    console.log("/api/user--");
    // if (envConst.ENV == 'prod')
    //     sessionUser = req.session.cas.user;
    // else
        sessionUser = 'wolve_test';
    axios.all([
        axiosInstance.post(app.get('apiPrefix') + '/ssorest/rest/ssoservice/userById',
            sessionUser, { headers: { 'Content-Type': envConst.CONTENT_TYPE_USER } }),
        axiosInstance.post(app.get('apiPrefix') + '/ssorest/rest/ssoservice/getRoleForUser',
            sessionUser, { headers: { 'Content-Type': envConst.CONTENT_TYPE_USER } })
    ]).then(axios.spread((userInfo, userRole) => {
        user.cas_user = userInfo.data.ssoUser.login;
        user.cas_user_info = {
            fullName: userInfo.data.ssoUser.firstName + ' ' + userInfo.data.ssoUser.lastName,
            shortName: userInfo.data.ssoUser.firstName[0].toUpperCase() + userInfo.data.ssoUser.lastName[0].toUpperCase(),
            opId: userInfo.data.ssoUser.opId,
            buId: userInfo.data.ssoUser.buId,
            language: userInfo.data.ssoUser.languageCd,
            roles: []
        };
        getToken(user, req, res);

        for (const role of userRole.data) {
            user.cas_user_info.roles.push(role.roleName);
        }
        user.cas_user_info.roles = user.cas_user_info.roles.filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        });
        user.cas_user_info.roles.sort();
        //printlog('EXPRESS : /user userInfo', userInfo.data);
        //printlog('EXPRESS : /user end');
        res.json(user);
    }));
});



router.get('/getAppUrl/admin', (req, res) => {
    console.log('EXPRESS REQUEST TO getAppUrl: ',);
    res.json(formdata.apiEndPoint);

});


router.post('/loadAllForms', (req, res) => {
    console.log('EXPRESS REQUEST TO loadAllForms: ',);
    if (mock.isMock) {

    } else {
        const appName = req.body.appName;
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/all/' + appName,
                req.session.options
            )
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/loadFormByFormId', (req, res) => {
    console.log('EXPRESS REQUEST TO loadFormByFormId: ',);

    if (mock.isMock) {

    } else {
        const formId = req.body.formId;
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + formId,
                req.session.options
            )
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/saveFormData', (req, res) => {
    console.log('EXPRESS REQUEST TO saveFormData: ', req.body);

    if (mock.isMock) {

    } else {
        const param = req.body;
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/add', param,
                req.session.options
            )
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/editFormData', (req, res) => {
    console.log('EXPRESS REQUEST TO editFormData: ', req.body);

    if (mock.isMock) {

    } else {
        const param = req.body;
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/update', param,
                req.session.options
            )
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});



router.post('/deleteFormData', (req, res) => {
    console.log('EXPRESS REQUEST TO deleteFormData: ', req.body.formId);

    if (mock.isMock) {

    } else {
        const formId = req.body.formId;
        axios.all([
            axiosInstance.delete(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/uiItemFormData/FrontOffice/' + formId,
                req.session.options
            )
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});


router.post('/loadAllApps', (req, res) => {
    console.log('EXPRESS REQUEST TO loadAllApps: ',);
    if (mock.isMock) {
        res.json(mock.apps)
    } else {
        const appName = req.body.appName;
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/appSettingsData/all/' + appName,
                req.session.options
            )
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/getAppDetails', (req, res) => {
    console.log('EXPRESS REQUEST TO getAppDetails: ', req.body.projectName);

    if (mock.isMock) {
        res.json(mock.pojectDetails)
    } else {
        const projectName = req.body.projectName;
        axios.all([
            axiosInstance.get(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/appSettingsData/FrontOffice/' + projectName,
                req.session.options
            )
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});

router.post('/saveAppSetting', (req, res) => {
    console.log('EXPRESS REQUEST TO saveAppSetting: ', req.body);

    if (mock.isMock) {

    } else {
        const param = req.body;
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/appSettingsData/add', param,
                req.session.options
            )
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});
router.post('/editAppSetting', (req, res) => {
    console.log('EXPRESS REQUEST TO editAppSetting: ', req.body);

    if (mock.isMock) {

    } else {
        const param = req.body;
        axios.all([
            axiosInstance.post(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/appSettingsData/update', param,
                req.session.options
            )
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
        });
    }
});



router.post('/deleteAppSetting', (req, res) => {
    console.log('EXPRESS REQUEST TO deleteFormData: ', req.body);

    if (mock.isMock) {

    } else {
        const projectName = req.body.projectName;
        axios.all([
            axiosInstance.delete(app.get('apiPrefix') + '/hobsrestgateway/tibchassisservices/appSettingsData/FrontOffice/' + projectName,
                req.session.options
            )
        ]).then(axios.spread((themeResp) => {
            res.json(themeResp.data);
        })).catch(error => {
            handleServiceErros(error, res);
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




module.exports = router;