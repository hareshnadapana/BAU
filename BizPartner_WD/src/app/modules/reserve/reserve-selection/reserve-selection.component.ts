import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { endPoint } from '../../../URL';
import { forkJoin } from 'rxjs';
import { Location } from '@angular/common';
import { loadingFalse, loadingTrue } from 'app/root-store.actions';
import { Store } from '@ngrx/store';
import * as CommonStoreSelectors from 'app/root-store.selectors';
import { reserveStatus } from 'app/root-store.actions';
import CryptoJS from 'crypto-js';
import * as moment from 'moment';

@Component({
  selector: 'app-reserve-selection',
  templateUrl: './reserve-selection.component.html',
  styleUrls: ['./reserve-selection.component.scss']
})
export class ReserveSelectionComponent implements OnInit {
  @ViewChild(MatPaginator) paginatorManual: MatPaginator;
  @ViewChild('fieldComponent', { read: ViewContainerRef })
  fieldComponent!: ViewContainerRef;
  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    this.paginatorManual = value;
    if (this.dataSource && !this.ReserveSelectionForm.get('search').value) {
      this.dataSource.paginator = value;
      this.pageChangeEvent(value);
    }
  }
  ReserveSelectionForm:FormGroup = this.builder.group({
    search: [, { validators: [Validators.required], updateOn: "change"}],
    region: [, { validators: [Validators.required], updateOn: "change"}]
  })
  dataSource = new MatTableDataSource<any>([]);
  checkboxFormArray: Array<any> = [];
  isSelected: boolean;
  isAll: boolean;
  reserveEnable: boolean;
  docsResponseDuplicate: any [];
  ReserveNumberData: any;
  outletIDApi: any;
  ReserveNumberDummyList: any[] = [
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
      "label": "0178787871",
      "value": "0178787871",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0178787872",
      "value": "0178787872",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0178787873",
      "value": "0178787873",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0178787874",
      "value": "0178787874",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0178787875",
      "value": "0178787875",
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
      "label": "0112346531",
      "value": "0112346531",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0112346532",
      "value": "0112346532",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0112346533",
      "value": "0112346533",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0112346534",
      "value": "0112346534",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0112346535",
      "value": "0112346535",
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
      "label": "0152245641",
      "value": "0152245641",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0152245642",
      "value": "0152245642",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0152245643",
      "value": "0152245643",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0152245644",
      "value": "0152245644",
      "disabled": false,
      "isSelect": false
    },
    {
      "label": "0152245645",
      "value": "0152245645",
      "disabled": false,
      "isSelect": false
    }
  ];
  oriList: any[];
  duplicateList: any[];
  doubleCol: boolean;
  noDataFlag: boolean;
  fourCol: boolean = false;
  reserveOutletID: any;
    
  constructor(private router:Router, private builder: FormBuilder, private location: Location, private http: HttpClient, private store: Store) {}

  ngOnInit(): void {
    // this.duplicateList = this.ReserveNumberDummyList;                // MOCK ONLY
    // this.oriList = this.ReserveNumberDummyList                       // MOCK ONLY
    // this.dataSource = new MatTableDataSource(this.duplicateList);    // MOCK ONLY
    this.reserveEnable = true;
    this.doubleCol = false;
    this.isAll = false;
    this.store.select(CommonStoreSelectors.reserveNumberResp).subscribe(result => {
      console.log("FFF Result reserveNumberData DD :", result)
      const testData = [];
      if (result){
        let obj = {}
        // this.duplicateList = result;
        // console.log("FFF this.duplicateList :",this.duplicateList)
        result.forEach(element =>{
          obj = { ...element, value: element.xtn, isSelect: false }
          console.log("FFF forEach in :", element);
          testData.push(obj);
        });
        // console.log("FFF forEach out :", testData);
        // this.duplicateList = testData;
        this.noDataFlag = false;
      }
      else {
        console.log("FFF OUT");
        this.noDataFlag = true;
      }
      this.duplicateList = testData;
      this.oriList = testData;
    this.dataSource = new MatTableDataSource(this.oriList);
    });

    this.store.select(CommonStoreSelectors.reserveNumberData).subscribe(result => {
      if (result){
        this.reserveOutletID = result.outletID
      }
    });
  }

  backReserve(){
    this.router.navigate(['/check/reservenumber']);
  }

  next(input){
    this.store.dispatch(loadingTrue());
    const sessionData = sessionStorage.getItem('userData');
    if (sessionData) {
      const decrypted = CryptoJS.AES.decrypt(sessionData, '01234567890112').toString(CryptoJS.enc.Utf8);
      const decryptedJson = JSON.parse(decrypted);
      this.outletIDApi = decryptedJson.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].outletId
    }
    let msisdn = this.checkboxFormArray;
    let temp = [];
    msisdn.forEach((item, key) => {
      Object.keys(item).forEach(function(key) {
        if (key === 'value'){
          let tempo = item[key];
          temp.push(tempo);
        }
      });
    });
    
    var date = new Date();
    // console.log("date today :", date);
    const formatDate = "YYYY/MM/DD HH:mm:ss";
    const formatDatetwo = "YYYYMMDD_HHmmss";
    let newdate = moment(date).format(formatDate);
    let newdatetwo = moment(date).format(formatDatetwo);
    // console.log("date newDate :", newdate);
    // console.log("date newDatetwo :", newdatetwo);
    var dateEnd = date.setDate(date.getDate() + 15);
    // console.log("date dateEnd :", new Date(dateEnd));
    let dateEndFormatted = moment(dateEnd).format(formatDate);
    // console.log("date dateEndFormatted :", dateEndFormatted);

    // "outletId": "NTH55304"
    const payload = {
      "requestBody": {
          "endDate": dateEndFormatted,
          "limit": "50000",
          "limitBy": "Outlet",
          "msisdnList": {
            "msisdn": temp
          },
          // "outletId": "10000",
          "outletId": this.reserveOutletID ? this.reserveOutletID : "",
          "startDate": newdate,
          "timeStamp": "",
          "userId": "S001932303"
      },
      "requestHeader": {
          "eventName": "ECRMAssignNumbersToStore",
          "sourceSystem": "BizPartner",
          "transDateTime": newdatetwo
      }
    }
    let reserveNumberCall = this.http.post<any>(endPoint.getSubmitReserveNumber, payload);
    forkJoin([reserveNumberCall]).subscribe(results => {
      this.store.dispatch(loadingFalse());
      this.ReserveNumberData = results[0];
      if (results[0].responseBody.resultCode === "Success"){
        this.store.dispatch(reserveStatus({ payload: true }));
        this.router.navigate(['/check/reservestatus']);
      } else {
        this.store.dispatch(reserveStatus({ payload: false }));
        this.router.navigate(['/check/reservestatus']);
      }
    });
  }

  onSearch(){
    if(this.ReserveSelectionForm.get('search').value){
      let searchResult;
      searchResult = this.oriList.filter(element => {
        return element.value === this.ReserveSelectionForm.get('search').value;
      });
      this.duplicateList = searchResult;
      this.dataSource = new MatTableDataSource(searchResult);
      this.dataSource.paginator = this.paginatorManual;
    }
    else {
      this.dataSource = new MatTableDataSource(this.oriList);
      this.dataSource.paginator = this.paginatorManual;
      this.duplicateList = this.oriList;
    }
  }

  pageChangeEvent(event){
    // console.log("pageChangeEvent :", event);
    // let calcStart = (event.pageIndex) * 25;
    // let calcEnd = (event.pageIndex + 1) * 25;
    // this.duplicateList = this.ReserveNumberDummyList.slice(calcStart, calcEnd);

    // console.log("pageChangeEvent :", event);
    let calcStart = (event.pageIndex) * event.pageSize;
    let calcEnd = (event.pageIndex + 1) * event.pageSize;
    // this.duplicateList = this.ReserveNumberDummyList.slice(calcStart, this.oriList.length); // FOR MOCK
    this.duplicateList = this.oriList.slice(calcStart, calcEnd); // FOR MOCK

    if(event.pageSize > 25){
      this.doubleCol = true;
      if(event.pageSize > 50){
        this.fourCol = true;
      }
    } else {
      this.doubleCol = false;
      this.fourCol = false;
    }
  }

  onChange(checker:string, isChecked: boolean, checkAll: any){
    if(isChecked) {
      this.checkboxFormArray.push(checker);

      this.duplicateList.forEach(element =>{
        if (element.value === checkAll){
          element.isSelect = true;
        }
        return element;
      });

      if(!this.isAll && this.checkboxFormArray.length === this.duplicateList.length){
        this.isAll = true;
      }
    } 
    else {
      let index = this.checkboxFormArray.indexOf(checker);
      this.checkboxFormArray.splice(index,1);

      this.duplicateList.forEach(element =>{
        if (element.value === checkAll){
          element.isSelect = false;
        }
        return element;
      });

      if(this.isAll && this.checkboxFormArray.length !== this.duplicateList.length){
        this.isAll = false;
      }
    }
    this.reserveEnable = this.checkboxFormArray.length > 0? false : true;
  }

  onAll(checker:string, isChecked: boolean, checkerAll: any){
    let temp = checkerAll[0];
    if (isChecked){
      if (this.checkboxFormArray.length > 0){
        for (let i=0;i<temp.length; i++){
          let index = this.checkboxFormArray.indexOf(temp[i]);
          this.checkboxFormArray.splice(index,1);
        }
      }

      for (let i=0;i<temp.length; i++){
        this.checkboxFormArray.push(temp[i]);
        this.duplicateList.forEach(element =>{
          if (element.value === temp[i].value){
            element.isSelect = true;
          }
          return element;
        });
      }
      this.isAll = true;
    }
    else {
      for (let i=0;i<temp.length; i++){
        let index = this.checkboxFormArray.indexOf(temp[i]);
        this.checkboxFormArray.splice(index,1);

        this.duplicateList.forEach(element =>{
          if (element.value === temp[i].value){
            element.isSelect = false;
          }
          return element;
        });
      }
      this.isAll = false;
    }
    this.reserveEnable = this.checkboxFormArray.length > 0? false : true;
  }
}
