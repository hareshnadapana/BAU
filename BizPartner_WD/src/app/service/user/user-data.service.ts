import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { insertUserData, loadingTrue, loadingFalse } from 'app/root-store.actions';
import { Store } from '@ngrx/store';
import { endPoint } from 'app/URL';
import CryptoJS from 'crypto-js';
import { ReplaySubject, Subject } from 'rxjs';
import * as CommonStoreSelectors from 'app/root-store.selectors';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  constructor(private http: HttpClient, private store: Store) {
    this.getFullName();
  }

  public user: Subject<any> = new ReplaySubject(1);

  getFullName() {
    // this.store.dispatch(loadingTrue());
    const payload = {
      loginName: "R1189834"
    };
  
    if (sessionStorage.getItem('userData')) {
      this.store.dispatch(insertUserData());
      this.store.select(CommonStoreSelectors.selectGetFullUserData).subscribe(result => {
        if (result) {
          const decrypted = CryptoJS.AES.decrypt(result, '01234567890112').toString(CryptoJS.enc.Utf8);
          const userData = JSON.parse(decrypted);
          this.store.dispatch(loadingFalse());
          return this.user.next(userData);
        }
      }, (error => {
        console.error(error);
        // this.store.dispatch(loadingFalse());
        return;
      }))
    } else {
      this.http.post<any>(endPoint.getRetrievalDealer, payload).subscribe(result => {
        if (result) {
          const encrypted = CryptoJS.AES.encrypt(JSON.stringify(result), '01234567890112').toString();
          sessionStorage.setItem('userData', encrypted);
          this.store.dispatch(loadingFalse());
          return this.user.next(result);
        }
      }, (error => {
        console.error(error);
        this.store.dispatch(loadingFalse());
        return;
      }));
    }
  }
}
