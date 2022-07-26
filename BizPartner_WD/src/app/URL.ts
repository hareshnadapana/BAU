import { environment } from "environments/environment"
import * as CryptoJS from 'crypto-js';

const saltedData = '01234567890112'

// function encryption(data: string) {
//     return CryptoJS.AES.encrypt(JSON.stringify(data), saltedData).toString();
// }

function decryption(data: string) {
    const decrypted = CryptoJS.AES.decrypt(data, saltedData).toString(CryptoJS.enc.Utf8);
    return decrypted.slice(1, -1);
}

const customEnvironment = {
    DEV: { url: decryption('U2FsdGVkX19XqflRmvtV0PQyTguGPgQTcLz3R9J/bLGVwI2BZTU/Gp2eqsVNzi8V'), name: 'dev'},
    // SIT: { url: decryption('U2FsdGVkX19Ot0umzXXRJeNrifP/Q3SyWuGeiv+X4uTv+tLjvwNnyJTlnG5oqqyQ'), name: 'sit'}, // 10.8.44.7
    SIT: { url: decryption('U2FsdGVkX1+1iUK8u5ZwNnI7UWcHCU3aVYEhf7kri3RBlnxa4tuyMTqf5Gg1/Ov6'), name: 'sit'}, // 10.8.44.6
    LOCAL: { url: decryption('U2FsdGVkX1/LWvhgUy62Zg/f/7D5ecYmVqhnPbuquX7nJcccwrSP9ffZ6WhJsjcC'), name: 'local'}
}


const currentUsingEnv = customEnvironment.SIT; // change this variable if want to deploy to different env.

