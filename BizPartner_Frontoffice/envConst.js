
// exports.HOST = '01hw196962';
// exports.PORT_ORDER = '20060';
// exports.BIND_ADDRESS = '01hw196962';
// exports.PORT_DASHBOARD = '20070';
// exports.ENV="dev";



const nconf = require('nconf');
nconf.argv()
   .env()
   .file({ file: './config.json' });

// nconf.argv()
//    .env()
//    .file({ file: '../config.json' }); 

exports.ENV = nconf.get("angular.env");
exports.SERVER_KEY = nconf.get("angular.orderapp.privateKey");
exports.SERVER_CRT = nconf.get("angular.orderapp.certificate");
exports.ENV_DEVELOPMENT_MODE = nconf.get('angular.env.developmentMode');
exports.ENV_LOGLEVEL = nconf.get('angular.env.loglevel');
exports.HOST = nconf.get("angular.frontoffice.host");
exports.CAS_PREFIX = nconf.get('angular.frontoffice.casPrefix');
exports.API_PREFIX = nconf.get('angular.frontoffice.apiPrefix');
exports.PORT = nconf.get("angular.frontoffice.port");
exports.USER_CALL_PREFIX = nconf.get("angular.frontoffice.userCallPrefix");
//exports.CONTENT_TYPE_USER = 'multipart/form-data';
exports.APP_CONTEXT="/frontoffice";
exports.LOG_PREFIX = nconf.get('angular.frontoffice.logPrefix');
//st2 config
exports.CONTENT_TYPE_USER = 'text/plain'; 


//hooks
exports.HOOK_SUBS_APP='./responseMapping/subscriberApp/apiService.js';
exports.HOOK_ORD_PROFILE_APP='./responseMapping/orderProfileApp/apiService.js';
exports.HOOK_FORM_ORDER_APP='./responseMapping/orderApp/apiFormService.js';
exports.HOOK_DASHBOARD_APP='./responseMapping/dashboardApp/apiService.js';