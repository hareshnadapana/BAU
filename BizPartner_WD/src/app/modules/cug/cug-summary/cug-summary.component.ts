import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cug-summary',
  templateUrl: './cug-summary.component.html',
  styleUrls: ['./cug-summary.component.scss']
})
export class CugSummaryComponent implements OnInit {
  displayedDocumentColumns: string[] = ['sequence', 'customerName', 'customerId', 'msisdn', 'cugId', 'plan'];
  checkboxFormArray: Array<any> = [];
  isSelected: boolean;
  unreserveEnable: boolean;
  @Input() property: any[] = [
    {
      "key": "search",
      "title": "Search",
      "label": "Search",
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
        "pattern": "",
        "required": false
      },
      "error": {
        "pattern": "",
        "required": ""
      },
      "externalAPIPayload": {}
    },
  ]
  docsResponse: any[] = [
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
          "sequence": "1",
          "customerName": "John Smith",
          "customerId": "ABC12345",
          "msisdn": "0177773343",
          "cugId": "200054",
          "plan": "First Gold Plus for Business",
        },
        
       
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
    }
  ]
    
  constructor(private router:Router, private location: Location) { 
    this.docsResponse = this.docsResponse[0].enum;
  }

  ngOnInit(): void {
    this.unreserveEnable = true;
  }

  previousPage() {
    this.location.back();
  }

  back(){
    this.router.navigate(['/miscellaneous']);
  }

  searchCustomer(){
    this.router.navigate(['/cug/cugsearchcustomer']);
  }

  pickService(){
    this.router.navigate(['/cug/cugpickservice']);
  }

  uploadDocument(){
    this.router.navigate(['/cug/cuguploaddocument']);
  }

  next(){
    console.log("next");
    // console.log("next event :", input.value);
    this.router.navigate(['/cug/cugstatus']);
  }

  cancel(){
    this.router.navigate(['/home']);
  }

  onSearch(event){
    console.log("onSearch event.value :", event.value)
  }

  onChange(checker:string, isChecked: boolean){
    if(isChecked) {
      console.log("TTT checker :", checker);
      console.log("TTT isChecked :", isChecked);
      let count = checker.length;
      if(count > 1){
        this.isSelected=true;
        for (let i=0;i<count; i++){
          this.checkboxFormArray.push(checker[i]);
        }
      }
      else {
        this.checkboxFormArray.push(checker);
      }
    } else {
      if(checker.length > 1){
        let count = checker.length;
        let arrayCount = [];
        for (let i=0;i<count; i++){
          console.log("TTT in Select False");
          this.isSelected=false;
          let index = this.checkboxFormArray.indexOf(checker[i]);
          this.checkboxFormArray.splice(index,1);
        }
      }
      else {
        let index = this.checkboxFormArray.indexOf(checker);
        this.checkboxFormArray.splice(index,1);
      }
    }

    this.unreserveEnable = this.checkboxFormArray.length > 0 ? false : true;
    console.log("TTT checkboxFormArray :", this.checkboxFormArray)
    console.log("TTT unreserveEnable :", this.unreserveEnable)
  }

}
