module.exports = {

    //API:/getRefDependentDataFinal
    getRefDependentDataFinal: function (themeResp) {
        var resObject = [];
        console.log("ACCT_SEGMENT////", themeResp);

        for (index = 0; index < themeResp.data[0].refValues.length; index++) {
            console.log(themeResp.data[0].refValues[index]);
            var map = {};
            map["value"] = themeResp.data[0].refValues[index].id;
            map["label"] = themeResp.data[0].refValues[index].displayText;
            map["disabled"] = true;
            resObject.push(map);
        }
        console.log("resObject--->", resObject);
        return resObject;
    },

    //API:/getFormatedAddressData
    getFormatedAddressData: function (req) {
        var address = {};
        console.log(
            "Request for Format Address Data :: ",
            req.body.inputFormArrayAddress
        );
        console.log(
            "Request for Format Address Data :: ",
            req.body.selectedAddress.addressData
        );
        if (undefined != req.body.selectedAddress.addressData.addressLine1 &&
            null != req.body.selectedAddress.addressData.addressLine1) {
            address["addressLine1"] =
                req.body.selectedAddress.addressData.addressLine1;
        }
        if (undefined != req.body.selectedAddress.addressData.addressLine2 &&
            null != req.body.selectedAddress.addressData.addressLine2) {
            address["addressLine2"] =
                req.body.selectedAddress.addressData.addressLine2;
        }
        if (undefined != req.body.selectedAddress.addressData.addressLine3 &&
            null != req.body.selectedAddress.addressData.addressLine3) {
            address["addressLine3"] =
                req.body.selectedAddress.addressData.addressLine3;
        }
        if (undefined != req.body.selectedAddress.addressData.city &&
            null != req.body.selectedAddress.addressData.city) {
            address["city"] = req.body.selectedAddress.addressData.city;
        }
        if (undefined != req.body.selectedAddress.addressData.state &&
            null != req.body.selectedAddress.addressData.state) {
            address["state"] = req.body.selectedAddress.addressData.state;
        }
        if (undefined != req.body.selectedAddress.addressData.country &&
            null != req.body.selectedAddress.addressData.country) {
            address["country"] = req.body.selectedAddress.addressData.country;
        }
        if (undefined != req.body.selectedAddress.addressData.pincode &&
            null != req.body.selectedAddress.addressData.pincode) {
            address["pincode"] = req.body.selectedAddress.addressData.pincode;
        }

        console.log("JSON Object for Address Format address :: ", address);
        let addressUpdatedArray = req.body.inputFormArrayAddress;
        let keyArr = Object.keys(address);
        for (let i = 0; i < addressUpdatedArray.length; i++) {
            for (let key of keyArr) {
                if (key == addressUpdatedArray[i].key) {
                    console.log("Inside addressUpdatedArray -- ");
                    if (addressUpdatedArray[i].type != "button") {
                        addressUpdatedArray[i].value = address[key];
                    }
                }
            }
        }

        console.log(
            "addressUpdatedArrayaddressUpdatedArray -service---  ",
            addressUpdatedArray
        );
        return addressUpdatedArray;
    },

    //API:/findAddress
    // Wolverine changes
    findAddress: function (themeResp) {
        var resObject = [];
        console.log(
            "Request for Format Address Data :: ",
            themeResp
        );
        // themeResp.data.forEach((element) => {
            var address = {};
            address["city"] = themeResp.data.city;
            address["state"] = themeResp.data.state;
            address["pincode"] = themeResp.data.postalcode;
            resObject.push(address);
        // });
        return resObject;;
    },
    // Changes ends here
    
    //API:/getJSONFormData
    getJSONFormData: function (themeResp, req) {
        if (req.body.context.formId == "order.app.makePayment.capture") {
            let requestData = req.body.context.data;
            let inputFormArray = JSON.parse(
                themeResp.data.responseObject.formData
            );
            inputFormArray.forEach((eachItem) => {
                if (eachItem.key == "totalRC") {
                    eachItem.value =
                        requestData.responseObject.chargeSummary.currency +
                        "  " +
                        requestData.responseObject.chargeSummary.mapOfCharges.Monthly.taxIncludedAmount.toString();
                } else if (eachItem.key == "totalNRC") {
                    eachItem.value =
                        requestData.responseObject.chargeSummary.currency +
                        "  " +
                        requestData.responseObject.chargeSummary.mapOfCharges.OneTime.taxIncludedAmount.toString();
                } else if (eachItem.key == "taxUpfrontCharge") {
                    eachItem.value =
                        requestData.responseObject.chargeSummary.currency +
                        "  " +
                        requestData.responseObject.chargeSummary.mapOfCharges.Upfront.taxAmount.toString();
                } else if (eachItem.key == "totalUpfrontCharge") {
                    eachItem.value =
                        requestData.responseObject.chargeSummary.currency +
                        "  " +
                        requestData.responseObject.chargeSummary.mapOfCharges.Upfront.taxIncludedAmount.toString();
                } else if (eachItem.key == "totalAmountToPay") {
                    eachItem.value =
                        requestData.responseObject.chargeSummary.currency +
                        "  " +
                        requestData.responseObject.chargeSummary.mapOfCharges.Upfront.taxIncludedAmount.toString();
                }
            });
            themeResp.data.responseObject.formData =
                JSON.stringify(inputFormArray);
            return themeResp.data;
        } else if (req.body.context.formId == "order.app.customerDetailsDisplay.capture") {
            const customerDetails = req.body.context.customerResponse;
            let inputFormArray = JSON.parse(
                themeResp.data.responseObject.formData
            );
            // const customerAddress;
            let address = "";
            if (customerDetails.customer.party.partyType == "INDIVIDUAL") {
                for (let key in customerDetails.customer.customerContact[0]
                    .contactMedium[0].address[0]) {
                    if (
                        key != "addressID" &&
                        key != "addressCharacteristics" &&
                        key != "addressType" && key != "addressCharacteristics" && key != "customAddress"
                    ) {
                        address =
                            address +
                            customerDetails.customer.customerContact[0].contactMedium[0]
                                .address[0][key] +
                            ",";
                    }
                }

                inputFormArray.forEach((eachItem) => {
                    if (eachItem.key == "mobileNo") {
                        eachItem.value =
                            customerDetails.customer.customerContact[0].contactMedium[0].telephoneNumber;
                    } else if (eachItem.key == "email") {
                        eachItem.value =
                            customerDetails.customer.customerContact[0].contactMedium[0].primaryEmailID;
                    } else if (eachItem.key == "address") {
                        eachItem.value = address.slice(0, -1);
                    }
                });
            } else if (
                customerDetails.customer.party.partyType == "ORGANIZATION"
            ) {
                for (let key in customerDetails.customer.party.address[0]) {
                    if (
                        key != "addressID" &&
                        key != "addressCharacteristics" &&
                        key != "addressType"
                    ) {
                        address =
                            address +
                            customerDetails.customer.party.address[0][key] +
                            ",";
                    }
                }

                inputFormArray.forEach((eachItem) => {
                    if (eachItem.key == "tin") {
                        eachItem.value =
                            customerDetails.customer.party.partyIdentification[0].id;
                    } else if (eachItem.key == "mobileNo") {
                        eachItem.value =
                            customerDetails.customer.customerContact[0].contactMedium[0].telephoneNumber;
                    } else if (eachItem.key == "email") {
                        eachItem.value =
                            customerDetails.customer.customerContact[0].contactMedium[0].primaryEmailID;
                    } else if (eachItem.key == "address") {
                        address = address.slice(0, -1);
                        eachItem.value = address;
                    }
                });
            }

            //If value is not being set then that element will be removed from UI list though it is available in FORM-JSON
            inputFormArray.forEach((eachItem) => {
                console.log("each Item :::: ", eachItem.value);
                if (
                    eachItem.value == undefined ||
                    eachItem.value == "" ||
                    eachItem.value == null
                ) {
                    inputFormArray.splice(inputFormArray.indexOf(eachItem), 1);
                }
            });
            console.log("InputForm Array ---> ", inputFormArray);
            themeResp.data.responseObject.formData =
                JSON.stringify(inputFormArray);
            return themeResp.data;
        } else if (req.body.context.formId == "order.app.accountBasicDetails.capture") {
            let accountName = req.body.context.accountName;
            let isExistingCustomer = req.body.context.isExistingCustomer;
            let inputFormArray = JSON.parse(
                themeResp.data.responseObject.formData
            );
            inputFormArray.forEach((eachItem) => {
                if (eachItem.key == "accountName") {
                    eachItem.value = accountName;
                }
            });

            if (isExistingCustomer == "NO") {
                inputFormArray.forEach((eachItem) => {
                    if (eachItem.key == "addParent") {
                        inputFormArray.splice(inputFormArray.indexOf(eachItem), 1);
                    }
                });
                inputFormArray.forEach((eachItem) => {
                    if (eachItem.key == "parentAccount") {
                        inputFormArray.splice(inputFormArray.indexOf(eachItem), 1);
                    }
                });
            } else {
                let accountMap = req.body.context.accountIds;
                var parentAccount = [];
                accountMap.forEach((eachAcccount) => {
                    var parentAccountJSON = {};
                    parentAccountJSON["label"] = eachAcccount.accountid + " (" + eachAcccount.accountname + ")";
                    parentAccountJSON["value"] = eachAcccount.accountid;
                    parentAccountJSON["disabled"] = false;
                    parentAccount.push(parentAccountJSON);
                });
                inputFormArray.forEach((eachItem) => {
                    if (eachItem.key == "parentAccount") {
                        eachItem.enum = parentAccount;
                    }
                });
            }
            themeResp.data.responseObject.formData =
                JSON.stringify(inputFormArray);
            return themeResp.data;
        } else if (req.body.context.formId == "order.app.confirmPaymentCE.capture") {
            let paymentData = req.body.context.data;
            let inputFormArray = JSON.parse(
                themeResp.data.responseObject.formData
            );
            inputFormArray.forEach((eachItem) => {
                console.log("eachItem", eachItem);
                if (eachItem.key == "customerName") {
                    eachItem.value = paymentData.customerName;
                }
                if (eachItem.key == "transactionAmount") {
                    eachItem.value = paymentData.transactionAmount;
                }
                if (eachItem.key == "paymentUniqueId") {
                    eachItem.value = paymentData.paymentUniqueId;
                }
                if (eachItem.key == "paymentMethod") {
                    eachItem.value = paymentData.paymentMethod;
                }
                if (eachItem.key == "paymentReference") {
                    eachItem.value = paymentData.paymentReference;
                }
                if (eachItem.key == "paymentDate") {
                    eachItem.value = paymentData.paymentDate;
                }
                if (eachItem.key == "paymentstatus") {
                    eachItem.value = paymentData.paymentstatus;
                }
            });
            themeResp.data.responseObject.formData =
                JSON.stringify(inputFormArray);
            return themeResp.data;
        } else if (req.body.context.formId == "order.app.addNotes.capture") {
            let cartResponse = req.body.context.cartResponse;
            let enumData = [];
            Object.entries(cartResponse.responseObject.mapOfCartItem).forEach(
                ([key, val]) => {
                    enumData.push({
                        label: val.configuredProduct.name,
                        value: key,
                        disabled: false,
                    });
                }
            );
            let inputFormArray = JSON.parse(
                themeResp.data.responseObject.formData
            );
            inputFormArray.forEach((eachItem) => {
                console.log("eachItem", eachItem);
                if (eachItem.key == "notesCategory") {
                    eachItem.enum = enumData;
                }
            });
            themeResp.data.responseObject.formData =
                JSON.stringify(inputFormArray);
            return themeResp.data;
        } else {
            return themeResp.data;
        }

    },
    //API:/checkAddress
    checkAddress: function (themeResp, req, status) {
        console.log("themeResp checkAddress::::", themeResp);
        var map = {};
        let resfrmock = themeResp.data.responseObject;
        console.log("resfrmock", resfrmock)
        let temp = {
            checkFlag: true,
        };
        let keyArr = Object.keys(req.body.checkAddress);
        var checkAddressFormData = {};
        for (let key of keyArr) {
            if (key != "serviceAvailabilty") {
                checkAddressFormData[key] = req.body.checkAddress[key];
            }
        }
        let tempData = {
            address: checkAddressFormData,
            checkFlag: false,
        };
        const objKeys = Object.keys(resfrmock);
        const objKey = Object.keys(req.body.checkAddress);
        console.log("keys", objKeys, objKey);
        let i = 0;
        let a = 0;
        Object.entries(objKeys).forEach((entry) => {
            Object.entries(objKey).forEach((ent) => {
                //console.log("loop",entry,ent);
                if (entry[1] == ent[1]) {
                    i = i + 1;
                    let val = resfrmock;
                    let res = req.body.checkAddress;
                    if (val[entry[1]] == res[entry[1]]) {
                        a = a + 1;
                    }
                }
            });
        });
        if (i == a) {
            map["responseStatusList"] = status;
            map["responseObject"] = temp;
        } else {
            map["responseStatusList"] = status;
            map["responseObject"] = tempData;
        }
        return map;
    },
    //API:/SearchByCriteria
    //Wolverine Changes
    getSearchByResult: function (themeResp, req) {
        var resObject = [];
        console.log("themeResp getSearchByResult////", themeResp.data);
        console.log("themeResp req////", req);
        if (themeResp.data.errorSpcCode === '' && themeResp.data.errorSpcMessage === '') {
            var map = {};
            map["businessRegistrationNumber"] = themeResp.data.listOfAccountDetailsIO.account[0].celCustomerId
            map["company"] = themeResp.data.listOfAccountDetailsIO.account[0].accountName
            resObject.push(map);
            console.log("getSearchByResult resObject :", resObject);
            // return resObject;
            return { responseStatusList: themeResp.data.responseStatusList, result: resObject};
        } else {
            // return themeResp.data // ORI
            var map = {};
            map["businessRegistrationNumber"] = "BRN0000"
            map["company"] = "Celcom Wolverine"
            resObject.push(map);
            // return resObject;
            return { responseStatusList: themeResp.data.responseStatusList, result: resObject};
        }
    },
    // Changes ends here

     //API:/SearchByCriteria
     getSearchByResultCriteria: function (themeResp, req) {
        var resObject = [];
        console.log("themeResp getSearchByResultCriteria themeResp.data////", themeResp.data);
        console.log("themeResp getSearchByResultCriteria req////", req);
        console.log("themeResp getSearchByResultCriteria data.responseStatusList.status[0].statusCode/////", themeResp.data.responseStatusList.status[0].statusCode)
        if (themeResp.data.responseStatusList.status[0].statusCode == "0000") {
            if(themeResp.data.customerSubscriberSummary != null && themeResp.data.customerSubscriberSummary != undefined){
                let obj = Object.keys(req.queryFacet[0].data);
                for (let key of obj) {
                    if (key == "accountid") {
                        for (let index = 0; index < themeResp.data.customerSubscriberSummary.length; index++) {
                            var map = {};
                            map["accountID"] = themeResp.data.customerSubscriberSummary[index].accountID
                            map["accountName"] = themeResp.data.customerSubscriberSummary[index].accountName
                            map["payerEmail"] = themeResp.data.customerSubscriberSummary[index].payerEmail;
                            map["payerAddress"] = themeResp.data.customerSubscriberSummary[index].payerAddress;
                            for (let j = 0; j < themeResp.data.customerSubscriberSummary[index].contact.length; j++) {
                                if (themeResp.data.customerSubscriberSummary[index].contact[j].contactType == "BILLING") {
                                    map["mobileNumber"] = themeResp.data.customerSubscriberSummary[index].contact[j].mobileNumber;
                                }
    
                            }
                            if (themeResp.data.customerSubscriberSummary[index].partyIdentifier != undefined && themeResp.data.customerSubscriberSummary[index].partyIdentifier.partyIdentification[0] != undefined &&
                                themeResp.data.customerSubscriberSummary[index].partyIdentifier.partyIdentification[0].identificationId != undefined) {
                                map["TIN"] = themeResp.data.customerSubscriberSummary[index].partyIdentifier.partyIdentification[0].identificationId;
                            }
                            resObject.push(map);
    
                        }
                    } else if (key == "primaryserviceidentifier") {
                        for (let index = 0; index < themeResp.data.customerSubscriberSummary.length; index++) {
                            var map = {};
                            map["subscriberID"] = themeResp.data.customerSubscriberSummary[index].subscriberID
                            map["userName"] = themeResp.data.customerSubscriberSummary[index].userName
                            for (let j = 0; j < themeResp.data.customerSubscriberSummary[index].contact.length; j++) {
                                if (themeResp.data.customerSubscriberSummary[index].contact[j].contactType == "INSTALLATION") {
                                    map["email"] = themeResp.data.customerSubscriberSummary[index].contact[j].email;
                                    map["mobileNumber"] = themeResp.data.customerSubscriberSummary[index].contact[j].mobileNumber;
                                    map["stringifiedAddress"] = themeResp.data.customerSubscriberSummary[index].contact[j].stringifiedAddress;
                                }
    
                            }
                            if (themeResp.data.customerSubscriberSummary[index].partyIdentifier != undefined && themeResp.data.customerSubscriberSummary[index].partyIdentifier.partyIdentification[0] != undefined &&
                                themeResp.data.customerSubscriberSummary[index].partyIdentifier.partyIdentification[0].identificationId != undefined) {
                                map["TIN"] = themeResp.data.customerSubscriberSummary[index].partyIdentifier.partyIdentification[0].identificationId;
                            }
                            resObject.push(map);
    
                        }
                    }else if(key == "customerid" || key == "normalName" || key == "ownerName" || key == "mobilenumber" || key == "email"
                  ||  key == "partyIdentification.idType" || key == "ownerName") {
                        for (let index = 0; index < themeResp.data.customerSubscriberSummary.length; index++) {
                            var map = {};
                            map["customerID"] = themeResp.data.customerSubscriberSummary[index].customerID
                            map["customerName"] = themeResp.data.customerSubscriberSummary[index].customerName
                            map["accountID"] = themeResp.data.customerSubscriberSummary[index].accountID
                            map["payerAddress"] = themeResp.data.customerSubscriberSummary[index].payerAddress
                            map["payerName"] = themeResp.data.customerSubscriberSummary[index].payerName
                            if (themeResp.data.customerSubscriberSummary[index].contact) {
                                for (let j = 0; j < themeResp.data.customerSubscriberSummary[index].contact.length; j++) {
                                    if (themeResp.data.customerSubscriberSummary[index].contact[j].contactType == "PRIMARY") {
                                        map["email"] = themeResp.data.customerSubscriberSummary[index].contact[j].email;
                                        map["mobileNumber"] = themeResp.data.customerSubscriberSummary[index].contact[j].mobileNumber;
                                        map["stringifiedAddress"] = themeResp.data.customerSubscriberSummary[index].contact[j].stringifiedAddress;
                                    }

                                }
                            }
                            if (themeResp.data.customerSubscriberSummary[index].partyIdentifier != undefined && themeResp.data.customerSubscriberSummary[index].partyIdentifier.partyIdentification[0] != undefined &&
                                themeResp.data.customerSubscriberSummary[index].partyIdentifier.partyIdentification[0].identificationId != undefined) {
                                map["TIN"] = themeResp.data.customerSubscriberSummary[index].partyIdentifier.partyIdentification[0].identificationId;
                            }
                            resObject.push(map);
    
                        }
                    }
                }
            }
            return { responseStatusList: themeResp.data.responseStatusList, result: resObject};
        } else {
            return themeResp.data
        }
        // return resObject;
    }
}