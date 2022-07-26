import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Location } from '@angular/common';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-cug-upload-document',
  templateUrl: './cug-upload-document.component.html',
  styleUrls: ['./cug-upload-document.component.scss']
})
export class CugUploadDocumentComponent implements OnInit {

  @ViewChild(MatTable) table: MatTable<any>;

  CugUploadForm:FormGroup = this.builder.group({
    cug_id: [, { validators: [Validators.required], updateOn: "change"}],
    memo_id: [, { validators: [Validators.required], updateOn: "change"}],
    request_id: [, { validators: [Validators.required], updateOn: "change"}],
    company_name: [, { validators: [Validators.required], updateOn: "change"}],
    customer_id: [, { validators: [Validators.required], updateOn: "change"}],
    promotion_group: [, { validators: [Validators.required], updateOn: "change"}]
  })

  cugUploadedFileData: any[] = [];
  cugUploadedFileTableColumn: any[] = ['name', 'size', 'type'];

  constructor(private router:Router, private builder: FormBuilder, private location: Location) {}

  ngOnInit(): void {}

  ngAfterViewInit(){}

  openFile() {
    let element:HTMLElement = document.getElementById('fileUpload');
    element.click();
  }

  handleFileInput(files: FileList) {
    const fileToUpload = files.item(0);
    let temp = {};

    temp['name'] = fileToUpload['name'] ;
    temp['size'] = fileToUpload['size'] ;
    temp['type'] = fileToUpload['type'] ;
    this.cugUploadedFileData.push({ ...temp });
    this.table.renderRows();
  }

  previousPage() {
    this.location.back();
  }

  onSave(event) {
    let addressForm = event.formData.form2;
  }
  
  goToNext() {
    this.router.navigate(['/cug/cugsummary']);
  }

  searchCustomer() {
    this.router.navigate(['/cug/cugsearchcustomer']);
  }

  pickService() {
    this.router.navigate(['/cug/cugpickservice']);
  }

  onSearch(event) {
    console.log("Inside Search capturebasicinformation  :: ",event)
    console.log("capturebasicinformation::onSearchCompact::Address Search Text  :: ", event)
  }

	back() {
    this.router.navigate(['/cug/cugpickservice']);
  }

  getDropdownErrorMessage(val) {
    const temp = this.CugUploadForm.get(val)

    if (temp.hasError('required') && val === "cug_id") {
      return 'CUG ID is required';
    } else if (temp.hasError('required') && val === "memo_id") {
      return 'Memo ID is required';
    } else if (temp.hasError('required') && val === "request_id") {
      return 'Request ID is required';
    } else if (temp.hasError('required') && val === "company_name") {
      return 'Company Name is required';
    } else if (temp.hasError('required') && val === "customer_id") {
      return 'Customer ID is required';
    } else if (temp.hasError('required') && val === "promotion_group") {
      return 'Promotion Group is required';
    }
  }
}



