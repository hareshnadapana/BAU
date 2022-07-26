import { Component, OnInit, Input } from '@angular/core';
import { currentEnv, endPoint, urlNav } from 'app/URL';
import { HttpClient } from "@angular/common/http";
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { loadingFalse, loadingTrue } from 'app/root-store.actions';
import { Store } from '@ngrx/store';
import _ from 'lodash';

@Component({
  selector: 'app-blacklist-check',
  templateUrl: './blacklist-check.component.html',
  styleUrls: ['./blacklist-check.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(500)
      ]),
    ])
  ]
})
export class BlacklistCheckComponent implements OnInit {

  blacklistData: any;
  custNameInfo: any;
  internalBlacklistTableData: any;
  internalDataSource: any;
  externalBlacklistTableData: any;
  externalDataSource: any;
  blacklistNotificationData: string;
  errorStatus: boolean = false;

  showInternalBlacklistTable: boolean = false;
  showExternalBlacklistTable: boolean = false;
  internalIdTypeColumn: string = '';
  showNotification: boolean = false;

  internalBlacklistTableColumn: any[] = ['billingAccNo', 'blacklistDate', 'customerId', 'customerName',   'msisdn'];
  hello: any[] = ['newIcNumber', 'nonIcNumber', 'oldIcNumber']
  externalBlacklistTableColumn: any[] = ['individualName', 'blacklistedAccountNumber', 'blacklistedByCompany', 'blacklistedDate'];
  customerIdTypeChoice: any[] = [
    { label: 'Old IC Number', value: 0 },
    { label: 'New IC Number', value: 1 },
    { label: 'Passport', value: 2 },
    { label: 'Military', value: 3 },
    { label: 'Police', value: 4 }
  ]
  blacklistCheckForm: FormGroup = this.builder.group({
    customerId: [, { validators: [Validators.required], updateOn: "change"}],
    idNumber: [, { validators: [Validators.required], updateOn: "change"}]
  })

  constructor(private http: HttpClient, private builder: FormBuilder, private router: Router, private store: Store) {}

  ngOnInit(): void {
    this.setIdNumberValidation();
  }

  getName() {
    if (this.blacklistCheckForm.get('idNumber').value === '901006609909') {
      return 'TEST_CELCOM_NRIC';
    } else if (this.blacklistCheckForm.get('idNumber').value === '941110223345') {
      return 'Tengku Izzat';
    } else {
      return 'N/A';
    }
  }

  getIdTypeErrorMessage() {
    const customerIdField = this.blacklistCheckForm.get('customerId');
    if (customerIdField.hasError('required')) {
      return 'Customer ID Type is required';
    }
  }

  getIdNumberErrorMessage() {
    const idNumberField = this.blacklistCheckForm.get('idNumber');
    if (idNumberField.hasError('required')) {
      return 'Customer ID Number is required';
    } else if (idNumberField.hasError('pattern') || idNumberField.hasError('maxlength') || idNumberField.hasError('minlength')) {
      return 'Invalid customer ID number';
    }
  }

  setIdNumberValidation() {
    const idNumberControl = this.blacklistCheckForm.get('idNumber');
    this.blacklistCheckForm.get('customerId').valueChanges.subscribe((idType) => {
      if (idType == 0 || idType == 1 || idType == 3 || idType == 4) {
        idNumberControl.setValidators([Validators.pattern("(([[0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01]))([0-9]{2})([0-9]{4})"), Validators.maxLength(12), Validators.minLength(12), Validators.required]);
      } else if (idType == 2) {
        idNumberControl.setValidators([Validators.pattern("^(?!0{3,20})[a-zA-Z0-9]{3,20}$"), Validators.maxLength(20), Validators.minLength(3), Validators.required]);
      }
      idNumberControl.updateValueAndValidity();
    })
  }

  getCustomerName() {
    const customerType = ['Old NRIC', 'New NRIC', 'Passport', 'Military', 'Police'];

    const getCustNameParams = {
      idNumber: this.blacklistCheckForm.get('idNumber').value,
      customerId: customerType[this.blacklistCheckForm.get('customerId').value]
    }

    return new Promise((resolve, reject) => {
      this.http.post<any>(endPoint.getBlacklistCustName, getCustNameParams)
        .subscribe(result => {
          console.log(result);
          resolve(result);
        }, (error => {
          resolve('Error occured');
        }))
    })
  }

