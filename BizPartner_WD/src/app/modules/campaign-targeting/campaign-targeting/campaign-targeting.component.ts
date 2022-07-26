import { Component, OnInit, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {MatDialog} from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { currentEnv, endPoint, urlNav } from 'app/URL';
import { HttpClient } from "@angular/common/http";
import { CampaignTargetingPopupComponent } from '../campaign-targeting-popup/campaign-targeting-popup.component';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { loadingFalse, loadingTrue } from 'app/root-store.actions';
import _ from 'lodash';
import { animate, state, style, transition, trigger } from '@angular/animations';
import CryptoJS from 'crypto-js';
import * as moment from 'moment';

@Component({
  selector: 'app-campaign-targeting',
  templateUrl: './campaign-targeting.component.html',
  styleUrls: ['./campaign-targeting.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(500)
      ]),
    ])
  ]
})
export class CampaignTargetingComponent implements OnInit {
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
  displayedDocumentColumns: string[] = ['tick', 'campaignname', 'accountname', 'billingaccountnumber', 'customerstate', 'mobilenumber', 'outletid', 'expirydate', 'arpu'];
  checkboxFormArray: Array<any> = [];
  checkboxFormState: Array<any> = [];
  isAll: boolean;
  isSelected: boolean;
  isBubble: boolean;
  unreserveEnable: boolean;
  docsResponseDuplicate: any[];
  dataSource : MatTableDataSource<any>;
  campaignData : any;
  apiList : any;
  apiResp : any;
  isAdmin : boolean;
  isMock : boolean;
  indentPagination: boolean;
  showNotification: boolean = false;
  errorStatus: boolean = false;
  popUpNotiy: boolean = false;
  notificationData: string;
  dealerRetrievalUsername: string = "";
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
      "key": "data",
      "title": "data",
      "label": "data",
      "required": true,
      "order": 1,
      "controlType": "dropdown",
      "type": "",
      "enum": [
        {
          "campaignname": "Retention Campaign",
          "accountname": "Omni 360 Customer 1",
          "billingaccountnumber": "123456789",
          "customerstate": "KL",
          "mobilenumber": "1111111111",
          "outletid": "CKL57181",
          "expirydate": "12/12/2024",
          "arpu": 20,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "Omni 360 Customer 2",
          "billingaccountnumber": "123456790",
          "customerstate": "KL",
          "mobilenumber": "1111111112",
          "outletid": "CKL57181",
          "expirydate": "12/12/2024",
          "arpu": 20,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "Omni 360 Customer 3",
          "billingaccountnumber": "123456791",
          "customerstate": "KL",
          "mobilenumber": "1111111113",
          "outletid": "CKL57181",
          "expirydate": "12/12/2024",
          "arpu": 20,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "Omni 360 Customer 4",
          "billingaccountnumber": "123456792",
          "customerstate": "KL",
          "mobilenumber": "1111111114",
          "outletid": "CKL57181",
          "expirydate": "12/12/2024",
          "arpu": 20,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "Omni 360 Customer 5",
          "billingaccountnumber": "123456793",
          "customerstate": "KL",
          "mobilenumber": "1111111115",
          "outletid": "CKL57181",
          "expirydate": "12/12/2024",
          "arpu": 20,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "TopDeal Customer 1",
          "billingaccountnumber": "987654321",
          "outletid": "987654321",
          "expirydate": "12/12/2024",
          "customerstate": "Selangor",
          "mobilenumber": "1111111100",
          "arpu": 10,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "TopDeal Customer 2",
          "billingaccountnumber": "987654322",
          "outletid": "987654322",
          "expirydate": "12/12/2024",
          "mobilenumber": "1111111101",
          "customerstate": "Selangor",
          "arpu": 10,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "TopDeal Customer 3",
          "billingaccountnumber": "987654323",
          "outletid": "987654323",
          "expirydate": "12/12/2024",
          "mobilenumber": "1111111102",
          "customerstate": "Selangor",
          "arpu": 10,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "TopDeal Customer 4",
          "billingaccountnumber": "987654324",
          "outletid": "987654324",
          "expirydate": "12/12/2024",
          "mobilenumber": "1111111103",
          "customerstate": "Selangor",
          "arpu": 10,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "TopDeal Customer 5",
          "billingaccountnumber": "987654325",
          "outletid": "987654325",
          "expirydate": "12/12/2024",
          "mobilenumber": "1111111104",
          "customerstate": "Selangor",
          "arpu": 10,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "TopDeal Customer 6",
          "billingaccountnumber": "986654321",
          "outletid": "986654321",
          "expirydate": "12/22/2024",
          "customerstate": "Langkawi",
          "mobilenumber": "1111121100",
          "arpu": 10,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "TopDeal Customer 7",
          "billingaccountnumber": "987654352",
          "outletid": "987654322",
          "expirydate": "12/12/2024",
          "mobilenumber": "1111111101",
          "customerstate": "Langkawi",
          "arpu": 10,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "TopDeal Customer 8",
          "billingaccountnumber": "987684323",
          "outletid": "987654323",
          "expirydate": "12/12/2024",
          "mobilenumber": "1111111102",
          "customerstate": "Langkawi",
          "arpu": 10,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "TopDeal Customer 9",
          "billingaccountnumber": "987694324",
          "outletid": "987654324",
          "expirydate": "12/12/2024",
          "mobilenumber": "1111111103",
          "customerstate": "Langkawi",
          "arpu": 10,
          "isSelect": false
        },
        {
          "campaignname": "Retention Campaign",
          "accountname": "TopDeal Customer 10",
          "billingaccountnumber": "983654325",
          "outletid": "987654325",
          "expirydate": "12/12/2024",
          "mobilenumber": "1111111104",
          "customerstate": "Langkawi",
          "arpu": 10,
          "isSelect": false
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
    }
  ]

