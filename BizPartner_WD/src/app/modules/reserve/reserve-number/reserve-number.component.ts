import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { currentEnv, endPoint, urlNav } from '../../../URL';
import { forkJoin } from 'rxjs';
import { reserveNumberData, reserveNumberResp } from 'app/root-store.actions';
import * as CommonStoreSelectors from 'app/root-store.selectors';
import { loadingFalse, loadingTrue } from 'app/root-store.actions';
import { Store } from '@ngrx/store';
import CryptoJS from 'crypto-js';

@Component({
  selector: 'app-reserve-number',
  templateUrl: './reserve-number.component.html',
  styleUrls: ['./reserve-number.component.scss']
})
export class ReserveNumberComponent implements OnInit {
  ReserveNumberForm:FormGroup = this.builder.group({
    region: [, { validators: [Validators.required], updateOn: "change"}],
    mobilePrefix: [, { validators: [Validators.required], updateOn: "change"}],
    criteria: [, { validators: [Validators.required], updateOn: "change"}],
    numberPattern: [, { validators: [Validators.required, Validators.pattern('^[0-9]{1,10}$')], updateOn: "change"}],
    // quantity: [, { validators: [Validators.required, Validators.pattern('^((?!(0))[0-9]{1,4})$')], updateOn: "change"}],
    outletID: [, { validators: [Validators.required], updateOn: "change"}]
  })
  // ReserveNumberForm:FormGroup;
  outletIDApi : any;
  property: any[] = [
    {
      "key": "region",
      "title": "Region",
      "label": "Region",
      "required": true,
      "order": 1,
      "controlType": "dropdown",
      "type": "",
      "enum": [
        {
          "label": "Kuala Lumpur",
          "value": "Kuala Lumpur",
          "disabled": false
        },
        {
          "label": "Selangor",
          "value": "Selangor",
          "disabled": false
        },
        {
          "label": "Negeri Sembilan",
          "value": "Negeri Sembilan",
          "disabled": false
        },
        {
          "label": "Melaka",
          "value": "Melaka",
          "disabled": false
        },
        {
          "label": "Kelantan",
          "value": "Kelantan",
          "disabled": false
        },
        {
          "label": "Terengganu",
          "value": "Terengganu",
          "disabled": false
        },
        {
          "label": "Pahang",
          "value": "Pahang",
          "disabled": false
        },
        {
          "label": "Pulau Pinang",
          "value": "Pulau Pinang",
          "disabled": false
        },
        {
          "label": "Perlis",
          "value": "Perlis",
          "disabled": false
        },
        {
          "label": "Kedah",
          "value": "Kedah",
          "disabled": false
        },
        {
          "label": "Perak",
          "value": "Perak",
          "disabled": false
        },
        {
          "label": "Sabah",
          "value": "Sabah",
          "disabled": false
        },
        {
          "label": "Sarawak",
          "value": "Sarawak",
          "disabled": false
        },
        {
          "label": "Johor",
          "value": "Johor",
          "disabled": false
        }
      ],
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
        "required": true
      },
      "error": {
        "pattern": "",
        "required": "Region is required!"
      },
      "externalAPIPayload": {},
      "options": []
    },
    {
      "key": "mobilePrefix",
      "title": "Type of Mobile Number Prefix",
      "label": "Type of Mobile Number Prefix",
      "required": true,
      "order": 2,
      "controlType": "dropdown",
      "type": "",
      "enum": [
        {
          "label": "010",
          "value": "010",
          "disabled": false
        },
        {
          "label": "011",
          "value": "011",
          "disabled": false
        },
        {
          "label": "013",
          "value": "013",
          "disabled": false
        },
        {
          "label": "014",
          "value": "014",
          "disabled": false
        },
        {
          "label": "019",
          "value": "019",
          "disabled": false
        }
      ],
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
        "required": true
      },
      "error": {
        "pattern": "",
        "required": "Type of Mobile Number Prefix is required!"
      },
      "externalAPIPayload": {},
      "options": []
    },
    {
      "key": "criteria",
      "title": "Criteria",
      "label": "Criteria",
      "required": true,
      "order": 3,
      "controlType": "dropdown",
      "type": "",
      "enum": [
        {
          "label": "Starts With",
          "value": "STARTS WITH",
          "disabled": false
        },
        {
          "label": "Ends With",
          "value": "ENDS WITH",
          "disabled": false
        },
        {
          "label": "Contains",
          "value": "CONTAINS",
          "disabled": false
        },
        {
          "label": "Equals",
          "value": "EQUALS",
          "disabled": false
        }
      ],
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
        "required": true
      },
      "error": {
        "pattern": "",
        "required": "Criteria is required!"
      },
      "externalAPIPayload": {},
      "options": []
    },
    {
      "key": "numberPattern",
      "title": "Number Pattern",
      "label": "Number Pattern",
      "required": false,
      "order": 4,
      "controlType": "textbox",
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
        "pattern": "[a-zA-Z ]*",
        "required": true
      },
      "error": {
        "pattern": "Number Pattern Error!",
        "required": "Number Pattern is required!"
      },
      "externalAPIPayload": {}
    },
    {
      "key": "quantity",
      "title": "Quantity",
      "label": "Quantity",
      "required": true,
      "order": 6,
      "controlType": "hidenfield",
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
        "pattern": "[a-zA-Z ]*",
        "required": true
      },
      "error": {
        "pattern": "Quantity Pattern Error!",
        "required": "Quantity is required!"
      },
      "externalAPIPayload": {}
    },
    {
      "key": "outletID",
      "title": "Outlet ID",
      "label": "Outlet ID",
      "required": false,
      "order": 5,
      "controlType": "textbox",
      "type": "",
      "enum": [
        {
          "label": "10000",
          "value": "10000",
          "disabled": false
        }
      ],
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
        "required": true
      },
      "error": {
        "pattern": "",
        "required": "Outlet ID is required!"
      },
      "externalAPIPayload": {}
    },
    {
      "key": "reserve",
      "title": "Reserve",
      "label": "Next",
      "required": false,
      "order": 1,
      "controlType": "button",
      "type": "formButton",
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
      "event": "onSave",
      "buttonClass": "button-width-40",
      "buttonColor": "accent",
      "disabled": false,
      "icon": ""
    }
  ]
  requiredCheckDropdown = new FormControl('', [Validators.required]);
  requiredCheck0 = new FormControl('', [Validators.required]);
  requiredCheck1 = new FormControl('', [Validators.required]);
  requiredCheck2 = new FormControl('', [Validators.required]);
  requiredCheck3 = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{1,10}$')]);
  requiredCheck4 = new FormControl('', [Validators.required, Validators.pattern('^((?!(0))[0-9]{1,4})$')]);
  requiredCheck5 = new FormControl('', [Validators.required]);
  // requiredCheck3 = new FormControl('', [Validators.required, Validators.pattern(this.property[3].validators.pattern)]);
  // requiredCheck4 = new FormControl('', [Validators.required, Validators.pattern(this.property[4].validators.pattern)]);

  constructor(private router:Router, private builder: FormBuilder, private http: HttpClient, private store: Store) { }

  ngOnInit(): void {
    // console.log('get user hierarchy', endPoint.getUserHierarchy);
    this.store.dispatch(loadingTrue());
    this.store.select(CommonStoreSelectors.reserveNumberData).subscribe(result => {
      if (result){
        this.ReserveNumberForm.get('region').setValue(result.region);
        this.ReserveNumberForm.get('mobilePrefix').setValue(result.mobilePrefix);
        this.ReserveNumberForm.get('criteria').setValue(result.criteria);
        this.ReserveNumberForm.get('numberPattern').setValue(result.numberPattern);
        // this.ReserveNumberForm.get('quantity').setValue(result.quantity);
        this.ReserveNumberForm.get('outletID').setValue(result.outletID);
      }
    });

    setTimeout(()=>{
      const sessionData = sessionStorage.getItem('userData');
      // console.log("sessionData :", sessionData);
    

      if (sessionData) {
        const decrypted = CryptoJS.AES.decrypt(sessionData, '01234567890112').toString(CryptoJS.enc.Utf8);
        const decryptedJson = JSON.parse(decrypted);
        // console.log("sessionData Decrypted :", decryptedJson);
        this.outletIDApi = [
          {
          label : decryptedJson.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].outletId,
          value : decryptedJson.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].outletId
        }
      ]
      }

      
      const payload = {
        "position": "Dealer Owner",
        "userId": "950480"
        // "position": "Supervisor",
        // "userId": "S0003932390"
      }
      this.http.post<any>(endPoint.getUserHierarchyCW, payload).subscribe(results => {
        // console.log("getUserHierarchy 2");
        const outletIDResult = [];
        if (results.orderHistory && results.orderHistory.length > 0) {
          results.orderHistory.forEach(element => {
            let idList = {
              label : element.outletId,
              value : element.outletId
            };
            outletIDResult.push(idList);
          })
          this.outletIDApi = outletIDResult;
        }
      })
      this.store.dispatch(loadingFalse());
    }, 2000);
  }

  back(){
    window.location.href = `${currentEnv}${urlNav.frontofficehome}`;
  }

  next(){
    this.store.dispatch(loadingTrue());
    // this.ReserveNumberForm.get('idNumber').value,
    console.log("ReserveNumberForm :", this.ReserveNumberForm);
    const payload = {
      "xnumbercategory": "NORMAL",
      "xprefix": this.ReserveNumberForm.get('mobilePrefix').value,
      "xcriteria": this.ReserveNumberForm.get('criteria').value,
      "xnumberpattern": this.ReserveNumberForm.get('numberPattern').value,
      "xregion": "CENTRAL",
      "xstartrange": "0",
      "xendrange": 99
    }
    let reserveNumberCall = this.http.post<any>(endPoint.getReserveNumberList, payload);
    forkJoin([reserveNumberCall]).subscribe(results => {
      this.store.dispatch(loadingFalse());
      console.log("reserveNumberCall :", results)
      // this.ReserveNumberForm = results[0];
      // this.router.navigate(['/check/reservestatus'])
      this.store.dispatch(reserveNumberResp({ payload: results[0].responseBody.xmsisdnListType.xmsisdnList }));
      this.router.navigate(['/check/reserveselection']);
    });

    this.store.dispatch(reserveNumberData({ payload: {
      "mobilePrefix": this.ReserveNumberForm.get('mobilePrefix').value,
      "criteria": this.ReserveNumberForm.get('criteria').value,
      "numberPattern": this.ReserveNumberForm.get('numberPattern').value,
      "region": this.ReserveNumberForm.get('region').value,
      "quantity": 100,
      "outletID": this.ReserveNumberForm.get('outletID').value,
    } }));
    // this.router.navigate(['/check/reserveselection']);
  }

  getDropdownErrorMessage(val) {
    const temp = this.ReserveNumberForm.get(val)

    if (temp.hasError('required') && val === "region") {
      return 'Region is required';
    } else if (temp.hasError('required') && val === "mobilePrefix") {
      return 'Mobile Prefix is required';
    } else if (temp.hasError('required') && val === "criteria") {
      return 'Criteria is required';
    } else if (temp.hasError('required') && val === "outletID") {
      return 'Outlet ID is required';
    } else if (val === "numberPattern") {
      if (temp.hasError('required')) return 'Number Pattern is required';
      if (temp.hasError('pattern')) return 'Number Pattern is invalid';
    } else if (val === "quantity") {
      if (temp.hasError('required')) return 'Quantity is required';
      if (temp.hasError('pattern')) return 'Quantity is invalid';
    } 
  }
}
