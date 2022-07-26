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


const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

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

const debug = true;
function printlog(...args) {
  if (debug) {
    console.log(...args);
  }
}

// celcom wolverine dealer retrieval
router.post('/dealerRetrieval', (req, res) => {
  const params = {
    "retrieveDealerInput": {
      "listOfCelRetrieveDealerProfileRequest": {
          "partnerContact": {
          "loginName": "R001970445"
          }
      }
    }
  };

  const httpOptions = {
    headers: {
      'Content-Type' :'application/json',
      'SourceApplicationID': 'DTE',
      'UUID': 'app_selfcare' ,
      'buId': 'DEFAULT' ,
      'channel': 'ONL' ,
      'interactionDate':  '2019-07-03T16:15:00+05:30' ,
      'interactionId': 'I207556616443' ,
      'lang': 'ENG' ,
      'opId': 'HOB' ,
      'serviceName': 'SubmitOrder', 
      'triggeredBy': 'user101' ,
      'password': 'password' 
    }
  }

  axios
    .all([axiosInstance.post("https://10.8.24.28:10905/dealerRetrieval", params, httpOptions)])
    .then(axios.spread(store => { console.log('Unreserve Number Store Id', res.json(store.data))}))
    .catch(error => { console.error('error here --->', error) });
});


// celcom wolverine get token function
function getTokenIGW() {
  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append('client_id', 'aAue6lkxYKrQpwAgF6CDxNsmvKIa')
  params.append('client_secret', 'iUX7P09Y9S8zq5KmxFIFDxaQ0AQa')
  const hd = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  }
  return new Promise((resolve, reject) => {
    axios.post("https://igw.apistg.celcom.com.my/token", params, hd)
    .then((result) => {
       acc_token=result.data.access_token
       console.log("Acccccesss token:",acc_token)
       resolve(acc_token);
    })
    .catch((error) => {
      reject(error);
      console.log("IGW error:",error)
      //handleServiceErros(error, res);
    });
  })
 //code to get get auth token from igw
}

// celcom wolverine internal and external blacklist check
router.post("/blacklistCheck", async (req, res) => {
  try {
    const token = await getTokenIGW();
    const head = {
      headers: {
        "Authorization" : "Bearer "+ token,
        "Accept" : "*/*",
        "Content-Type" : "application/json",
        "Accept-Encoding" : "gzip, deflate, br",
        "Connection" : "keep-alive"
      } 
    }
    param = req.body;
    const blacklist = await axios.post("https://igw.apistg.celcom.com.my/customer-account-blacklistinfo-query/v1.0/accounts/blacklistinfo", param, head);
    res.json(blacklist?.data)
  } catch(err) {
    console.error(err);
  }
});

// celcom wolverine query reserve number
router.get("/queryreservenumber", (req, res) => {
  const params = {
    "requestBody": {
      "msisdnRequestList": [
        { "msisdn": "0132892353" }
      ],
      "outletId": "",
      "userId": ""
    },
    "requestHeader": {
      "eventName": "QueryNumbersFromStore",
      "sourceSystem": "Siebel",
      "transDateTime": ""
    }
  }

  axios
    .all([axiosInstance.post("https://dte.ms.sit.celcom.com.my/osb-querynumbersfromstore-ms/osb/queryNumbersFromStore", params)])
    .then(axios.spread(query => { console.log('Query numbers from store', res.json(query.data))}))
    .catch(error => { console.error('error here --->', error) });
});

// celcom wolverine assign reserve number
router.post("/assignreservenumber", (req, res) => {
  if (mock.isMock) {

    console.log("Response is from mock")
  } else {

    console.log(
      "EXPRESS REQUEST TO assign reserve number: ",
      req._parsedUrl.pathname,
      req.body
    );
    const param = req.body;

  axios
    .all([axiosInstance.post("https://dte.ms.st.celcom.com.my/osb-assign-numbers-to-store-ms/osb/assignNumberToStore", param)])
    .then(axios.spread ((themeResp) => {
      //printlog(themeResp.data);
      console.log("assign reserve number", themeResp.data);
      res.json(themeResp.data);
    })
     )
    .catch(error => { console.error('error here --->', error) });
}
});

