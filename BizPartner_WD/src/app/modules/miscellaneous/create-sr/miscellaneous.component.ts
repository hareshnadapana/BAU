import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { currentEnv, urlNav } from 'app/URL';

@Component({
  selector: 'app-miscellaneous',
  templateUrl: './miscellaneous.component.html',
  styleUrls: ['./miscellaneous.component.scss']
})
export class MiscellaneousComponent implements OnInit{

  @ViewChild(MatTable) table: MatTable<any>;

  miscUploadedFileTableColumn: any[] = ['name', 'size', 'type'];
  miscUploadedFileData: any[] = [];
 
  createSrForm: FormGroup = this.builder.group({
    selectType: [, { validators: [Validators.required], updateOn: "change"}],
    srArea: [, { validators: [Validators.required], updateOn: "change"}],
    memoId: [, { validators: [Validators.required], updateOn: "change"}],
    desc: [, { validators: [Validators.required], updateOn: "change"}]
  })

  selectTypeChoice: any[] = [
    { label: 'Customer Request', value: 'Customer_Request' },
  ]

  srAreaChoice: any[] = [
    { label: 'Corporate Official', value: 'corporate_official' },
    { label: 'Corporate Employee', value: 'corporate_Employee' },
  ]

  memoIdChoice: any[] = [
    { label: 'Memo 1', value: 'memo1' },
    { label: 'Memo 2', value: 'memo2' },
    { label: 'Memo 3', value: 'memo3' }
  ]

  constructor(private builder: FormBuilder, private router:Router, public dialog: MatDialog) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
  }

  back() {
    window.location.href = `${currentEnv}${urlNav.frontofficehome}`;
  }

  openFile(){
    let element:HTMLElement = document.getElementById('fileUpload') as HTMLElement;
    element.click();
  }
  
  handleFileInput(files: FileList) {
    const fileToUpload = files.item(0);
    let temp ={};

    temp['name'] = fileToUpload['name'] ;
    temp['size'] = fileToUpload['size'] ;
    temp['type'] = fileToUpload['type'] ;
    this.miscUploadedFileData.push({ ...temp });
    this.table.renderRows();
  }

	goToNext() {
    this.router.navigate(['/miscellaneous/submitsuccess']);
  }
}