export const currentEnv = currentUsingEnv.url;
export const currentEnvName = currentUsingEnv.name;
export const endPoint = {
    getBlacklistCheck: environment.production ? `${currentEnv}${decryption('U2FsdGVkX1+cXVemmlphC6h3lX7xCIC9kMZVOIMKc0dk0V3qSGZKI3cCCnCIcaHMqUokf0uvvQTUSQQUI++UxQ==')}` : '/blacklistCheck', // /frontoffice/api/blacklistCheck
    getSubmitReserveNumber: environment.production ? `${currentEnv}${decryption('U2FsdGVkX19i4O6FwHgi6bNNommHQ7ocBctRdCc/9AZG/XvOkrwb0lUxsZQblgUXtrY1OPh0NmvoLaRpu/3Afg==')}` : '/assignreservenumber', // /frontoffice/api/assignreservenumber
    getReserveNumberList: environment.production ? `${currentEnv}${decryption('U2FsdGVkX1+dEIsFtUvpSggKHlouKEmmxNwpbX6b9ER6GuNcAXuaOGLFiKxSUuJnEBcQCrso2TevDN79pcX1kg==')}` : '/getreservenumberlist', // /frontoffice/api/getreservenumberlist
    getSubmitUnreserveNumber: environment.production ? `${currentEnv}${decryption('U2FsdGVkX1/FaqnuMVgWC8ba6vZhTVc47SWxi+Vgwf4OreUfSv4AkOJeU+F0iDVcjxAA3aYcRgIjywEeG33fBA==')}` : '/storeidreservenumber', // /frontoffice/api/storeidreservenumber
    getRetrievalDealer: environment.production ? `${currentEnv}${decryption('U2FsdGVkX1/SVzF/mduikohOWi5ZaovS/w3YFbGdl6MfP4wBEsvEg3ibwrCPLHKxRrDq7Lnx0nSWUqp32CzxvA==')}` : '/dealerRetrieval', // /frontoffice/api/dealerRetrieval
    getCampaignList: environment.production ? `${currentEnv}${decryption('U2FsdGVkX19T16pDyp7eFmj4ETiVb13r/2DGPAuGjq5T4aH0vFqgE9jVG3p8kDFH')}` : '/campaignlist', // /frontoffice/api/campaignlist
    getCampaignFullList: environment.production ? `${currentEnv}${decryption('U2FsdGVkX19Zn1iAqvSkB8KWc/lN8W31y2c4ZKhwNm3/LlxJlfZM2yXwRKJSAi/T/3HqAtbCEAf2YFure+lRNg==')}` : '/getCampaignFullList', // /frontoffice/api/getCampaignFullList
    getUnreserveNumberList : environment.production ? `${currentEnv}${decryption('U2FsdGVkX18vV3g+MiOctaf+47BIYfGbPNeuHAY7v3TW9aeL6r0+xtllTnPCNKenvIJPXnGtKkbaq2/uN1CFcQ==')}` : '/getunreservenumberlist', // /frontoffice/api/getunreservenumberlist
    getOrderList: '/getOrderList',
    getPincodeQuery: environment.production ? `${currentEnv}${decryption('U2FsdGVkX1/NHYDqLnwTSbUWrezKAPJAidOtjIUHr/FutKg4nZuD0fWRpfp4Mu4K8zfik9JzT/UkHqH4wdUmqA==')}` : '/getPincodeQuery', // /frontoffice/api/getPincodeQuery
    getCustStatus: environment.production ? `${currentEnv}${decryption('U2FsdGVkX19AQFYeq7MXtPg+x2+eo6YeECetPaCwswlS5tci44M0kE2amzI9aMRCJzeqbwgaWCyuuID1r+7H7w==')}` : '/getCustStatus', // /frontoffice/api/getCustStatus
    getDeleteCampaign: environment.production ? `${currentEnv}${decryption('U2FsdGVkX19T+EzDTW5Foxe5rEVHvXZVvVXaIa19aoVzfe23rKdjyEqnu+AL7/EJy1fnhwG2yb+aLV8KYIy41w==')}` : '/getDeleteCampaign', // /frontoffice/api/getDeleteCampaign
    getManageInventory: environment.production ? `${currentEnv}${decryption('U2FsdGVkX19C12LkmzD+kpPrSO5ptP8dmRNKV+6DqHiPVipf4OF8asPy2qr3ph6VKsCjP01mhi+vjAADrucudQ==')}` : '/getManageInventory', // frontoffice/api/getManageInventory
    getUserHierarchyCW: environment.production ? `${currentEnv}${decryption('U2FsdGVkX19AmI4wZ6xbYE0/JIgFsLspptIcYBHN07SzAuGnZp1guV0DEyUehDOfqadhPvLRFCHEtTXiUr+odQ==')}` : '/getUserHierarchyCW', // /frontoffice/api/getUserHierarchyCW
    getBlacklistCustName: environment.production ? `${currentEnv}${decryption('U2FsdGVkX1+TtkLbyJ4Suj/+0VcjWMer4FMeyEdG3Qd/g5TVYZ8D9ECipheD7Z4asC5r6FocZOSpgjmfUtf8tA==')}` : '/getBlacklistCustName', // /frontoffice/api/getBlacklistCustName
    getIncentives: environment.production ? `${currentEnv}${decryption('U2FsdGVkX19eFJQ0l2V19PSaraqoLztOaqPcySvluMltsfnBRh/VN0L3dCNCu4/j5BtTlrbIHi21rahopiwsiw==')}` : '/getIncentives' // /frontoffice/api/getIncentives
}