// celcom wolverine store id unreserve number
router.post("/storeidreservenumber", (req, res) => {
  console.log("req storeid :", req.body.requestBody.xmsisdnlist.xmsisdn[0]);
  const payload = req.body.requestBody.xmsisdnlist.xmsisdn[0];
  const params = {
    "requestBody": {
      "xmsisdnlist": {
      "xmsisdn": req.body.requestBody.xmsisdnlist.xmsisdn
      },
      "xoutletid": req.body.requestBody.xoutletid? req.body.requestBody.xoutletid : null
    },
    "requestHeader": {
      "eventName": req.body.requestHeader.eventName? req.body.requestHeader.eventName : null,
      "sourceSystem": req.body.requestHeader.sourceSystem? req.body.requestHeader.sourceSystem : null,
      "transDateTime": req.body.requestHeader.transDateTime? req.body.requestHeader.transDateTime : null
    }
  }

  // console.log("INPUTS param :", params.requestBody.xmsisdnlist.xmsisdn);

  axios
    .all([axiosInstance.post("https://dte.ms.st.celcom.com.my/osb-number-unreserve-storeid-ms/osb/numberUnreserveStoreId", params)])
    .then(axios.spread(store => { console.log('Unreserve Number Store Id', res.json(store.data))}))
    .catch(error => { console.error('error here --->', error) });
});

