import { Component, OnInit, Input, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { currentEnv, endPoint, urlNav } from 'app/URL';
import { HttpClient } from "@angular/common/http";
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { loadingFalse, loadingTrue } from 'app/root-store.actions';
@Component({
  selector: 'app-manage-inventory',
  templateUrl: './manage-inventory.component.html',
  styleUrls: ['./manage-inventory.component.scss']
})
export class ManageInventoryComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('fieldComponent', { read: ViewContainerRef })
  fieldComponent!: ViewContainerRef;

  displayedDocumentColumns: string[] = ['materialcode', 'itemname', 'brand', 'category', 'instock'];
  docsResponseDuplicate: any[];
  inventoryData: any[];
  dataSource : MatTableDataSource<any>;
  isMock : boolean = false;
  isBubble: boolean = false;
  showExportBtn: boolean = true;
  searchFieldDisabled: boolean = true;
  advanceSearchFieldDisabled: boolean = true;
  inventoryMockData: any[] = [
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
          "sapMaterialCode": "20005463",
          "deviceModelDesc": "FIX-HUAWEI-F610-DECT PHONE UNI",
          "manufacturerId": "HUAWEI",
          "inventoryItemTypeId": "FIX",
          "quantity": "140",
          "TotalAvailableQty": "106",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005765",
          "deviceModelDesc": "MDM-TPLINK-LTE M7000-UNI",
          "manufacturerId": "HUAWEI",
          "inventoryItemTypeId": "FIX",
          "quantity": "26",
          "TotalAvailableQty": "12",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005888",
          "deviceModelDesc": "FIX-HUAWEI-F610-DECT",
          "manufacturerId": "HUAWEI",
          "inventoryItemTypeId": "FIX",
          "quantity": "02",
          "TotalAvailableQty": "0",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005411",
          "deviceModelDesc": "FIX-HUAWEI-F610",
          "manufacturerId": "HUAWEI",
          "inventoryItemTypeId": "FIX",
          "quantity": "67",
          "TotalAvailableQty": "41",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005473",
          "deviceModelDesc": "FIX-HUAWEI-F610-DECT PHONE SCHOOL",
          "manufacturerId": "HUAWEI",
          "inventoryItemTypeId": "FIX",
          "quantity": "15",
          "TotalAvailableQty": "10",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005408",
          "deviceModelDesc": "MDM-TPLINK-LTE M7000-SCHOOL",
          "inventoryItemTypeId": "FIX",
          "manufacturerId": "HUAWEI",
          "quantity": "64",
          "TotalAvailableQty": "63",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005456",
          "deviceModelDesc": "FIX-HUAWEI-F710-DECT",
          "manufacturerId": "HUAWEI",
          "inventoryItemTypeId": "FIX",
          "quantity": "32",
          "TotalAvailableQty": "32",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005437",
          "deviceModelDesc": "FIX-HUAWEI-F610",
          "manufacturerId": "HUAWEI",
          "inventoryItemTypeId": "FIX",
          "quantity": "10",
          "TotalAvailableQty": "03",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005365",
          "deviceModelDesc": "AMMEND-HUAWEI-F610",
          "manufacturerId": "HUAWEI",
          "inventoryItemTypeId": "FIX",
          "quantity": "201",
          "TotalAvailableQty": "140",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005823",
          "deviceModelDesc": "FIX-CELCOM-F810",
          "manufacturerId": "CELCOM",
          "inventoryItemTypeId": "FIX",
          "quantity": "104",
          "TotalAvailableQty": "100",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005512",
          "deviceModelDesc": "FIX-WOLVERINE-F610",
          "manufacturerId": "CELCOM",
          "inventoryItemTypeId": "FIX",
          "quantity": "321",
          "TotalAvailableQty": "300",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005752",
          "deviceModelDesc": "FIX-CHANNEL-F610",
          "manufacturerId": "CELCOM",
          "quantity": "111",
          "inventoryItemTypeId": "FIX",
          "TotalAvailableQty": "111",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005582",
          "deviceModelDesc": "FIX-HYUNDAI-F610",
          "manufacturerId": "CELCOM",
          "inventoryItemTypeId": "FIX",
          "quantity": "76",
          "TotalAvailableQty": "67",
          "expirydate": "12/12/2022",
          "arpu": 10,
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005265",
          "deviceModelDesc": "FIX-PROTON-X50",
          "manufacturerId": "CELCOM",
          "inventoryItemTypeId": "FIX",
          "quantity": "52",
          "TotalAvailableQty": "34",
          "isSelect": false
        },
        {
          "sapMaterialCode": "20005573",
          "deviceModelDesc": "FIX-XT-F610",
          "manufacturerId": "CELCOM",
          "inventoryItemTypeId": "FIX",
          "quantity": "100",
          "TotalAvailableQty": "99",
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
  ];
  dropdownList: any[] = [
    {
      "title": "Select Category",
      "enum": [
        {
          "label": "Device",
          "value": "HP"
        },
        {
          "label": "Modem",
          "value": "MDM"
        },
        {
          "label": "Sim Card",
          "value": "SIM card"
        }
      ]
  }];
  outletEnum: any[];
  defaultVal: string = "HP";
  dropdownForm:FormGroup = this.builder.group({
    search: [, { updateOn: "change" }],
  })

  inventorySearch = new FormControl('');
  materialCodeSearch = new FormControl('');
  itemNameSearch = new FormControl('');
  brandSearch = new FormControl('');
  categorySearch = new FormControl('');

  constructor(
    private router: Router,
    private builder: FormBuilder,
    private http: HttpClient,
    public dialog: MatDialog,
    public datepipe: DatePipe,
    private store: Store,
  ) {
  }

  async ngOnInit(): Promise<void> {
    if (this.isMock) {
      this.inventoryData = this.inventoryMockData[0].enum;
      this.dataSource = new MatTableDataSource(this.inventoryData); // For Mock Only
      this.dataSource.paginator = this.paginator;
    } else {
      this.dropdownForm.controls.search.setValue(this.defaultVal)
      this.fetchData(this.defaultVal);
    }
  }

  fetchData(catType) {
    this.store.dispatch(loadingTrue());
    const payload = {
      "alphanumericItemLocationId" : null,
      "buId" : null,
      "color" : null,
      "dealerReservation" : null,
      "deviceModelId" : null,
      "deviceTypeId" : catType,
      "inventoryItemStatusId" : null,
      "inventoryItemTypeId" : null,
      "itemDesc" : null,
      // "itemLocationId" : "SWK56810",
      "itemLocationId" : "99974",
      "lang" : null,
      "manufacturerId" : null,
      "model" : null,
      "opId" : null,
      "price" : null,
      "sapMaterialCode" : null,
      "storeType" : null,
      "userId" : null
    }

    this.http.post<any>(endPoint.getManageInventory, payload).subscribe(inventory => {
      if (inventory) {
        this.inventoryData = inventory.result;
        this.dataSource = new MatTableDataSource(this.inventoryData);
        this.dataSource.paginator = this.paginator;
        this.searchFieldDisabled = false;
        this.advanceSearchFieldDisabled = false;
        this.showExportBtn = true;
      }
      this.store.dispatch(loadingFalse());
    }, (error => {
      console.error(error);
      this.store.dispatch(loadingFalse());
      this.showExportBtn = false;
      this.searchFieldDisabled = true;
      this.advanceSearchFieldDisabled = true;
    }))
  }
  
  back(){
    window.location.href = `${currentEnv}${urlNav.frontofficehome}`;
  }

  idSelect(event){
    this.fetchData(event);
  }

  onSearch(){
    const filterVal = this.inventorySearch.value.trim();
    const lowerFilterVal = filterVal.toLowerCase();
    this.dataSource.filter = lowerFilterVal;
  }

  applyAdvanceSearch() {
    const filteredData = this.inventoryData.filter((rawData) => {
      return (
        rawData.manufacturerId.toLowerCase().includes(this.brandSearch.value.toLowerCase()) &&
        rawData.sapMaterialCode.toLowerCase().includes(this.materialCodeSearch.value.toLowerCase()) &&
        rawData.deviceModelDesc.toLowerCase().includes(this.itemNameSearch.value.toLowerCase()) &&
        rawData.inventoryItemTypeId.toLowerCase().includes(this.categorySearch.value.toLowerCase()))
    })
    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
    this.isBubble = false;
  }

  clearSearch() {
    this.brandSearch.setValue('');
    this.materialCodeSearch.setValue('');
    this.itemNameSearch.setValue('');
    this.categorySearch.setValue('');
    this.dataSource = new MatTableDataSource(this.inventoryData);
    this.dataSource.paginator = this.paginator;
    this.isBubble = false;
  }

  exportExcel() {
    if (this.dataSource.filteredData.length > 0) {
      import('xlsx').then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(this.dataSource.filteredData);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "DeviceInventory");
      })
    }
  }
  saveAsExcelFile(buffer: any, filename: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(data);
    link.download = `${filename}_export_${new Date().getTime()}${EXCEL_EXTENSION}`;
    link.click();
  }

  pageChangeEvent(event){
    // console.log("ctrl event :", event);
  }
}