import { Injectable } from '@angular/core';
// import { createEffect, ofType, Actions } from '@ngrx/effects';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CelcomActions } from './index'
import { HttpClient } from "@angular/common/http";
import { endPoint } from './URL';

@Injectable()
export class CelcomEffects {

  // constructor(private action$: Actions, private http: HttpClient) {}
  constructor(private http: HttpClient) {}
}
