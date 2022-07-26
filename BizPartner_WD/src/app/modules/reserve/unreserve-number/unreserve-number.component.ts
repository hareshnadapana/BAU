import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { currentEnv, endPoint, urlNav } from 'app/URL';
import { forkJoin } from 'rxjs';
import { loadingFalse, loadingTrue } from 'app/root-store.actions';
import { result, values } from 'lodash';
import { Store } from '@ngrx/store';
import * as CommonStoreSelectors from 'app/root-store.selectors';
import { unreserveStatus } from 'app/root-store.actions';
import CryptoJS from 'crypto-js';
import _ from 'lodash';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-unreserve-selection',
  templateUrl: './unreserve-number.component.html',
  styleUrls: ['./unreserve-number.component.scss']
})
export class UnreserveNumberComponent implements OnInit {
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
  UnreserveNumberForm:FormGroup = this.builder.group({
    search: [, { updateOn: "change" }],
  })
  displayedDocumentColumns: string[] = ['tick', 'msisdn', 'outletid', 'userid', 'startDate', 'endDate'];
  checkboxFormArray: Array<any> = [];
  checkboxFormState: Array<any> = [];
  isAll: boolean;
  isSelected: boolean;
  unreserveEnable: boolean;
  docsResponseDuplicate: any[];
  dataSource : MatTableDataSource<any>;
  UnreserveNumberData: any;
  UnreserveNumberList: any;
  outletIDApi: any;
  isAdmin : boolean;
  isSelecteded : boolean = false;
  outletEnum: any[];
  UnreserveDummyData: any[] = [
    {
      "numberlist": "0125454545",
      "outletId": "99974",
      "reservedDate": "11/01/2022 03:14:32",
      "releaseDate": "14/02/2022 01:14:35",
      "isSelect": false
    },
    {
      "numberlist": "0147878784",
      "outletId": "99974",
      "reservedDate": "11/01/2022 03:14:32",
      "releaseDate": "14/02/2022 01:14:35",
      "isSelect": false
    },
    {
      "numberlist": "0164578457",
      "outletId": "99974",
      "reservedDate": "11/01/2022 03:14:32",
      "releaseDate": "14/02/2022 01:14:35",
      "isSelect": false
    },
    {
      "numberlist": "0123434343",
      "outletId": "99974",
      "reservedDate": "11/01/2022 03:14:32",
      "releaseDate": "14/02/2022 01:14:35",
      "isSelect": false
    },
    {
      "numberlist": "014784354",
      "outletId": "99974",
      "reservedDate": "11/01/2022 03:14:32",
      "releaseDate": "14/02/2022 01:14:35",
      "isSelect": false
    },
    {
      "numberlist": "0132245362",
      "outletId": "99974",
      "reservedDate": "11/01/2022 03:14:32",
      "releaseDate": "14/02/2022 01:14:35",
      "isSelect": false
    },
    {
      "numberlist": "0162675346",
      "outletId": "99974",
      "reservedDate": "11/01/2022 03:14:32",
      "releaseDate": "14/02/2022 01:14:35",
      "isSelect": false
    },
    {
      "numberlist": "0194426485",
      "outletId": "99974",
      "reservedDate": "11/01/2022 03:14:32",
      "releaseDate": "14/02/2022 01:14:35",
      "isSelect": false
    }
  ]
  dropdownList: any[] = [
    {
      "title": "Select Outlet ID",
      "enum": [
        // {
        //   "label": "10000",
        //   "value": "10000"
        // },
        // {
        //   "label": "12140",
        //   "value": "12140"
        // },
        // {
        //   "label": "30000",
        //   "value": "30000"
        // }
      ]
    }]

  constructor(private router:Router, private http: HttpClient, private builder: FormBuilder, private store: Store, public datepipe: DatePipe,) {}

  async ngOnInit() {
    this.store.dispatch(loadingTrue());
    const stats = await this.getAdminStatus();
    if (stats){
      if (!this.isAdmin){
        const dataRetrieved = await this.getDealerRetrieval();
        console.log("this.isAdmin 2 :", this.isAdmin);
        if (dataRetrieved){
          this.isAdmin = false;

          this.unreserveEnable = true;
          this.isAll = false;

          const payload = {
            "position": "Dealer Owner",
            "userId": "950480"
            // "position": "Supervisor",
            // "userId": "S0003932390"
          }
          let listID = [];
          this.http.post<any>(endPoint.getUserHierarchyCW, payload).subscribe(results => {
            let outletList = results.orderHistory;
              outletList.forEach(element => {
              let idList = {
                label : element.outletId,
                value : element.outletId
              };
              listID.push(idList);
              // <mat-option *ngFor="let op of outletIDApi" [value]="op.value"> 69 no. line html
            });
            this.setDropdownList(listID);
          });
          await this.retrieveList(this.outletIDApi);
        }
      }
    }
  }

