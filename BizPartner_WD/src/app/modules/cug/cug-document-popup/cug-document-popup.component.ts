
import { Component, OnInit , Inject, Optional} from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
// import { CommonStoreActions, ContextStoreActions, ContextStoreSelectors, OrderCustomerStoreActions, OrderCustomerStoreSelectors, OrderRefdataStoreActions, OrderRefdataStoreSelectors, RootStoreState, SubscriberServicesOffersActions, SubscriberServicesOffersSelectors, DashboardCustomerStoreActions } from 'src/app/root-store';
// import { CustomerAddress } from '../../shared/models/customer/cutomerdetails';
// import { FindAddressRequest } from '../../shared/models/services_offers/findAddressRequest';
// import { PcFilter, refMarketList } from '../../shared/models/services_offers/marketList';
// import { Status } from '../../shared/models/status/status';
// import { ApplogService } from 'src/app/shared/services/applog.service';
// import { ChassisService } from '../../shared/services/chassis.service';
// import { ServiceSelectionRouterService } from '../../shared/services/serviceselectionrouter.service';
import { HttpClient } from '@angular/common/http';
// import { EachcomponentService } from '@hobsui/genericform';
import {MatDialog} from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-cug-document-popup',
  templateUrl: './cug-document-popup.component.html',
  styleUrls: ['./cug-document-popup.component.scss']
})
export class CugDocumentPopupComponent implements OnInit {
 
   
  property: any[] = [ { "key": "attachmentName", "title": "attachmentName", "label": "Attachment Name", "required": true, "order": 1, "controlType": "dropdown", "type": "", "enum": [ { "label": "New NRIC", "value": "New NRIC", "disabled": false }, { "label": "Passport", "value": "Passport", "disabled": false }, { "label": "Driving License", "value": "Driving License", "disabled": false }, ], "childenum": [], "lookupExternal": false, "hasChildLookup": false, "isExternalValidation": false, "externalValues": {}, "childProperty": "", "validationURL": "", "childPropertyDataAPIURL": "", "validators": { "pattern": "", "required": true }, "error": { "pattern": "", "required": "Select Type is required!" }, "externalAPIPayload": {}, "options": [], }, { "key": "Type", "title": "Type", "label": "Type", "required": true, "order": 2, "controlType": "textbox", "type": "", "enum": [], "childenum": [], "lookupExternal": false, "hasChildLookup": false, "isExternalValidation": false, "externalValues": {}, "childProperty": "", "validationURL": "", "childPropertyDataAPIURL": "", "validators": { "pattern": "", "required": true }, "error": { "pattern": "", "required": "Description Pattern is required!" }, "externalAPIPayload": {} },  { "key": "Notes", "title": "Notes", "label": "Notes", "required": true, "order": 4, "controlType": "textbox", "type": "", "enum": [], "childenum": [], "lookupExternal": false, "hasChildLookup": false, "isExternalValidation": false, "externalValues": {}, "childProperty": "", "validationURL": "", "childPropertyDataAPIURL": "", "validators": { "pattern": "", "required": true }, "error": { "pattern": "", "required": "Description Pattern is required!" }, "externalAPIPayload": {} }, { "key": "Attach", "title": "Attach", "label": "Attach", "required": true, "order": 4, "controlType": "textbox", "value": "", "disabled": true, "type": "", "enum": [], "childenum": [], "lookupExternal": false, "hasChildLookup": false, "isExternalValidation": false, "externalValues": {}, "childProperty": "", "validationURL": "", "childPropertyDataAPIURL": "", "validators": { "pattern": "", "required": true }, "error": { "pattern": "", "required": "Attachment is required!" }, "externalAPIPayload": {} } ];
  confirmCartResponse$: Observable<any>;
  // isLoading$: Observable<boolean>
  //error$: Observable<string>;
  // statuserr: Status;
  orderId: any = null;
  appointmentRes$: Observable<any>;
  apptDate: any;
  appointmentId: any;
  attachmentDetails: any;
  
  
  skipServiceSelection : any;
  selectedServiceType : string;
  // statuserr: Status;
  isLoading$: Observable<boolean>;
  isRefStoreLoading$: Observable<boolean>;
  genericServiceAttributesForm$: Observable<any>;
  genericServiceAttributesFormValidation$: Observable<any>;
  customer$: Observable<any>;
  inputFormArray: any[];
  inputFormArrayModification: any[];
  inputFormArrayAddress: any[];
  addressUpdatedArray : any[];
  dataService$: Observable<any>;
  businessType$:Observable<any>;
  selectedType:any;
  scopeItems = [{ "name": "all", "display": "All", "icon": "globe" }];
  error$: Observable<any>;
  isSkipServiceSelectionScreen:boolean = false;
  isEnableServiceAttributeScreen:boolean = false;
  processFlow$: Observable<any>;
  processFlowError$: Observable<string>;
  applicationConstants:any;
	genericAddressForm$: Observable<any>;
  genericAddressFormValidation$: Observable<any>;
  addressFormRequired : boolean = true;
  addressForm: FormGroup;
  selectedData: any = [];
  showresults: boolean;
  tableDataJSON = [];
  findAddress$: Observable<any>;
  searchText: String;
  searchProductRes: any;
  addressAvailable = false;
  isAddressFormRequired : boolean = true;
  isGoogleMapRequired : boolean = true;
  googleMapAPIKey : string;;
  showAll: boolean = false;
  advanceSearchaddressAvailable = false;
  flag : boolean = false;
  // interface: EachcomponentService= new EachcomponentService();

