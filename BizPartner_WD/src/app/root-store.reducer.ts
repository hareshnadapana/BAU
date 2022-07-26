import { createReducer, on } from '@ngrx/store';
import { increment, decrement, reset, insertUserData, loadingTrue, loadingFalse, reserveNumberData, reserveNumberResp, reserveStatus, unreserveStatus } from './root-store.actions';
import { initialState } from './root-state';

// export const initialState = 0;

const _commonStoreReducer = createReducer(
  initialState,
  on(increment, (state ) =>(
    {
        ...state,
        count: state.count + 1
    }
  )),
  on(decrement, (state ) =>(
    {
        ...state,
        count: state.count - 1
    }
  )),
  on(reset, (state ) =>(
    {
        ...state,
        count: 0
    }
  )),
  on(insertUserData, (state) => (
    {
      ...state,
      fullUserData: sessionStorage.getItem('userData')
    }
  )),
  on(loadingTrue, (state) => (
    {
      ...state,
      loading: true
    }
  )),
  on(loadingFalse, (state) => (
    {
      ...state,
      loading: false
    }
  )),
  on(reserveNumberData,(state, { payload: data }) => (
    {
      ...state,
      reserveNumberData: data
    }
  )),
  on(reserveNumberResp,(state, { payload: data }) => (
    {
      ...state,
      reserveNumberResp: data
    }
  )),
  on(reserveStatus, (state,  { payload: data }) => (
    {
      ...state,
      reserveStatus: data
    }
  )),
  on(unreserveStatus, (state, { payload: data }) => (
    {
      ...state,
      unreserveStatus: data
    }
  ))
);

export function commonStoreReducer(state, action) {
  return _commonStoreReducer(state, action);
}

// on(reset, (state) => 0)