  getAdminStatus(){
    return new Promise((resolve, reject) => {
      const getStatus = localStorage.getItem("isAdmin");
      this.isAdmin = getStatus ? true : false;
      resolve(true);
    })
  }

  setDropdownList(data){
    if (data !== null){
      this.outletEnum = [];
      data.forEach(element =>{
        element.label = element.label.replace(/\D/g,'');
        element.value = element.value.replace(/\D/g,'');
        this.outletEnum.push(element);
      });
    } else {
      let idNumbersOnly = this.outletIDApi.replace(/\D/g,'');
      this.outletEnum = [
        {
          "value": idNumbersOnly,
          "label": idNumbersOnly
        }
      ];
    }
  }

  getDealerRetrieval() {
    return new Promise((resolve, reject) => {
    this.store.dispatch(loadingTrue());
      const sessionData = sessionStorage.getItem('userData');
      if (sessionData){
        const decrypted = CryptoJS.AES.decrypt(sessionData, '01234567890112').toString(CryptoJS.enc.Utf8);
        const decryptedJson = JSON.parse(decrypted);
        this.outletIDApi = decryptedJson.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].listOfChannelPartner.channelPartner[0].outletId
        this.setDropdownList(null);
        const payload = {
          username:decryptedJson? decryptedJson.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].loginName : ""
        }
        this.http.post<any>(endPoint.getCustStatus, payload).subscribe(result => {
            if (result) {
              console.log("this.isAdmin result dealer status :", result);
              this.store.dispatch(loadingFalse());
              if (result.status === "Valid"){
                this.isAdmin = true;
                // this.isAdmin = false;
              }
              else {
                this.isAdmin = false;
              }
            }
          }, (error => {
            console.error(error);
            this.store.dispatch(loadingFalse());
          }))
      }
    resolve(true);
  })
  }

  back(){
    window.location.href = `${currentEnv}${urlNav.frontofficehome}`;
  }

  async retrieveList(useId){
  return new Promise(async (resolve, reject) => {
    const payload = {
      "requestBody": {
        "actionCode": "QueryByOutletId",
        // "outletId": "SWK50034",
        "outletId": useId,
        "userId": "S001932303"
      }
    }
    const testData = await this.retrieveListAPI(payload);
    resolve(true);
  })
  }

  retrieveListAPI(payload){
    return new Promise((resolve, reject) => {
    this.http.post<any>(endPoint.getUnreserveNumberList, payload).subscribe(results => {
      let obj = [];
      if (results.responseBody.msisdnList.length > 1){
        const testFx = (data, type) => {
          if (!data) return;
          const result = data.split(" ");
          console.log("Test Data :", result);
          return result[0];
        }
        for (let i=0; i < results.responseBody.msisdnList.length; i++){
          obj.push({
            endDate: testFx(results.responseBody.msisdnList[i].endDate, 'split'),
            isSelect: false,
            msisdn: results.responseBody.msisdnList[i].msisdn,
            outletId: results.responseBody.msisdnList[i].outletId,
            startDate: testFx(results.responseBody.msisdnList[i].startDate, 'split'),
            userId: results.responseBody.msisdnList[i].userId
          });
        }
      }
      else {
      if (results.responseBody.msisdnList && results.responseBody.msisdnList.length !== 0){
        const testFunction = (data, type) => {
          if (!data) return;
          const test = data.split(" ");
          if (type === 'onlysplit') return test;
          else return _.filter(data.split(' ').join(',').split(','), function(o) {return _.includes(o, '/')});
        }
        let msisdnList, outletIdList, startDateList, endDateList, userIDList;
        msisdnList = testFunction(results.responseBody.msisdnList[0].msisdn, 'onlysplit');
        outletIdList = testFunction(results.responseBody.msisdnList[0].outletId, 'onlysplit');
        userIDList = testFunction(results.responseBody.msisdnList[0].userId, 'onlysplit');
        startDateList = testFunction(results.responseBody.msisdnList[0].startDate, 'startdate');
        endDateList = testFunction(results.responseBody.msisdnList[0].endDate, 'enddate');

        if (msisdnList !== undefined) {
          for (let i=0; i < msisdnList.length; i++){
            obj.push({
              endDate: endDateList[i],
              isSelect: false,
              msisdn: msisdnList[i],
              outletId: outletIdList[i],
              startDate: startDateList[i],
              userId: userIDList[i]
            });
          }
        }
      }
      else {
        obj = [];
      }
    }

      this.dataSource = new MatTableDataSource(obj);
      this.store.dispatch(loadingFalse());
      resolve(obj)
    }, (error => {
      console.error(error);
      this.store.dispatch(loadingFalse());
    }));
  })
  }

  next(){
    this.store.dispatch(loadingTrue());
    const todayDate = new Date();
    const todayDateTransformed = this.datepipe.transform(todayDate, 'MM/dd/yyyy')
    let payloadArray = [];
    let outletIDMain;
    this.checkboxFormArray.forEach((item, index)=> {
      payloadArray[index] = {
        "xenddate": null,
        "xnumbercategory": null,
        "xregion": null,
        "xremark": null,
        "xreservationstatus": null,
        "xreservationstatusreason": null,
        "xstartdate": null,
        "xtn": item.msisdn
      };
      outletIDMain = outletIDMain? outletIDMain : item.outletId;
    })

    const payload = {
      "requestBody": {
        "xmsisdnlist": {
          "xmsisdn": payloadArray
        },
        "xoutletid": outletIDMain
        // "xoutletid": "10000"
      },
      "requestHeader": {
        "eventName": "ECRMSPUnreserveNumbers",
        "sourceSystem": "Sales Portal",
        "transDateTime": todayDateTransformed
      }
    }
    this.http.post<any>(endPoint.getSubmitUnreserveNumber, payload).subscribe(results => {
      if (results.responseHeader.statusCode === "OK") {
        this.store.dispatch(loadingFalse());
        this.store.dispatch(unreserveStatus({ payload: true }));
        this.router.navigate(['/check/unreservestatus'])
      }
      else {
        this.store.dispatch(loadingFalse());
        this.store.dispatch(unreserveStatus({ payload: false }));
        this.router.navigate(['/check/unreservestatus'])
      }
    }, (error => {
      console.error(error);
      this.store.dispatch(loadingFalse());
    }));
  }

  async idSelect(event){
    this.dataSource = new MatTableDataSource([]);
    this.isSelecteded = true;
    this.store.dispatch(loadingTrue());
      const done = await this.retrieveList(event);
      // if (done){
        this.store.dispatch(loadingFalse());
      // }
  }

  onSearch(){
    if(this.UnreserveNumberForm.get('search').value){
      let searchResult;
      searchResult = this.UnreserveDummyData.filter(element => {
        return element.msisdn === this.UnreserveNumberForm.get('search').value;
      });
      this.dataSource = new MatTableDataSource(searchResult);
      this.dataSource.paginator = this.paginatorManual;
    }
    else {
      // this.UnreserveDummyData = this.docsResponse;
      this.dataSource = new MatTableDataSource(this.UnreserveDummyData);
      this.dataSource.paginator = this.paginatorManual;
    }
  }

  pageChangeEvent(event){
    console.log("next page event :", event);
  }

  onChange(checker:string, isChecked: boolean, checkerAll: any){
    if(isChecked) {
      this.checkboxFormArray.push(checker);

      this.UnreserveDummyData.forEach(element =>{
        if (element.msisdn === checkerAll){
          element.isSelect = true;
        }
        return element;
      });

      if(!this.isAll && this.checkboxFormArray.length === this.UnreserveDummyData.length){
        this.isAll = true;
      }
    } 
    else {
      let index = this.checkboxFormArray.indexOf(checker);
      this.checkboxFormArray.splice(index,1);

      this.UnreserveDummyData.forEach(element =>{
        if (element.msisdn === checkerAll){
          element.isSelect = false;
        }
        return element;
      });

      if(this.isAll && this.checkboxFormArray.length !== this.UnreserveDummyData.length){
        this.isAll = false;
      }
    }
    this.unreserveEnable = this.checkboxFormArray.length > 0 ? false : true;
  }

  onAll(checker:string, isChecked: boolean, checkerAll: any){
    if (isChecked){
      if (this.checkboxFormArray.length > 0){
        for (let i=0;i<checker.length; i++){
          let index = this.checkboxFormArray.indexOf(checker[i]);
          this.checkboxFormArray.splice(index,1);
        }
      }

      for (let i=0;i<checker.length; i++){
        this.checkboxFormArray.push(checker[i]);
        this.UnreserveDummyData.forEach(element =>{
          // console.log("222 element :", element);
          // console.log("222 element checker[i] :", checkerAll[i].msisdn);
          if (element.msisdn === checkerAll[i].msisdn){
            element.isSelect = true;
          }
          return element;
        });
      }
      this.isAll = true;
    }
    else {
      for (let i=0;i<checker.length; i++){
        let index = this.checkboxFormArray.indexOf(checker[i]);
        this.checkboxFormArray.splice(index,1);

        this.UnreserveDummyData.forEach(element =>{
          // console.log("222 element :", element);
          // console.log("222 element checker[i] :", checkerAll[i].msisdn);
          if (element.msisdn === checkerAll[i].msisdn){
            element.isSelect = false;
          }
          return element;
        });
      }
      this.isAll = false;
    }
    this.unreserveEnable = this.checkboxFormArray.length > 0 ? false : true;
}

}