  inputAdvanceFormArray: any[]; 
  gmapSearchConfig: any;
  gmapCoords: any;
  isAddressSearchRequired: any;
  basicDetails: any;
  formDetails: any;
  addressDetails: any;
  typeFlag : boolean = true;

  fileToUpload: File | null = null;
  filesUploaded : any = [];

  requiredCheck0 = new FormControl('', [Validators.required]);
  requiredCheck1 = new FormControl('', [Validators.required]);
  requiredCheck2 = new FormControl('', [Validators.required]);
  requiredCheck3 = new FormControl('', [Validators.required]);

  constructor(private router:Router, private route: ActivatedRoute,
    // private store: Store<RootStoreState.State>,
    // private chassisService: ChassisService,
    // private log: ApplogService,
    // private serviceSelectionRouterService: ServiceSelectionRouterService ,
    private http: HttpClient, public dialog: MatDialog,
    public dialogRef: MatDialogRef<CugDocumentPopupComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
    ) { 

   
      
      // this.isLoading$ = this.store.select(SubscriberServicesOffersSelectors.selectLoading);
      // this.isRefStoreLoading$ = this.store.select(OrderRefdataStoreSelectors.selectLoading);
      // this.error$ = this.store.select(SubscriberServicesOffersSelectors.selectError);
      // this.processFlowError$ = store.select(ContextStoreSelectors.selectError);
      // this.store.select(SubscriberServicesOffersSelectors.selectServiceType).subscribe(data=>this.selectedServiceType=data);
      // this.dataService$ = this.store.select(SubscriberServicesOffersSelectors.selectMarketing);
      // this.businessType$=this.store.select(SubscriberServicesOffersSelectors.selectBusinessType);
      // this.businessType$.subscribe(data=>{
      //   if(data!=null){
      //     this.store.dispatch(CommonStoreActions.loadingFalse());
      //     this.selectedType=data;
      //   }
      // });

    const temporary = "[{\"key\":\"attachment_name\",\"title\":\"attachment_name\",\"label\":\"Attachment Name\",\"required\":true,\"order\":1,\"controlType\":\"dropdown\",\"type\":\"\",\"enum\":[{\"label\":\"Passport\",\"value\":\"passport\",\"disabled\":false},{\"label\":\"NRIC\",\"value\":\"nric\",\"disabled\":false},{\"label\":\"driving_license\",\"value\":\"Driving License\",\"disabled\":false}],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Attachment Name is required!\"},\"externalAPIPayload\":{},\"options\":[]},{\"key\":\"type\",\"title\":\"type\",\"label\":\"Type\",\"required\":true,\"order\":2,\"controlType\":\"textbox\",\"type\":\"\",\"enum\":[],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Type is required!\"},\"externalAPIPayload\":{},\"disabled\":false},{\"key\":\"attach\",\"title\":\"attach\",\"label\":\"Attach\",\"required\":true,\"order\":3,\"controlType\":\"textbox\",\"type\":\"\",\"enum\":[],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Attachment is required!\"},\"externalAPIPayload\":{},\"disabled\":false},{\"key\":\"notes\",\"title\":\"Notes\",\"label\":\"Notes\",\"required\":true,\"order\":4,\"controlType\":\"textbox\",\"type\":\"\",\"enum\":[],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Notes is required!\"},\"externalAPIPayload\":{},\"disabled\":false}]";
        this.inputFormArray = JSON.parse(temporary)
          let updatedInputFormArray = this.inputFormArray;
      

    this.tableDataJSON = [];
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
    const dialogRef = this.dialog.open(CugDocumentPopupComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  




  next(e){
    
    // this.log.debug("Inside Next :: ")
    

    }

  



  





  handleFileInput(files: FileList) {

  

    this.fileToUpload = files.item(0);

    // this.attachmentDetails  = this.fileToUpload['name'];  

    this.property[3].value = this.fileToUpload['name'];

    let temp ={

    }
    temp['name'] = this.fileToUpload['name'] ;
    temp['size'] = this.fileToUpload['size'] ;
    temp['type'] = this.fileToUpload['type'] ;
    this.filesUploaded.push(temp);
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
  this.dialogRef.close({ event: 'close', data: this.filesUploaded });
}
onNoClick(){
  this.dialogRef.close({ event: 'close', data: [] });
}
back(){

  this.dialogRef.close();
}
}






