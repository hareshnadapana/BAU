import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { CugPickServiceComponent } from '../cug-pick-service/cug-pick-service.component';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cug-search-customer',
  templateUrl: './cug-search-customer.component.html',
  styleUrls: ['./cug-search-customer.component.scss']
})
export class CugSearchCustomerComponent implements OnInit {

  CugSearchForm:FormGroup = this.builder.group({
    user_type: [, { validators: [Validators.required], updateOn: "change"}],
    customer_id_type: [, { validators: [Validators.required], updateOn: "change"}],
    customer_id_number: [, { validators: [Validators.required], updateOn: "change"}],
    service_number: [, { validators: [Validators.required], updateOn: "change"}]
  })
  // // @Input() property: PropertyBase<string>;
  property: any[] = [
      {
        "key": "user_type",
        "title": "User Type",
        "label": "User Type",
        "required": true,
        "value": "",
        "order": 1,
        "controlType": "dropdown",
        "type": "",
        "enum": [
          {
            "label": "Customer",
            "value": "Customer",
            "disabled": false
          },
          {
            "label": "Service Selection",
            "value": "Service Selection",
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
          "required": "User Type is required!"
        },
        "externalAPIPayload": {},
        "options": []
      },
      {
        "key": "customer_id_type",
        "title": "Customer ID Type",
        "label": "Customer ID Type",
        "required": true,
        "order": 2,
        "disable": false,
        "controlType": "dropdown",
        "type": "",
        "enum": [
        
          {
            "label": "BRN",
            "value": "BRN",
            "disabled": false
          },
          {
            "label": "Customer ID",
            "value": "Customer ID",
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
          "required": "Customer ID Type is required!"
        },
        "externalAPIPayload": {},
        "options": []
      },
      {
        "key": "customer_id_number",
        "title": "Customer ID Number",
        "label": "Customer ID Number",
        "required": false,
        "order": 3,
        "controlType": "textbox",
        "disable": false,
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
          "required": true,
          
        },
        "error": {
          "pattern": "",
          "required": "Customer ID Number is required!"
        },
        "externalAPIPayload": {}
      },
      {
        "key": "service_number",
        "title": "Service Number",
        "label": "Service Number",
        "required": false,
        "order": 4,
        "controlType": "textbox",
        "disable": false,
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
          "required": true
        },
        "error": {
          "pattern": "",
          "required": "Service Number is required!"
        },
        "externalAPIPayload": {}
      },
      {
        "key": "ContinuetoCaptureAddress",
        "title": "Continue",
        "label": "Continue",
        "required": false,
        "order": 5,
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

  userTypeChoice: any[] = [
    { label: 'Customer', value: 'Customer'},
    { label: 'Service Selection', value: 'Service Selection'},
    
  ]

  customerIdTypeChoice: any[] = [
    { label: 'BRN', value: 'BRN'},
    { label: 'Customer ID', value: 'Customer ID'},
    
  ]
    
    
  requiredCheck0 = new FormControl('', [Validators.required]);
  requiredCheck1 = new FormControl('', [Validators.required]);
  requiredCheck2 = new FormControl('', [Validators.required]);
  requiredCheck3 = new FormControl('', [Validators.required]);
  requiredCheck4 = new FormControl('', [Validators.required]);
  requiredCheck5 = new FormControl('', [Validators.required]);
  formType: any;
    
  constructor(private router:Router, private builder:FormBuilder, private location: Location) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {

  }

  previousPage() {
    this.location.back();
  }

  back(){
    // console.log("back event :", event);
    this.router.navigate(['/dashboard/dealer']);
  }

  next(event){
    console.log("this.CugSearchForm", this.CugSearchForm);
    // console.log("next event :", event.value);
    this.router.navigate(['/cug/cugpickservice']);
  }

  cancel(){
    this.router.navigate(['/dashboard/dealer']);
  }

  formDisableOnChange(event) {
    if (event.value == 'Customer') {
      this.formType="Customer"
    } else if (event.value == 'Service Selection') { 
      this.formType="Service Selection"
    }
  }

  getDropdownErrorMessage(val) {
    const temp = this.CugSearchForm.get(val)

    if (temp.hasError('required') && val === "user_type") {
      return 'User Type is required';
    } else if (temp.hasError('required') && val === "customer_id_type") {
      return 'Customer ID Type is required';
    } else if (temp.hasError('required') && val === "customer_id_number") {
      return 'Customer ID Number is required';
    } else if (temp.hasError('required') && val === "service_number") {
      return 'Service Number is required';
    }
  }
}

