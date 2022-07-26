
module.exports = {
    //API:/subscriberSummaryByCustomerId
    getSubscriberSummary: function (response) {
        let subscriberList = {};
        if (response.responseObject != null && response.responseObject.content != null && response.responseObject.content.length != 0)
            response.responseObject.content.forEach(element => {
                let subs = {};
                subs.customerID = element.customerID;
                subs.accountID = element.accountID;
                subs.subscriberID = element.subscriberID;
                subs.username = element.username;
                subs.payerName = element.payerName;
                subs.status = element.status;
                subs.userAddress = element.userAddress ? element.payerAddress : '';
                subs.payerAddress = element.payerAddress ? element.payerAddress : '';
                subs.primaryServiceIdentifiersName = '';
                subs.primaryServiceIdentifiersValue = '';
                subs.primaryServiceIdentifiers = {};
                subs.action = [];
                if (element.primaryServiceIdentifiers != null) {
                    subs.primaryServiceIdentifiers = element.primaryServiceIdentifiers;
                    if (element.primaryServiceIdentifiers[0] != null) {
                        subs.primaryServiceIdentifiersName = element.primaryServiceIdentifiers[0].name;
                        subs.primaryServiceIdentifiersValue = element.primaryServiceIdentifiers[0].value;
                    }
                }
                subs.serviceType = [];
                subs.offeringLabel = [];
                if (element.serviceType != null)
                    element.serviceType.forEach(item => {
                        subs.serviceType.push(item);
                    })
                if (element.offeringLabel != null && element.offeringLabel.length != 0)
                    subs.subscription = element.offeringLabel[0];
                subs.userNameMap = [];
                let userNameList = {};
                userNameList.icon = "people";
                userNameList.valueList = [];
                userNameList.valueList.push(element.username);
                userNameList.valueList.push(element.subscriberID);
                subs.userNameMap.push(userNameList);
                let billingList = {};
                subs.billingAccountMap = [];
                billingList.icon = "people";
                billingList.valueList = [];
                billingList.valueList.push(element.accountName);
                billingList.valueList.push(element.accountID);
                subs.billingAccountMap.push(billingList);
                subscriberList[element.subscriberID] = subs;
            });
        // console.log("subscriberList----------->", subscriberList);
        if (response.responseObject !== null && response.responseObject != undefined) {
            response.responseObject.contentMap = new Map();
            response.responseObject.contentMap = subscriberList;
        }
        return response;
    }

}
