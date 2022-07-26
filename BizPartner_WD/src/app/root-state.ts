
export interface State {
    count: any;
    fullUserData: any;
    loading: boolean;
    reserveNumberData: any;
    reserveNumberResp: any;
    reserveStatus: any;
    unreserveStatus: any;
}

export const initialState : State = {
    count: 0,
    fullUserData: null,
    loading: null,
    reserveNumberData: null,
    reserveNumberResp: null,
    reserveStatus: null,
    unreserveStatus: null
};