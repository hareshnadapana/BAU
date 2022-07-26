import { createAction, props } from '@ngrx/store';

export const increment = createAction('[Counter Component] Increment');
export const decrement = createAction('[Counter Component] Decrement');
export const reset = createAction('[Counter Component] Reset');

export const insertUserData = createAction('Insert User Data');
export const loadingTrue = createAction('Set Loading True');
export const loadingFalse = createAction('Set Loading False');
export const reserveNumberData = createAction('Set Reserve Number Data', props<{ payload: any }>());
export const reserveNumberResp = createAction('Set Reserve Number Response', props<{ payload: any }>());
export const reserveStatus = createAction('Set Reserve Status Response', props<{ payload: any }>());
export const unreserveStatus = createAction('Set Unreserve Status Response', props<{ payload: any }>());