export const urlNav = {
    frontofficehome: decryption('U2FsdGVkX181WpIJYdfcJ7ES33FUWAIKRwwOYkgABitU8tk06GtywIiulO9rsIWM'), // /frontoffice/#/home
    frontofficenewreg: decryption('U2FsdGVkX19OK970mIqF8YVm8tyjA/2fgMunT1u2jNC/J1AtRYxCi163PBKMQzLHMXC7p/l+kZ+7bNmd5QtJPg=='), // /frontoffice/#/order/landing?type=new
    frontofficeportin: decryption('U2FsdGVkX1+/eu06vn1CkN2mdjUBjf82OPkbzP2cwnwpq+dovzuEPdJr4/FzxiL3xmYwq2cCnA/Bv36p4q9+xw=='), // /frontoffice/#/order/landing?type=portin
    // frontofficesearchcust: decryption('U2FsdGVkX18xZklwWbtaTwGmjB2SFe3TGQe/0U385uxQEhB4nC3qS558HpyepxPG09EQu58mDHDxtL20uX/k3Q=='), // /frontoffice/#/dashboard/landing
    frontofficesearchcust: decryption('U2FsdGVkX19ho00ibV8r+z3DNmuXETj8Mdid4tntpF5va5Vo0v5YrZ433Wbie2y4hNAepAiJzuYQDJhhqfvcCA=='), // /frontoffice/#/customer/searchCustomer
    frontofficeorderlineview: decryption('U2FsdGVkX1/OlOXLQ9pmOYv2K8z9rWRls8MjnOpwOXOquIxL1lBa+VGtJaaTlQgzwI9H9AvDlbfQxHceylk7ZA==') // /frontoffice/#/order-summary/orderLineView
}


export const b2c = {
    url: decryption('U2FsdGVkX1+folrrM53pMDHIho/Y3MueYaupEPPC0zVGSWGrjnhcwSk3A0e8whWUI2+hY3XTGO6irH+hiH1g7DlXc1nCYrE9Q2RZexUKuU5NK6l+3Nc7XtX0JyqaZg7wS/RvKOiFwlj4+Ohh/U5Y7Q=='), // https://celcomb2c.b2clogin.com/celcomb2c.onmicrosoft.com/oauth2/v2.0/authorize
    policyDEV: 'B2C_1A_AADB2C_PROTO2_SIGNIN',
    policyProd: 'B2C_1A_AADB2C_V1_SIGNIN',
    clientId: decryption('U2FsdGVkX1+yyqvyNBf9ct8gG4/1d6M8IxpAioJSTBJL5rM4ivaAovg+gSUgBjVO+fpNN9bSfvFRKf4Cg+lR4A=='), // d680c487-47f3-43eb-9eb5-5392cdbd59af
    nonce: 'defaultNonce',
    redirectUrlDEV: encodeURIComponent(decryption('U2FsdGVkX1+4UIxwLDJoLt2BmWLQIwMsAGyvd4S7pn5qQbYt3LDWJRYPbmLwpIVx0j78rJdOqO5i6IPnx3FQew==')), // 10.8.44.4:20103/frontoffice/
    redirectUrlSIT: encodeURIComponent(decryption('U2FsdGVkX1+nLpNLn8v7GG7Mh9cRVzjVWflBo8WRvFdBuqaLBdBQnaDsrwEETBGXiv+5nrEuKmg1Wdu/JZFjag==')), // 10.8.44.6:20103/frontoffice/
    scope: 'openid',
    responseMode: 'query',
    responseType: 'id_token',
    prompt: 'login',
    channelName: 'BIZP', // set by SISO team
    sessionID: '2222', // to be set by tcs team
}

export const msalLogin = {
    devRedirectURL: decryption('U2FsdGVkX19n/1f+v1NTMVqWww3nKJ+QcwcKegO269beoU3PNRXWWBGW3TcVAu7WSA1Xaz94jVZnVmEqYP5UFI5hgOFQ2P2Jm8adYvt7PPc='), // https://dev.bizpartner.celcom.com.my/#/dashboard/dealer
    authority: decryption('U2FsdGVkX1/TjvETabkgeM9hbYxUWrFDJ6F0v9lyDP6fk0LVPITE6xHwK/Yok1/hnP8BRnKIyFYgThb2YuPB32S34vfmugdlhdwYbrOu4E/Ha0FnOi64oj/5iH1FU3lc')  // https://login.microsoftonline.com/bf048976-7110-4e87-96f3-c6744908b8be
}
