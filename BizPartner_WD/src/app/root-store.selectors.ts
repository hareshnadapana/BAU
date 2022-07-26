import { State } from './root-state';
import { MemoizedSelector, createFeatureSelector, createSelector } from '@ngrx/store';

export const getCount = (state: State) => { return state.count };
export const getFullUserData = (state: State) => { return state.fullUserData };
export const getLoading = (state: State) => { return state.loading };
export const getReserveNumberData = (state: State) => { return state.reserveNumberData };
export const getReserveNumberResp = (state: State) => { return state.reserveNumberResp };
export const getReserveStatus = (state: State) => { return state.reserveStatus };
export const getUnreserveStatus = (state: State) => { return state.unreserveStatus };

export const commonStore :MemoizedSelector<object,State> = createFeatureSelector<State>('commonStore');
export const selectGetCount : MemoizedSelector<object,any> = createSelector(commonStore,getCount);
export const selectGetFullUserData: MemoizedSelector<object, string> = createSelector(commonStore, getFullUserData);
export const selectLoading: MemoizedSelector<object, boolean> = createSelector(commonStore, getLoading);
export const reserveNumberData: MemoizedSelector<object, any> = createSelector(commonStore, getReserveNumberData);
export const reserveNumberResp: MemoizedSelector<object, any> = createSelector(commonStore, getReserveNumberResp);
export const reserveStatus: MemoizedSelector<object, any> = createSelector(commonStore, getReserveStatus);
export const unreserveStatus: MemoizedSelector<object, any> = createSelector(commonStore, getUnreserveStatus);