  async onValidate() {
    this.store.dispatch(loadingTrue());
    const params = {
      "customerIdType": this.blacklistCheckForm.get('customerId').value,
      "customerIdNo": this.blacklistCheckForm.get('idNumber').value,
      "system": 'All'
    }

    const customerName = await this.getCustomerName();
    this.custNameInfo = customerName;

    this.http.post<any>(endPoint.getBlacklistCheck, params).subscribe(async results => {
      if (results) {
        this.errorStatus = false;
        this.blacklistData = results;
        this.checkDataValidity();
        this.store.dispatch(loadingFalse());
      }
    }, (error => {
      console.error(error);
      this.store.dispatch(loadingFalse());
      this.errorStatus = true;
      this.blacklistNotificationData = 'Error occurred';
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 5000);
    }))
  }

  checkDataValidity() {
    if (this.blacklistData.internal.status == 'Success') {
      const idType = this.blacklistCheckForm.get('customerId').value;
      if (idType === 0) this.internalIdTypeColumn = 'oldIcNumber';
      else if (idType === 2) this.internalIdTypeColumn = 'nonIcNumber';
      else if (idType === 1) this.internalIdTypeColumn = 'newIcNumber';
      else if (idType === 3) this.internalIdTypeColumn = 'military';
      else if (idType === 4) this.internalIdTypeColumn = 'police';
      
      if (this.internalBlacklistTableColumn.length > 5) this.internalBlacklistTableColumn.splice(4, 1);
      this.internalBlacklistTableColumn.splice(4,0, this.internalIdTypeColumn);

      this.internalBlacklistTableData = [{
        billingAccNo: this.blacklistData.internal?.blacklistInfo?.accounts[0]?.cbsAccountNum || 'N/A',
        blacklistDate: this.blacklistData.internal?.blacklistInfo?.accounts[0]?.blacklistDate || 'N/A',
        customerId: this.blacklistCheckForm.get('idNumber').value,
        customerName: this.blacklistData.internal?.blacklistInfo?.accounts[0]?.customerName || this.custNameInfo || this.getName() || 'N/A',
        newIcNumber: this.blacklistCheckForm.get('customerId').value === 1 ? this.blacklistCheckForm.get('idNumber').value : 'N/A',
        nonIcNumber: _.includes([2,3,4], this.blacklistCheckForm.get('customerId').value) ? this.blacklistCheckForm.get('idNumber').value : 'N/A',
        oldIcNumber: this.blacklistCheckForm.get('customerId').value === 0 ? this.blacklistCheckForm.get('idNumber').value : 'N/A',
        msisdn: this.blacklistData.internal?.blacklistInfo?.accounts[0]?.cbsMsisdn || 'N/A'
      }]
      this.internalDataSource = new MatTableDataSource(this.internalBlacklistTableData);
      this.showInternalBlacklistTable = true;
      this.errorStatus = true;
      this.blacklistNotificationData = 'You are blacklisted!';
      this.showNotification = true;
        setTimeout(() => {
        this.showNotification = false;
      }, 6000);
    } else {
      this.showInternalBlacklistTable = false;
    }

    if (this.blacklistData.external.status == 'Success') {
      this.externalBlacklistTableData = [{
        individualName: this.blacklistData.external?.blacklistInfo?.accounts[0]?.name || this.custNameInfo || this.getName() || 'N/A',
        blacklistedAccountNumber: this.blacklistData.external?.blacklistInfo?.accounts[0]?.accountNumber || 'N/A',
        blacklistedByCompany: this.blacklistData.external?.blacklistInfo?.accounts[0]?.telcoName || 'N/A',
        blacklistedDate: this.blacklistData.external?.blacklistInfo?.accounts[0]?.date || 'N/A',
      }]
      this.externalDataSource = new MatTableDataSource(this.externalBlacklistTableData);
      this.showExternalBlacklistTable = true;
      if (!this.errorStatus) {
        this.errorStatus = true;
        this.blacklistNotificationData = 'You are blacklisted'
        this.showNotification = true;
        setTimeout(() => {
          this.showNotification = false;
        }, 6000)
      }
    } else {
      this.showExternalBlacklistTable = false;
    }

    if (this.blacklistData.internal.status == 'Failed' && this.blacklistData.external.status == 'Failed') {
      this.showInternalBlacklistTable = false;
      this.showExternalBlacklistTable = false;
      this.errorStatus = false;
      this.blacklistNotificationData = 'You are not blacklisted!';
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 5000);
    }
  }

  navigateHome() {
    window.location.href = `${currentEnv}${urlNav.frontofficehome}`;
  }

  onCloseNotification() {
    this.showNotification = false;
  }
}