  bubbleProperty: any[] = [
    {
      "key": "campaignName",
      "title": "Campaign Name",
      "label": "Campaign Name",
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
      "key": "accountName",
      "title": "Account Name",
      "label": "Account Name",
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
      "key": "customerState",
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
      "key": "outletId",
      "title": "Outlet ID",
      "label": "Outlet ID",
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
      "key": "expiryDate",
      "title": "Expiry Date",
      "label": "Expiry Date",
      "required": true,
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
        "pattern": "Quantity Pattern Error!",
        "required": "Quantity is required!"
      },
      "externalAPIPayload": {}
    }
  ]

  customerIdTypeChoice: any[] = [
    { label: 'Old IC Number', value: 'Old NRIC'},
    { label: 'New IC Number', value: 'New NRIC'},
    { label: 'Passport', value: 'Passport'},
    { label: 'Military', value: 'Military'},
    { label: 'Police', value: 'Police'}
  ]
    
  CampaignTargetingForm: FormGroup = this.builder.group({
    search: [, { validators: [Validators.required], updateOn: "change"}],
    campaignName: [, { validators: [Validators.required], updateOn: "change"}],
    accountName: [, { validators: [Validators.required], updateOn: "change"}],
    customerState: [, { validators: [Validators.required], updateOn: "change"}],
    outletId: [, { validators: [Validators.required], updateOn: "change"}],
    expiryDate: [,]
    // expiryDate: [, { validators: [Validators.required], updateOn: "change"}]
  })

  CampaignTargetingSearchForm: FormGroup = this.builder.group({
    search: [, { validators: [Validators.required], updateOn: "change"}],
  })
  
  constructor(
    private router: Router,
    private builder: FormBuilder,
    private http: HttpClient,
    public dialog: MatDialog,
    public datepipe: DatePipe,
    private store: Store
  ) { 
    // this.docsResponseDuplicate = this.docsResponse[0].enum;
    // this.docsResponse = this.docsResponse[0].enum; // Mock // Enable to cater search for Mock data
  }

  async ngOnInit() {
    this.isMock = true;
    const status = await this.getAdminStatus();
    if (status){
      const secondStatus = this.isAdmin? this.populateIsAdminData() : await this.getDealerRetrieval();
      this.fetchDataTable();
    }
    this.unreserveEnable = true;
    this.dataSource = new MatTableDataSource(this.docsResponseDuplicate); // For Mock Only
    this.apiList = this.docsResponseDuplicate;  // For Mock Only
    this.isAll = false;
    this.isBubble = false;
    this.indentPagination = false;
  }

  populateDealerData (){
    // console.log("s5 this.apiResp :", this.apiResp)
    let sliceList = this.apiResp.filter(element => {
      // console.log("s5 dealerRetrievalUsername :", this.dealerRetrievalUsername);
      return element.outletid === this.dealerRetrievalUsername;
    });
    this.dataSource = new MatTableDataSource(sliceList);
    this.dataSource.paginator = this.paginatorManual;
    this.docsResponse = sliceList;
  }
  
  back(){
    window.location.href = `${currentEnv}${urlNav.frontofficehome}`;
  }

  next(){
    const dialogRef = this.dialog.open(CampaignTargetingPopupComponent,{
      height: '90%',
      width: '80%',
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log("Dialog result: ", result);
      this.docsResponseDuplicate.unshift(result.data[0]);
      this.dataSource = new MatTableDataSource(this.docsResponseDuplicate);
      this.dataSource.paginator = this.paginatorManual;
    });
  }
  
  getAdminStatus(){
    return new Promise(async (resolve, reject) => {
      const getStatus = localStorage.getItem("isAdmin");
    this.isAdmin = getStatus? true : false;
    // resolve(this.isAdmin);
    resolve(true);
    })
  }

  nextupload(){
    let element:HTMLElement = document.getElementById('fileUpload') as HTMLElement;
    element.click();
  }

  getDealerRetrieval() {
    return new Promise((resolve, reject) => {
      this.store.dispatch(loadingTrue());
      // setTimeout(()=>{
        const sessionData = sessionStorage.getItem('userData');
        if (sessionData){
          const decrypted = CryptoJS.AES.decrypt(sessionData, '01234567890112').toString(CryptoJS.enc.Utf8);
          const decryptedJson = JSON.parse(decrypted);
          const payload = {
            username:decryptedJson? decryptedJson.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].loginName : ""
          }
          this.dealerRetrievalUsername = decryptedJson? decryptedJson.retrieveDealerOutput.listOfCelRetrieveDealerProfileResponse.partnerContact[0].loginName : "";
          this.http.post<any>(endPoint.getCustStatus, payload).subscribe(result => {
              if (result) {
                console.log("s4 this.isAdmin result dealer status :", result);
                this.store.dispatch(loadingFalse());
                if (result.status === "Valid"){
                  this.isAdmin = true;
                  this.populateIsAdminData();
                }
                else {
                  this.isAdmin = false;
                  this.populateDealerData();
                  // this.dataSource = new MatTableDataSource(this.apiResp);
                  // this.dataSource.paginator = this.paginatorManual;
                  // this.docsResponse = this.apiResp;
                }
              }
            }, (error => {
              console.error(error);
              this.store.dispatch(loadingFalse());
            }))
        }
      // }, 2000);
      resolve(true);
    })
  }

  onCloseNotification() {
    this.showNotification = false;
  }

  populateIsAdminData() {
    console.log("s5a");
    this.dataSource = new MatTableDataSource(this.apiResp);
    this.dataSource.paginator = this.paginatorManual;
    this.docsResponse = this.apiResp;
    return true;
  }

  fetchDataTable() {
    this.store.dispatch(loadingTrue());
    const payload = {
      data_type: 'campaign list',
      user_type: 'Admin'
    }

  return new Promise((resolve, reject) => {
    this.http.post<any>(endPoint.getCampaignFullList, payload).subscribe(result => {
      if (result) {
        this.store.dispatch(loadingFalse());
        this.isMock = false;
        let temp = result.data;

        // Filter Expired Date - START //
        const todayDate = new Date();
        let newList = [];
        for (let i=0; i<temp.length; i++){
          if (new Date(temp[i].expirydate).getTime() >= todayDate.getTime()){
            newList.push(temp[i]);
          }
        }

        for (let i=0; i<newList.length; i++){
          // newList[i].expirydate = this.datepipe.transform(newList[i].expirydate, 'dd/MM/yyyy');
          if(moment(newList[i].expirydate, moment.ISO_8601).isValid()){
            newList[i].expirydate = this.datepipe.transform(newList[i].expirydate, 'dd/MM/yyyy');
          }
          newList[i].isSelect = false;
        }
        // Filter Expired Date - END //
        this.apiList = newList;
        this.apiResp = newList;
        this.dataSource = new MatTableDataSource(newList);
        this.dataSource.paginator = this.paginatorManual;
        this.docsResponse = newList;
      }
    }, (error => {
      console.error(error);
      this.store.dispatch(loadingFalse());
    }))
    resolve(true);
  })
  }

  handleFileInput(files: FileList) {
    const acceptedFileType = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!_.includes(acceptedFileType, files[0].type)) return;
    this.store.dispatch(loadingTrue());
    if (files.length > 0){
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(files[0]);
      reader.onload = (e: any) => {
        /* create workbook */
        const binarystr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });
  
        /* selected the first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  
        /* save data */
        const datatwo = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
        console.log("data EXCEL :", datatwo); // Data will be logged in array format containing objects

        // Massage data //
        for (let i=0; i<datatwo.length; i++){
          Object.keys(datatwo[i]).forEach(function(key) {
            var replaced = key.replace(/\s/g, "").toLowerCase();
            datatwo[i][replaced] = datatwo[i][key];
            delete datatwo[i][key];
          });
          if (datatwo[i]['expirydate']){
            datatwo[i]['expirydate'] = this.ExcelDateToJSDate(datatwo[i]['expirydate']);
          }
          if (datatwo[i]['billingaccountnumber']){
            datatwo[i]['billingaccountnumber'] = datatwo[i]['billingaccountnumber'].toString();
          }
          if (datatwo[i]['outletid']){
            datatwo[i]['outletid'] = datatwo[i]['outletid'].toString();
          }

          //// Check for empty value passed
          if (datatwo[i]['accountname'] === undefined){
            datatwo[i]['accountname'] = "";
          }
          if (datatwo[i]['arpu'] === undefined){
            datatwo[i]['arpu'] = "";
          }
          if (datatwo[i]['billingaccountnumber'] === undefined){
            datatwo[i]['billingaccountnumber'] = "";
          }
          if (datatwo[i]['campaignname'] === undefined){
            datatwo[i]['campaignname'] = "";
          }
          if (datatwo[i]['customerstate'] === undefined){
            datatwo[i]['customerstate'] = "";
          }
          if (datatwo[i]['expirydate'] === undefined){
            datatwo[i]['expirydate'] = "";
          }
          if (datatwo[i]['mobilenumber'] === undefined){
            datatwo[i]['mobilenumber'] = "";
          }
          if (datatwo[i]['outletid'] === undefined){
            datatwo[i]['outletid'] = "";
          }

          // console.log("datatwo test :", datatwo[i]['outletid']);
          if (datatwo[i]['accountname'] === "" || datatwo[i]['billingaccountnumber'] === "" || datatwo[i]['campaignname'] === "" || datatwo[i]['customerstate'] === "" || datatwo[i]['expirydate'] === "" || datatwo[i]['mobilenumber'] === "" || datatwo[i]['outletid'] === ""){
            this.popUpNotiy = true;
          }
        }
        //
        // console.log("datatwo AFTER :", datatwo);

        /// Insert data to DB ///
        const headers = {
          "Accept": '*/*',
          "Content-Type": 'application/json'
        }
        const payload = {
          data: datatwo
        }
        
        if (this.popUpNotiy === false){
          this.http.post<any>(endPoint.getCampaignList, payload, { headers }).subscribe(results => {
            console.log("CAMP result :", results.data)
            const text = "Document Upload Success";
            this.popUp(text, false);
  
            // Filter Expired Date - START //
            const todayDate = new Date();
            let newList = [];
            for (let i=0; i<results.data.length; i++){
              if (new Date(results.data[i].expirydate).getTime() > todayDate.getTime()){
                newList.push(results.data[i]);
              }
            }
  
            for (let i=0; i<newList.length; i++){
              if(moment(newList[i].expirydate, moment.ISO_8601).isValid()){
                newList[i].expirydate = this.datepipe.transform(newList[i].expirydate, 'dd/MM/yyyy');
              }
              newList[i].isSelect = false;
            }
            this.campaignData = newList;
            this.apiList = newList;
            this.dataSource = new MatTableDataSource(newList);
            this.dataSource.paginator = this.paginatorManual;
            // Filter Expired Date - END //
            this.store.dispatch(loadingFalse());
          }, (error => {
            console.error(error);
            this.store.dispatch(loadingFalse());
            const text = "Document upload failed";
            this.popUp(text, true);
          }))
        } else {
          const text = "Document upload failed: All mandatory fields are required for document to be uploaded";
          this.popUp(text, true);
          this.store.dispatch(loadingFalse());
        }
      };
    }
  }

  popUp(text, boolFlag){
    this.errorStatus = boolFlag;
    this.notificationData = text;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 5000);
    this.popUpNotiy = false;
  }

  ExcelDateToJSDate(serial) {
    var date = new Date(Math.round((serial - 25569)*86400*1000));
    var mnth = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join("/");
 }

  onSearch(){
    let tempHolder = [];
    if(this.CampaignTargetingSearchForm.get('search').value){
      let searchResult;
      // console.log("YYY this.docsResponse :", this.docsResponse);
      let tempCompare = this.CampaignTargetingSearchForm.get('search').value;
      searchResult = this.docsResponse.filter(element => {
        console.log("elemmm :", element);

        Object.keys(element).forEach(function(key) {
          if (element[key]?.toString().includes(tempCompare)){
          // if (element[key] === tempCompare){
            console.log("result IN :", element)
            let tempo = element;
            if (!tempHolder.find(item => item.accountname === element.accountname)) {
              tempHolder.push(tempo);
            }
          }
      });
      
      });
      console.log("tempHolder Result :", tempHolder);
      if (tempHolder.length > 0){
        searchResult = tempHolder;
      }
      console.log("Search Result :", searchResult);
      this.dataSource = new MatTableDataSource(searchResult);
      this.dataSource.paginator = this.paginatorManual;
      console.log("dataSource :", this.dataSource);
    }
    else {
      this.dataSource = new MatTableDataSource(this.apiList);
      this.dataSource.paginator = this.paginatorManual;
    }
  }

  pageChangeEvent(event){
    console.log("next page event :", event);
    if(event.length - (event.pageSize*event.pageIndex) < 8){
      this.indentPagination = true;
      console.log("next IN :", this.indentPagination);
    }
  }

  onChange(checker:string, isChecked: boolean, checkerAll: any){
    console.log("checkerAll :", checkerAll);
    if(isChecked) {
      this.checkboxFormArray.push(checker);

      if (this.apiList.length > 0){
        this.apiList.forEach(element =>{
          if (element.billingaccountnumber === checkerAll.billingaccountnumber && element.accountname === checkerAll.accountname && element.arpu === checkerAll.arpu && element.campaignname === checkerAll.campaignname && element.outletid === checkerAll.outletid){
            element.isSelect = true;
          }
          return element;
        });
        if(!this.isAll && this.checkboxFormArray.length === this.apiList.length){
          this.isAll = true;
        }
      }
      else {
        this.docsResponseDuplicate.forEach(element =>{
          if (element.billingaccountnumber === checkerAll){
            element.isSelect = true;
          }
          return element;
        });
        if(!this.isAll && this.checkboxFormArray.length === this.docsResponseDuplicate.length){
          this.isAll = true;
        }
      }

    } 
    else {
      let index = this.checkboxFormArray.indexOf(checker);
      this.checkboxFormArray.splice(index,1);

      if (this.apiList.length > 0){
        this.apiList.forEach(element =>{
          if (element.billingaccountnumber === checkerAll){
            element.isSelect = false;
          }
          return element;
        });
        if(this.isAll && this.checkboxFormArray.length !== this.apiList.length){
          this.isAll = false;
        }
      }
      else {
        this.docsResponseDuplicate.forEach(element =>{
          if (element.billingaccountnumber === checkerAll){
            element.isSelect = false;
          }
          return element;
        });
        if(this.isAll && this.checkboxFormArray.length !== this.docsResponseDuplicate.length){
          this.isAll = false;
        }
      }
    }
    console.log("222 checkboxFormArray :", this.checkboxFormArray);

    this.unreserveEnable = this.checkboxFormArray.length > 0 ? false : true;
  }

  onAll(checker:string, isChecked: boolean, checkerAll: any){
      if (isChecked){
        console.log("222 onAll checked");
        if (this.checkboxFormArray.length > 0){
          for (let i=0;i<checker.length; i++){
            let index = this.checkboxFormArray.indexOf(checker[i]);
            this.checkboxFormArray.splice(index,1);
          }
        }

        console.log("222 onAll docsResponseDuplicate B4 :", this.docsResponseDuplicate);
        for (let i=0;i<checker.length; i++){
          this.checkboxFormArray.push(checker[i]);
          // console.log("apiList :", this.apiList);
          if (this.apiList.length > 0 ){
            this.apiList.forEach(element =>{
              // console.log("222 element :", element);
              // console.log("222 element checker[i] :", checkerAll[i].billingaccountnumber);
              if (element.billingaccountnumber === checkerAll[i].billingaccountnumber){
                element.isSelect = true;
              }
              return element;
            });
          }
          else {
            this.docsResponseDuplicate.forEach(element =>{
              // console.log("222 element :", element);
              // console.log("222 element checker[i] :", checkerAll[i].billingaccountnumber);
              if (element.billingaccountnumber === checkerAll[i].billingaccountnumber){
                element.isSelect = true;
              }
              return element;
            });
          }
        }
        console.log("222 onAll docsResponseDuplicate AFTER :", this.docsResponseDuplicate);

        this.isAll = true;
      }
      else {
        console.log("222 onAll UNchecked");
        console.log("222 onAll docsResponseDuplicate B4 :", this.docsResponseDuplicate);
        for (let i=0;i<checker.length; i++){
          let index = this.checkboxFormArray.indexOf(checker[i]);
          this.checkboxFormArray.splice(index,1);

          if (this.apiList.length > 0 ){
            this.apiList.forEach(element =>{
              if (element.billingaccountnumber === checkerAll[i].billingaccountnumber){
                element.isSelect = false;
              }
              return element;
            });
          }
          else {
            this.docsResponseDuplicate.forEach(element =>{
              if (element.billingaccountnumber === checkerAll[i].billingaccountnumber){
                element.isSelect = false;
              }
              return element;
            });
          }
        }
        console.log("222 onAll docsResponseDuplicate AFTER :", this.docsResponseDuplicate);

        this.isAll = false;
      }
      console.log("222 checkboxFormArray :", this.checkboxFormArray);
      this.unreserveEnable = this.checkboxFormArray.length > 0 ? false : true;
  }

  onCancel(){
    console.log("this.CampaignTargetingForm :", this.CampaignTargetingForm)
    this.isAll = false;
    if(this.apiList.length > 0){
      this.apiList.forEach(element =>{
        console.log("element :", element);
        let tempString : string;
        tempString = element;
        let index = this.checkboxFormArray.indexOf(tempString);
        this.checkboxFormArray.splice(index,1);
  
        element.isSelect = false;
        return element;
      });
    } else {
      this.docsResponseDuplicate.forEach(element =>{
        console.log("element :", element);
        let tempString : string;
        tempString = element;
        let index = this.checkboxFormArray.indexOf(tempString);
        this.checkboxFormArray.splice(index,1);
  
        element.isSelect = false;
        return element;
      });
    }
  }

  onDelete(){
    console.log("onDelete apiList B4 :", this.apiList)
    let result;
    let deleteList = [];
    let resultList = [];
    if (this.apiList.length > 0){
      this.apiList.filter(element => {
        if (element.isSelect === true && this.apiList.find(item => item.billingaccountnumber === element.billingaccountnumber) )
        {
          deleteList.push(element);
        }
        else {
          resultList.push(element);
        }
      });
    } else {
      this.docsResponse.filter(element => {
        if (element.isSelect === true && this.docsResponse.find(item => item.billingaccountnumber === element.billingaccountnumber)){
          deleteList.push(element);
        }
        else {
          resultList.push(element);
        }
      });
    }

    console.log("onDelete deleteList :", deleteList)

    deleteList.forEach(element =>{
      element.mobilenumber = element.mobilenumber.toString();
    })
    console.log("onDelete apiList :", this.apiList);

    this.http.post<any>(endPoint.getDeleteCampaign, deleteList).subscribe(result => {
        if (result) {
          this.store.dispatch(loadingFalse());
          console.log("onDelete API response :", result);
          }
      }, (error => {
        console.error(error);
        this.store.dispatch(loadingFalse());
      }))

    resultList.forEach(element =>{
      element.isSelect = false;
      return element;
    });
    console.log("onDelete resultList :", resultList);
    this.apiList = resultList;
    this.dataSource = new MatTableDataSource(resultList);
    this.dataSource.paginator = this.paginatorManual;
    this.checkboxFormArray = [];
    this.isAll = false;
  }

  onFilter(){
    this.isBubble = !this.isBubble;
  }

  onApplyFilter(url){
    console.log("EEE url prop 1 :", url);
    this.isBubble = false;
      let filterResult;
      let tempArray;
      let count=[
        {count: false},
        {count: false},
        {count: false},
        {count: false},
        {count: false}
      ]
      let countFinal = [];
      if (url === null){
        console.log("ttt IF IN");
        tempArray = [{
          "campaignname" : this.CampaignTargetingForm.get('campaignName').value?.toLowerCase(),
          "accountname" : this.CampaignTargetingForm.get('accountName').value?.toLowerCase(),
          "customerstate" : this.CampaignTargetingForm.get('customerState').value?.toLowerCase(),
          "outledid" : this.CampaignTargetingForm.get('outletId').value,
          "expirydate" : this.CampaignTargetingForm.get('expiryDate').value
        }];
        let temp0 = [];
        let tempFinal = [];
        let tempFilter = [];
        let emptyArray = [];

        console.log("zzz campaignName :", this.CampaignTargetingForm.get('campaignName').value);
        console.log("zzz accountName :", this.CampaignTargetingForm.get('accountName').value);
        console.log("zzz customerState :", this.CampaignTargetingForm.get('customerState').value);
        console.log("zzz outletId :", this.CampaignTargetingForm.get('outletId').value);
        console.log("zzz expiryDate :", this.CampaignTargetingForm.get('expiryDate').value);

        if(this.CampaignTargetingForm.get('campaignName').value !== null && this.CampaignTargetingForm.get('campaignName').value !== ""){
          count[0].count = true;
        }
        if(this.CampaignTargetingForm.get('accountName').value !== null && this.CampaignTargetingForm.get('accountName').value !== ""){
          count[1].count = true;
        }
        if(this.CampaignTargetingForm.get('customerState').value !== null && this.CampaignTargetingForm.get('customerState').value !== ""){
          count[2].count = true;
        }
        if(this.CampaignTargetingForm.get('outletId').value !== null && this.CampaignTargetingForm.get('outletId').value !== ""){
          count[3].count = true;
        }
        if(this.CampaignTargetingForm.get('expiryDate').value !== null && this.CampaignTargetingForm.get('expiryDate').value !== ""){
          count[4].count = true;
        }

        filterResult = this.apiList.filter(element => {

          if (element.campaignname?.toLowerCase() === this.CampaignTargetingForm.get('campaignName').value?.toLowerCase() || element.accountname?.toLowerCase() === this.CampaignTargetingForm.get('accountName').value?.toLowerCase() || element.customerstate?.toLowerCase() === this.CampaignTargetingForm.get('customerState').value?.toLowerCase() || element.outletid === this.CampaignTargetingForm.get('outletId').value || element.expirydate === this.CampaignTargetingForm.get('expiryDate').value){
            return element;
          }
        });

        let temp=[
            {temp: false},
            {temp: false},
            {temp: false},
            {temp: false},
            {temp: false}
        ]
        // let temp: any;
        filterResult.forEach(element =>{
          console.log("Filter element :", element);
          if (element.campaignname?.toLowerCase() === this.CampaignTargetingForm.get('campaignName').value?.toLowerCase()){
            temp[0].temp = true;
            // count = ++count;
            tempFinal.push(element);
          }
          if (element.accountname?.toLowerCase() === this.CampaignTargetingForm.get('accountName').value?.toLowerCase()){
            temp[1].temp = true;
            // count = ++count;
            tempFinal.push(element);
          }
          if (element.customerstate?.toLowerCase() === this.CampaignTargetingForm.get('customerState').value?.toLowerCase()){
            temp[2].temp = true;
            // count = ++count;
            tempFinal.push(element);
          }
          if (element.outletid === this.CampaignTargetingForm.get('outletId').value){
            temp[3].temp = true;
            // count = ++count;
            tempFinal.push(element);
          }
          if (element.expirydate === this.CampaignTargetingForm.get('expiryDate').value){
            temp[4].temp = true;
            // count = ++count;
            tempFinal.push(element);
          }
        })

        temp0 = temp.filter(element => {
          return element.temp === true
        })
        countFinal = count.filter(element => {
          return element.count === true
        })

        console.log("Filter filterResult :", filterResult);
        console.log("Filter tempFinal :", tempFinal);
        console.log("Filter zzz temp0 :", temp0.length);
        console.log("Filter zzz count :", count);
        console.log("Filter zzz countFinal :", countFinal.length);
        const lookup = tempFinal.reduce((a, e) => {
          a[e.billingaccountnumber] = ++a[e.billingaccountnumber] || 0;
          console.log("filter a :", a);
          console.log("filter e :", e);
          console.log("filter a[e.billingaccountnumber] :", a[e.billingaccountnumber])
          if (a[e.billingaccountnumber] === temp0.length-1){
            console.log("filter INNNNZ");
            tempFilter.push(e);
          }
          return a;
        }, {});
        console.log("Filter TEST :", tempFinal.filter(e => lookup[e.billingaccountnumber]));
        console.log("Filter tempFilter :", tempFilter);

      if (countFinal.length !== temp0.length){
        console.log("filter !==")
        tempFilter = [];
      }
        this.dataSource = new MatTableDataSource(tempFilter);
        this.dataSource.paginator = this.paginatorManual;
      } else {
        console.log("ttt ELSE IN");
        tempArray = JSON.parse('{"' + decodeURI(url).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
        console.log("ttt tempArray :", tempArray);
        console.log("ttt  this.apiList :",  this.apiList);
      }
  }

  onCancelFilter(){
    this.CampaignTargetingForm.reset();
    this.isBubble = false;

    if (this.isMock){
      this.apiList = this.docsResponseDuplicate;
      this.dataSource = new MatTableDataSource(this.docsResponseDuplicate);
      this.dataSource.paginator = this.paginatorManual;
    }
    else {
      // this.apiList = this.apiResp;
      this.dataSource = new MatTableDataSource(this.apiResp);
      this.dataSource.paginator = this.paginatorManual;
    }
  }

  setURLSearchParam(data) {
    console.log("data :", data);
    const url = new URL(window.location.href);
    Object.keys(data).forEach(key => {
      url.searchParams.set(key, data[key]);
    });
    console.log("YYY url :", url);
    if(url.hash.includes("?")){
      let index = url.hash.indexOf("?");
      url.hash = url.hash.substring(0, index);
      console.log("YYY url.hash :", url.hash);
    }
  }

  getDropdownErrorMessage(val) {
    const temp = this.CampaignTargetingForm.get(val)
    console.log("Temp :", temp)

    if (temp.hasError('required') && val === "campaignName") {
      return 'Campaign Name is required';
    } else if (temp.hasError('required') && val === "accountName") {
      return 'Account Name is required';
    } else if (temp.hasError('required') && val === "customerState") {
      return 'Customer State is required';
    } else if (temp.hasError('required') && val === "outletId") {
      return 'Outlet ID is required';
    } else if (temp.hasError('required') && val === "expiryDate") {
      return 'Expiry Date is required';
    }
  }
}
