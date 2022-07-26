
import { Component, OnInit , Inject, Optional} from '@angular/core';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
// import { ApplogService } from 'src/app/shared/services/applog.service';
// import { HttpClient } from '@angular/common/http';
// import { EachcomponentService } from '@hobsui/genericform';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-campaign-targeting-popup',
  templateUrl: './campaign-targeting-popup.component.html',
  styleUrls: ['./campaign-targeting-popup.component.scss']
})
export class CampaignTargetingPopupComponent implements OnInit {
  property: any[] = [
    {
      "key": "campaignname",
      "title": "Campaign Name",
      "label": "Campaign Name",
      "required": false,
      "order": 1,
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
      "key": "accountname",
      "title": "Account Name",
      "label": "Account Name",
      "required": false,
      "order": 2,
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
      "key": "billingaccno",
      "title": "Billing Account Number",
      "label": "Billing Account Number",
      "required": false,
      "order": 3,
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
      "key": "custstate",
      "title": "Customer State",
      "label": "Customer State",
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
      "key": "mobileno",
      "title": "Mobile Number",
      "label": "Mobile Number",
      "required": false,
      "order": 5,
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
      "key": "outletid",
      "title": "Outlet ID",
      "label": "Outlet ID",
      "required": false,
      "order": 6,
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
      "key": "arpu",
      "title": "ARPU",
      "label": "ARPU",
      "required": false,
      "order": 7,
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
    }
  ]

  requiredCheck0 = new FormControl('', [Validators.required]);
  requiredCheck1 = new FormControl('', [Validators.required]);
  requiredCheck2 = new FormControl('', [Validators.required]);
  requiredCheck3 = new FormControl('', [Validators.required]);
  requiredCheck4 = new FormControl('', [Validators.required]);
  requiredCheck5 = new FormControl('', [Validators.required]);
  requiredCheck6 = new FormControl('', [Validators.required]);

  inputFormArray: any[];
  campaignPopupForm: FormGroup = this.builder.group({
    campaignname: [, { validators: [Validators.required], updateOn: "change"}],
    accountname: [, { validators: [Validators.required], updateOn: "change"}],
    billingaccno: [, { validators: [Validators.required], updateOn: "change"}],
    custstate: [, { validators: [Validators.required], updateOn: "change"}],
    mobileno: [, { validators: [Validators.required], updateOn: "change"}],
    outletid: [, { validators: [Validators.required], updateOn: "change"}],
    arpu: [, { validators: [Validators.required], updateOn: "change"}]
  })

  constructor(private router:Router, private route: ActivatedRoute,
    private builder: FormBuilder,
    // private log: ApplogService,
    // private http: HttpClient, 
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CampaignTargetingPopupComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      const temporary = "[{\"key\":\"attachment_name\",\"title\":\"attachment_name\",\"label\":\"Attachment Name\",\"required\":true,\"order\":1,\"controlType\":\"dropdown\",\"type\":\"\",\"enum\":[{\"label\":\"Passport\",\"value\":\"passport\",\"disabled\":false},{\"label\":\"NRIC\",\"value\":\"nric\",\"disabled\":false},{\"label\":\"driving_license\",\"value\":\"Driving License\",\"disabled\":false}],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Attachment Name is required!\"},\"externalAPIPayload\":{},\"options\":[]},{\"key\":\"type\",\"title\":\"type\",\"label\":\"Type\",\"required\":true,\"order\":2,\"controlType\":\"textbox\",\"type\":\"\",\"enum\":[],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Type is required!\"},\"externalAPIPayload\":{},\"disabled\":false},{\"key\":\"attach\",\"title\":\"attach\",\"label\":\"Attach\",\"required\":true,\"order\":3,\"controlType\":\"textbox\",\"type\":\"\",\"enum\":[],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Attachment is required!\"},\"externalAPIPayload\":{},\"disabled\":false},{\"key\":\"notes\",\"title\":\"Notes\",\"label\":\"Notes\",\"required\":true,\"order\":4,\"controlType\":\"textbox\",\"type\":\"\",\"enum\":[],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Notes is required!\"},\"externalAPIPayload\":{},\"disabled\":false}]";
    }



  ngOnInit(): void {
  }

  ngAfterViewInit(){
    let input = document.createElement("button");
    //let row = document.createElement('div');  
    input.className = 'row';
    //row.innerHTML = `
    document.querySelector('#attach').appendChild(input);
  }

  openDialog() {
    const dialogRef = this.dialog.open(CampaignTargetingPopupComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  next(e){
    // this.log.debug("Inside Next :: ")
    }

  handleFileInput(files: FileList) {
}

valueChangeEvent(a,b){
}
onKeyUp(x){
}
openFile(){
  let element:HTMLElement = document.getElementById('fileUpload') as HTMLElement;
  element.click();
}
closeDialog() {
  console.log("this.campaignPopupForm :", this.campaignPopupForm);
  // let temp ={};
  // temp['campaignname'] = this.campaignPopupForm.controls.campaignname.value ;
  // temp['accountname'] = this.campaignPopupForm.controls.accountname.value ;
  // temp['billingaccno'] = this.campaignPopupForm.controls.billingaccno.value ;
  // temp['custstate'] = this.campaignPopupForm.controls.custstate.value ;
  // temp['mobileno'] = this.campaignPopupForm.controls.mobileno.value ;
  // temp['outletid'] = this.campaignPopupForm.controls.outletid.value ;
  // temp['arpu'] = this.campaignPopupForm.controls.arpu.value ;
  // console.log("temp :", temp);
  // this.inputFormArray.push(temp);
  this.inputFormArray = [{
    "campaignname" : this.campaignPopupForm.controls.campaignname.value,
    "accountname": this.campaignPopupForm.controls.accountname.value,
    "billingaccno": this.campaignPopupForm.controls.billingaccno.value,
    "custstate": this.campaignPopupForm.controls.custstate.value,
    "mobileno": this.campaignPopupForm.controls.mobileno.value,
    "outletid": this.campaignPopupForm.controls.outletid.value,
    "arpu": this.campaignPopupForm.controls.arpu.value,
  }];

  console.log("this.inputFormArray :", this.inputFormArray);
  this.dialogRef.close({ event: 'close', data: this.inputFormArray });
}
onNoClick(){
  this.dialogRef.close({ event: 'close', data: [] });
}
back(){
  this.dialogRef.close();
}
}