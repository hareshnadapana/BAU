import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { currentEnv, urlNav } from 'app/URL';

@Component({
  selector: 'app-query-status',
  templateUrl: './query-status.component.html',
  styleUrls: ['./query-status.component.scss']
})
export class QueryStatusComponent implements OnInit,AfterViewInit  {
 
  inputFormArray: any[];
  searchResultFlag : boolean = false;
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<srData>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(private router:Router, private route: ActivatedRoute,private http: HttpClient, public dialog: MatDialog) { 
      const temporary = "[{\"key\":\"type\",\"title\":\"type\",\"label\":\"Select Type\",\"required\":true,\"order\":1,\"controlType\":\"textbox\",\"type\":\"\",\"enum\":[],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Quantity is required!\"},\"externalAPIPayload\":{},\"disabled\":true},{\"key\":\"sr_area\",\"title\":\"SR Area\",\"label\":\"SR Area\",\"required\":true,\"order\":2,\"controlType\":\"dropdown\",\"type\":\"\",\"enum\":[{\"label\":\"Corporate Employee\",\"value\":\"Corporate Employee\",\"disabled\":false},{\"label\":\"Corporate Official\",\"value\":\"Corporate Official\",\"disabled\":false}],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Region is required!\"},\"externalAPIPayload\":{},\"options\":[]},{\"key\":\"memoid\",\"title\":\"Memo Id\",\"label\":\"Memo Id\",\"required\":true,\"order\":3,\"controlType\":\"textbox\",\"type\":\"\",\"enum\":[],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Quantity is required!\"},\"externalAPIPayload\":{},\"disabled\":true},{\"key\":\"description\",\"title\":\"Description\",\"label\":\"Description\",\"required\":true,\"order\":4,\"controlType\":\"textbox\",\"type\":\"\",\"enum\":[],\"childenum\":[],\"lookupExternal\":false,\"hasChildLookup\":false,\"isExternalValidation\":false,\"externalValues\":{},\"childProperty\":\"\",\"validationURL\":\"\",\"childPropertyDataAPIURL\":\"\",\"validators\":{\"pattern\":\"\",\"required\":true},\"error\":{\"pattern\":\"\",\"required\":\"Quantity is required!\"},\"externalAPIPayload\":{},\"disabled\":true}]";
      this.inputFormArray = JSON.parse(temporary)
    }

  ngOnInit(): void {}
 
  ngAfterViewInit() {}

  previousPage() {
    window.location.href = `${currentEnv}${urlNav.frontofficehome}`;
  }

	back() {
    this.searchResultFlag = false;
  }

  valueChangeEvent(a,b){}

  onKeyUp(){}

  searchNumber() {
    this.searchResultFlag = true;
  }
}

export interface srData {
  reference_number: string;
  status: string;
  date_created: string;
  sr_area: string;
}
const ELEMENT_DATA: srData[] = [
  {reference_number: '1-519386661', status: 'Unassigned', date_created: '11/01/2022 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-519386662', status: 'Unassigned', date_created: '11/12/2021 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-519386663', status: 'Assigned', date_created: '11/01/2022 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-519386664', status: 'Unassigned', date_created: '11/10/2021 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-519386665', status: 'Assigned', date_created: '11/01/2022 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-519386666', status: 'Unassigned', date_created: '11/11/2021 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-519386667', status: 'Assigned', date_created: '11/01/2022 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-519386668', status: 'Assigned', date_created: '11/01/2022 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-519386669', status: 'Unassigned', date_created: '11/11/2021 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-5193866610', status: 'Assigned', date_created: '11/01/2022 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-5193866611', status: 'Unassigned', date_created: '11/09/2021 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-5193866612', status: 'Assigned', date_created: '11/01/2022 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-5193866613', status: 'Unassigned', date_created: '11/08/2021 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-5193866614', status: 'Assigned', date_created: '11/01/2022 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-5193866615', status: 'Unassigned', date_created: '11/02/2022 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-5193866616', status: 'Assigned', date_created: '19/01/2022 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-5193866617', status: 'Unassigned', date_created: '11/06/2021 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-5193866618', status: 'Assigned', date_created: '17/01/2022 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-5193866619', status: 'Unassigned', date_created: '11/05/2021 03:14:32', sr_area: 'Corporate Official'},
  {reference_number: '1-5193866620', status: 'Assigned', date_created: '01/03/2022 03:14:32', sr_area: 'Corporate Official'},
];




