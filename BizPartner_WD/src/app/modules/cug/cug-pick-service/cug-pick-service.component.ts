import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cug-pick-service',
  templateUrl: './cug-pick-service.component.html',
  styleUrls: ['./cug-pick-service.component.scss']
})
export class CugPickServiceComponent implements OnInit {
  @ViewChild(MatPaginator) paginatorManual: MatPaginator;
  @ViewChild('fieldComponent', { read: ViewContainerRef })
  fieldComponent!: ViewContainerRef;
  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    this.paginatorManual = value;
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }
  dataSource = new MatTableDataSource<any>([]);
  checkboxFormArray: Array<any> = [];
  isSelected: boolean;
  isAll: boolean;
  proceedEnable: boolean;
  docsResponseDuplicate: any [];
  property: any[] = [
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
          "label": "0125454541",
          "value": "0125454541",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0125454542",
          "value": "0125454542",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0125454543",
          "value": "0125454543",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0125454544",
          "value": "0125454544",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0125454545",
          "value": "0125454545",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0158787871",
          "value": "0158787871",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0158787872",
          "value": "0158787872",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0158787873",
          "value": "0158787873",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0158787874",
          "value": "0158787874",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0158787875",
          "value": "0158787875",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0123333336",
          "value": "0123333336",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0123333337",
          "value": "0123333337",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0123333338",
          "value": "0123333338",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0123333339",
          "value": "0123333339",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0123333330",
          "value": "0123333330",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0192346531",
          "value": "0192346531",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0192346532",
          "value": "0192346532",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0192346533",
          "value": "0192346533",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0192346534",
          "value": "0192346534",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0192346535",
          "value": "0192346535",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0175543246",
          "value": "0175543246",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0175543247",
          "value": "0175543247",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0175543248",
          "value": "0175543248",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0175543249",
          "value": "0175543249",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0175543240",
          "value": "0175543240",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0132245641",
          "value": "0132245641",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0132245642",
          "value": "0132245642",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0132245643",
          "value": "0132245643",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0132245644",
          "value": "0132245644",
          "disabled": false,
          "isSelect": false
        },
        {
          "label": "0132245645",
          "value": "0132245645",
          "disabled": false,
          "isSelect": false
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
    this.docsResponseDuplicate = this.docsResponse[0].enum
    this.docsResponse = this.docsResponse[0].enum
   }

  ngOnInit(): void {
    this.proceedEnable = true;
    this.dataSource = new MatTableDataSource(this.docsResponseDuplicate);
  }

  previousPage() {
    this.location.back();
  }

  back(){
    this.router.navigate(['/cug/cugsearchcustomer']);
  }

  cancel(){
    this.router.navigate(['/home']);
  }

  next(input){
    // this.checkboxFormArray - input all in here
    this.router.navigate(['/cug/cuguploaddocument']);
  }

  onSearch(event){
    if(event.value){
      let searchResult;
      searchResult = this.docsResponse.filter(element => {
        return element.value === event.value;
      });
      this.docsResponseDuplicate = searchResult;
      this.dataSource = new MatTableDataSource(searchResult);
      this.dataSource.paginator = this.paginatorManual;
    }
    else {
      this.dataSource = new MatTableDataSource(this.docsResponse);
      this.dataSource.paginator = this.paginatorManual;
      this.docsResponseDuplicate = this.docsResponse;
    }
  }

  pageChangeEvent(event){
    let calcStart = (event.pageIndex) * 25;
    let calcEnd = (event.pageIndex + 1) * 25;
    this.docsResponseDuplicate = this.docsResponse.slice(calcStart, calcEnd);
  }

  onChange(checker:string, isChecked: boolean, checkAll: any){
    console.log("222 onAll docsResponseDuplicate B4 :", this.docsResponseDuplicate);
    console.log("222 onAll checkAll :", checkAll);
    console.log("222 onAll checker :", checker);

    if(isChecked) {
      this.checkboxFormArray.push(checker);

      this.docsResponseDuplicate.forEach(element =>{
        if (element.value === checkAll){
          element.isSelect = true;
        }
        return element;
      });

      if(!this.isAll && this.checkboxFormArray.length === this.docsResponseDuplicate.length){
        this.isAll = true;
      }
    } 
    else {
      let index = this.checkboxFormArray.indexOf(checker);
      this.checkboxFormArray.splice(index,1);

      this.docsResponseDuplicate.forEach(element =>{
        if (element.value === checkAll){
          element.isSelect = false;
        }
        return element;
      });

      if(this.isAll && this.checkboxFormArray.length !== this.docsResponseDuplicate.length){
        this.isAll = false;
      }
    }

    this.proceedEnable = this.checkboxFormArray.length > 0 ? false : true;
    console.log("222 checkboxFormArray :", this.checkboxFormArray);
    console.log("222 onAll docsResponseDuplicate AFTER :", this.docsResponseDuplicate);  
  }

  onAll(checker:any, isChecked: boolean, checkerAll: any){
    console.log("222 onAll checker :", checker);
    console.log("222 onAll checkerAll :", checkerAll);
    let temp = checkerAll[0];
    console.log("222 onAll temp :", temp);
    if (isChecked){
      console.log("222 onAll checked");
      if (this.checkboxFormArray.length > 0){
        for (let i=0;i<temp.length; i++){
          let index = this.checkboxFormArray.indexOf(temp[i]);
          this.checkboxFormArray.splice(index,1);
        }
      }

      console.log("222 onAll docsResponseDuplicate B4 :", this.docsResponseDuplicate);
      for (let i=0;i<temp.length; i++){
        this.checkboxFormArray.push(temp[i]);
        this.docsResponseDuplicate.forEach(element =>{
          if (element.value === temp[i].value){
            element.isSelect = true;
          }
          return element;
        });
      }
      console.log("222 onAll docsResponseDuplicate AFTER :", this.docsResponseDuplicate);

      this.isAll = true;
    }
    else {
      console.log("222 onAll UNchecked");
      console.log("222 onAll docsResponseDuplicate B4 :", this.docsResponseDuplicate);
      for (let i=0;i<temp.length; i++){
        let index = this.checkboxFormArray.indexOf(temp[i]);
        this.checkboxFormArray.splice(index,1);

        this.docsResponseDuplicate.forEach(element =>{
          // console.log("222 element :", element);
          // console.log("222 element checker[i] :", checkerAll[i].value);
          if (element.value === temp[i].value){
            element.isSelect = false;
          }
          return element;
        });
      }
      console.log("222 onAll docsResponseDuplicate AFTER :", this.docsResponseDuplicate);

      this.isAll = false;
    }
    console.log("222 checkboxFormArray :", this.checkboxFormArray);
  }

}