// celcom wolverine get reserve number list
router.post("/getreservenumberlist", (req, res) => {
  if (mock.isMock) {
    //res.json(mock.servicesList);
	  console.log("Response is from mock")
  } else {
    console.log(
      "EXPRESS REQUEST available Numbers Retrieve: ",
      req._parsedUrl.pathname,
      req.body
    );
   
    const param = req.body;
	// const param = {
  //   "xnumbercategory": "NORMAL",
  //   "xprefix": "013",
  //   "xcriteria": "EQUALS",
  //   "xnumberpattern": "0136312195",
  //   "xregion": "CENTRAL1",
  //   "xstartrange": "0",
  //   "xendrange": "0"
  // }
    console.log("EXPRESS REQUEST TO query Numbers From Outlet PARAM: ", param);

    axios
      .all([
        axiosInstance.post(
          "https://dte.ms.st.celcom.com.my/osb-available-numbers-retrieve-ms/osb/availableNumbersRetrieve",
          param
          //,req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          console.log("available Numbers Retrieve",themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

// celcom wolverine get UNreserve number list
router.post("/getunreservenumberlist", (req, res) => {
  if (mock.isMock) {
	  console.log("Response is from mock")
  } else {
    console.log(
      "EXPRESS REQUEST TO query Numbers From Outlet By UserID: ",
      req._parsedUrl.pathname,
      req.body
    );
    const param = req.body;

    console.log("EXPRESS REQUEST TO query Numbers From Outlet PARAM: ", param);
    axios
      .all([
        axiosInstance.post(
          "https://dte.ms.st.celcom.com.my/osb-querynumbers-fromoutlet-byuserid-ms/osb/queryNumbersFromOutletByUserID",
          param
          //,req.session.options
        ),
      ])
      .then(
        axios.spread((themeResp) => {
          //printlog(themeResp.data);
          console.log("query Numbers From Outlet By User ID",themeResp.data);
          res.json(themeResp.data);
        })
      )
      .catch((error) => {
        handleServiceErros(error, res);
      });
  }
});

//code changes end here 5
router.post("/getCampaignFullList", (req, res) => {

  pth = path.join(__dirname, '/DigiCertGlobalRootCA.crt.pem')

  //console.log("This is the path", pth)
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

  // console.log("Request Bodyyy", req.body); 
  conn.query("SELECT * FROM campaign_details", function (err, result) {

    if (err) {

      console.log('error creating table: ' + err.stack);

      return;

    }

    console.log("output:::", result);

    var re = { data: result }

    res.json(re)

  });



});


router.post("/uploadCampaignList", (req, res) => {

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

  console.log("Request Bodyyy", req.body);

  var ls = req.body.data;



  for (var i = 0; i < ls.length; i++) {

    var sql = "INSERT INTO campaign_details (";

    var st = new String()

    var values = []

    var ls_it = []

    for (var attributename in ls[i]) {



      st = st + attributename + ",";



      if (attributename == "mobilenumber" && typeof ls[i][attributename] == "string") {

        ls[i][attributename] = Number(ls[i][attributename])

        console.log("atr chnged", ls[i][attributename])

      }

      if (attributename.includes("date")) {

        var dt = ls[i][attributename].split("/")

        ls[i][attributename] = dt[2] + "/" + dt[1] + "/" + dt[0];

      }

      console.log(attributename + ": " + ls[i][attributename]);

      ls_it.push(ls[i][attributename])

    }

    values.push(ls_it)

    sql = sql + st.slice(0, -1) + ") VALUES ?"

    console.log("query created:", sql)

    conn.query(sql, [values], function (err, result) {

      if (err) { console.log('error inserting data: ' + err.stack); };



    });



  }

  conn.query("SELECT * FROM campaign_details", function (err, result) {

    if (err) {

      console.log('error creating table: ' + err.stack);

      return;

    }

    console.log("output:::", result);

    var re = { data: result }

    res.json(re)

  });




});


router.post("/crpMatrixPlanScenario", (req, res) => {
  if (mock.isMock) {
    console.log("Response is from mock")
  } else {
    const param = req.body;
    console.log("Headersssss", req.headers);
    req.headers.opId = 'HOB';
    req.headers.buId = 'DEFAULT';
    console.log("Final Headers", req.headers);
    //   const param ={
    //     "sourcePassId":"Pulse",
    //     "sourcePackageID":"PB03140",
    //     "targetPackageID":null,
    //     "targetPassId":null,
    //     "convergence":"Y",
    //     "ep":"",
    //     "source":"",
    //     "age":""
    //  }
    //    const param = {
    //     "companyBRNId":"CELCOMTEST2018",
    //     "devicePartNumber":"MDR10077",
    //     "groupName":"PPA",
    //     "planPartNumber":"PB10850",
    //     "source":""
    //  };

   // console.log("Final Headers", head1);
    console.log("EXPRESS REQUEST TO get siebel plans PARAM: ", param);

    axios
      .post(
        "https://dev.hobs.celcom.com.my/hobsrestgateway/cobpfetchservices/order/v1/fetchCobpMatrix",
        param, {
        headers: {
          'content-type': 'application/json',
          //'user-agent': 'PostmanRuntime/7.28.4',
          'accept': '*/*',
          //'host': 'localhost:8000',
          'accept-encoding': 'gzip, deflate, br',
          'connection': 'keep-alive',
          //'content-length': '211',
          //'cookie': 'NSESSIONID=s%3AVZsrRCYrnoLc7hOq4EVy3ALnTdz_V0ik.oetmq8a7yi%2B%2BxEXJC%2FKsUYxEKzcgaiHyXQVj3WKEIEw',
          'opId': 'HOB',
          'buId': 'DEFAULT'
        }
      }
      )
      .then(
        (themeResp) => {
          // console.log("themeResp::::", themeResp);
          //printlog(themeResp.data);
          console.log("Helooooo");
          res.json(themeResp.data);
        })
      .catch((error) => {

        handleServiceErros(error, res);
      });
  }
});

router.post("/getSiebelAdditionalVas", (req, res) => {
  if (mock.isMock) {
    console.log("Response is from mock")
  } else {
    const param = req.body;
    console.log("EXPRESS REQUEST TO get siebel plans PARAM: ", param);

    axios
      .post(
        "https://dte.ms.st.celcom.com.my/siebel-vas-corporatesubsidy-details-ms/siebel/getVASCorporatesubsidyDetails",
        param, {
        headers: {
          "accept" : "*/*",
           "Content-Type": "application/json"
        }
      }
      )
      .then(
        (themeResp) => {
          // console.log("themeResp::::", themeResp);
          //printlog(themeResp.data);
          console.log("Helooooo");
          res.json(themeResp.data);
        })
      .catch((error) => {

        handleServiceErros(error, res);
      });
  }
});

router.post("/getCustStatus", (req, res) => {
  pth=path.join(__dirname,'/DigiCertGlobalRootCA.crt.pem')
  
  con_para={
    host     : '10.8.45.132',
    user     : 'bizpartnerusr',
    password : 'bizpartnerc!1S',
    database : 'bizpartner',
    ssl  : {
      ca: fs.readFileSync(pth)
    }
  }
  
  var conn = mysql.createConnection(con_para);
   
  conn.connect(function(err) {
    if (err) {
      console.log('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + conn.threadId);
  });
  
  //sample request body
  // body={
  //     "username":"V10911X"
  // }
  
  un=req.body.username
  //un="izzat"
  let qr="select * from admin_details where username='"+un+"'";
  let an={}
  conn.query(qr, function (err, result) {
    if (err) {
      console.log('error creating table: ' + err.stack);
      return;
    }
   
    if(result.length==0)
    {
       an["status"]="Invalid"
    }
    else{
        an["status"]="Valid"
    }
    //console.log(result);
    console.log("an value:",an);
    res.json(an)
    
  });
  conn.end();
  
  });

  router.post("/getDeleteCampaign", (req, res) => {
    pth=path.join(__dirname,'/DigiCertGlobalRootCA.crt.pem')
    
    con_para={
      host     : '10.8.45.132',
      user     : 'bizpartnerusr',
      password : 'bizpartnerc!1S',
      database : 'bizpartner',
      ssl  : {
        ca: fs.readFileSync(pth)
    }
    }
    
    var conn = mysql.createConnection(con_para);
     
    conn.connect(function(err) {
      if (err) {
        console.log('error connecting: ' + err.stack);
        return;
      }
      console.log('connected as id ' + conn.threadId);
    });
    
    del_arr=req.body
     
    // var del_arr={
    //     "campaignname":"Celcom 2"
    // }
    console.log("del_arr :", del_arr);
    let l=del_arr.length;
    var co=0
    for(let i=0;i<l;i++){
     let un=del_arr[i]
     console.log("un :", un);
    let qr=`Delete from campaign_details where campaignname="${un.campaignname}" and accountname="${un.accountname}" and billingaccountnumber="${un.billingaccountnumber}" and mobilenumber=${un.mobilenumber} and outletid="${un.outletid}";`
    conn.query(qr, function (err, result) {
      if (err) {
        console.log('error removing data' + err.stack);
        return;
      }
      console.log("result co B4 :", co);
      co=co+result.affectedRows;
      console.log("result co AFTER :", co);
      console.log("result affectedRows :", result.affectedRows);
      console.log(result.affectedRows)
    });
    }
    conn.end();
    var an={
        "affected Rows":l
    }
    res.json(an)
    
    });

    router.post("/getPincodeQuery", (req, res) => {
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
    
      console.log("Request Bodyyy", req.body);
      console.log("SELECT city, state FROM pin_address_map WHERE postalcode="+ req.body);
    
      var ls = req.body.data;
      conn.query(`SELECT city, state FROM pin_address_map WHERE postalcode='` + req.body.postalCode +`'`, function (err, result) {
    
        if (err) {
          console.log('error creating table: ' + err.stack);
          return;
        }
    
        console.log("output:::", result);
        var re = { data: result }
        res.json(re)
      });
    });

    router.post('/getUserHierarchyCW', (req, res) => {
      const params = req.body;
      console.log("Nishant body ketul :", params);
    
      const httpOptions = {
        headers: {
          'accept': 'application/json',
          'authorization': 'authString',
          'buId': 'DEFAULT',
          'channel': 'ONL',
          'interactionDate': '2022-06-30T16:15:00+05:30',
          'interactionId': 'I207556616443',
          'lang': 'ENG',
          'opId': 'HOB',
          'serviceName': 'SubmitOrder',
          'sourceApplicationID': 'SELFCARE',
          'triggeredBy': 'user101',
          'uUID': 'app_selfcare',
          'Content-Type': 'application/json'
        }
      }
    
      axios
        .all([axiosInstance.post("https://10.8.24.18:10905/userHierarchy", params, httpOptions)])
        .then(axios.spread(store => { 
          console.log('userHierarchy Resp :', res.json(store.data));
          // res.json(store.data)
        }))
        .catch(error => { console.error('error here --->', error) });
    });

module.exports = router;
