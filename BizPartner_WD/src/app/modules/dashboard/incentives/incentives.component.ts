import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';
import { endPoint } from 'app/URL';
import { HttpClient } from "@angular/common/http";
import * as XLSX from 'xlsx';
import { loadingFalse, loadingTrue } from 'app/root-store.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-incentives',
  templateUrl: './incentives.component.html',
  styleUrls: ['./incentives.component.scss']
})
export class IncentivesComponent implements OnInit {
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
  displayedDocumentColumns: string[] = ['tick', 'msisdn', 'outletid', 'reservedate', 'releasedate'];
  checkboxFormArray: Array<any> = [];
  checkboxFormState: Array<any> = [];
  showPdf: boolean;
  isAll: boolean;
  isSelected: boolean;
  unreserveEnable: boolean;
  fileName= 'Incentives.xlsx';
  incentivesData: any[];
  docsResponseDuplicate: any[];
  dataSource : MatTableDataSource<any>;
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
      "key": "incentive",
      "title": "incentive",
      "label": "incentive",
      "type": "",
      "enum": [
        {
          "label": "Plan wise Details Nov 2017",
          "totalIncentive": 5615,
          "boxlabel1": "Enterprise Length of Stay",
          "boxvalue1": "1335",
          "boxlabel2": "Enterprise Renewal Incentive",
          "boxvalue2": "5615",
          "boxlabel3": "Enterprise COBP Business Share",
          "boxvalue3": "5615",
          "boxlabel4": "Enterprise COBP",
          "boxvalue4": "5615",
          "boxlabel5": "Enterprise Prepaid to Postpaid",
          "boxvalue5": "5615",
        },
        {
          "label": "Total Incentive as of Oct 2017",
          "totalIncentive": 5615,
          "boxlabel1": "Enterprise Length of Stay",
          "boxvalue1": "1335",
          "boxlabel2": "Enterprise Renewal Incentive",
          "boxvalue2": "5615",
          "boxlabel3": "Enterprise COBP Business Share",
          "boxvalue3": "5615",
          "boxlabel4": "Enterprise COBP",
          "boxvalue4": "5615",
          "boxlabel5": "Enterprise Prepaid to Postpaid",
          "boxvalue5": "5615",
        },
        {
          "label": "Total Incentive as of Sep 2017",
          "totalIncentive": 5615,
          "boxlabel1": "Enterprise Length of Stay",
          "boxvalue1": "1335",
          "boxlabel2": "Enterprise Renewal Incentive",
          "boxvalue2": "5615",
          "boxlabel3": "Enterprise COBP Business Share",
          "boxvalue3": "5615",
          "boxlabel4": "Enterprise COBP",
          "boxvalue4": "5615",
          "boxlabel5": "Enterprise Prepaid to Postpaid",
          "boxvalue5": "5615",
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
    
  constructor(private router:Router, private http: HttpClient, private store: Store) {
  }

  ngOnInit(): void {
    this.docsResponseDuplicate = this.docsResponse[0].enum;
    this.docsResponse = this.docsResponse[0].enum;
    this.showPdf = true;
    this.getIncentives();
  }

  getIncentives() {
    this.store.dispatch(loadingTrue());
    const incentivesParam = {
      months: 6,
      vendorId: "931771"
    }
    this.http.post<any>(endPoint.getIncentives, incentivesParam).subscribe(result => {
      if (result) {
        this.incentivesData = result;
        this.store.dispatch(loadingFalse());
      }
    }, (error => {
      console.error(error);
      this.store.dispatch(loadingFalse());
    }))
  }

  downloadExcel(index): void
  {
    const downloadCSV = {
      month: this.incentivesData[index].month,
      totalIncentive: this.incentivesData[index].totalIncentive
    }
    this.incentivesData[index]?.planWiseDetails.forEach((pw) => {
      downloadCSV[pw.planName] = pw.incentive;
    })

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([downloadCSV]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, this.fileName);
  }

  downloadPdf(){
    console.log("PDF Download Start");
  }

  back(){
    this.router.navigate(["/dashboard/dealer"])
  }
}
