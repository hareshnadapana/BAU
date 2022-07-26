
module.exports = {
    //API:/subscriberProductsTabAPI
    getProductCustamizedDetails: function (products, contracts, installments) {
        let productList = [];
        let forDate = (value) => {
            let date = new Date(value);
            return [
                date.getDate(),
                date.toLocaleString('default', { month: 'short' }), //date.toLocaleString('fr', { month: 'short' }),
                date.getFullYear()
            ].join('-');
        }
        products.forEach(subsProduct => {
            console.log("subscriberProductsTabAPI---here---gg-->");
            try {
                let prod = { "headerPanel": {}, "contentPanel": [] };
                console.log("subscriberProductsTabAPI---here---subsProduct.name-->", subsProduct.name);
                prod.headerPanel.productName = subsProduct.name;
                prod.headerPanel.activeSince = forDate(subsProduct.startDate);
                prod.headerPanel.endDate = forDate(subsProduct.terminationDate);
                if (subsProduct['@type'] != 'DISCOUNT' && subsProduct['@type'] != 'Discount') {
                    prod.headerPanel.monthlyCharge = "0.00";
                    prod.headerPanel.oneTimeCharge = "0.00";
                }
                console.log("subscriberProductsTabAPI---here---subsProduct.name-->", subsProduct.name);
                if (subsProduct.productPrice != null) {
                    subsProduct.productPrice.forEach(element => {
                        if (element != null && element.priceType == "RC" && element.price != null && element.price.taxIncludedAmount.value != 0) {
                            prod.headerPanel.monthlyCharge = element.price.taxIncludedAmount.value + " " + element.price.taxIncludedAmount.unit;
                        }
                        else if (element != null && element.priceType == "NRC" && element.price != null && element.price.taxIncludedAmount.value != 0) {
                            prod.headerPanel.oneTimeCharge = element.price.taxIncludedAmount.value + " " + element.price.taxIncludedAmount.unit;
                        }
                        if (element.productPriceAlteration != null && element.productPriceAlteration.length != 0)
                            console.log("element.productPriceAlteration[0].type", element.productPriceAlteration[0]['@type'])
                        if (element.productPriceAlteration != null && element.productPriceAlteration.length != 0 && element.productPriceAlteration[0] != null && element.productPriceAlteration[0]['@type'] == "DISCOUNT") {
                            prod.headerPanel.tag = 'DISCOUNT';
                            let content = {};
                            if (element.productPriceAlteration[0] != null) {
                                content.label = element.productPriceAlteration[0].description;
                                content.layout = "horizontal";
                                content.attributes = [];
                                let attr = {
                                    "name": "DISCOUNT AMOUNT",
                                    "value": element.productPriceAlteration[0].price.discountAmount.value + ' ' + element.productPriceAlteration[0].price.discountAmount.unit
                                };
                                content.attributes.push(attr);
                                prod.contentPanel.push(content);
                            }
                        }
                        if (element.productPriceAlteration != null && element.productPriceAlteration.length != 0 && element.productPriceAlteration[0]['@type'] == "INSTALMENT" && element.productPriceAlteration[0].instalment != null) {
                            prod.headerPanel.tag = 'INSTALMENT';
                            let content = {};
                            content.label = element.productPriceAlteration[0].name;
                            content.layout = "horizontal";
                            content.attributes = [];
                            //prod.installmentId = element.productPriceAlteration[0].instalment.id;
                            if (element.productPriceAlteration[0].instalment.upfrontPayment != null && element.productPriceAlteration[0].instalment.upfrontPayment.size != 0 && element.productPriceAlteration[0].instalment.upfrontPayment.value != null) {
                                let attr = {
                                    "name": "UPFRONT PAYMENT",
                                    "value": element.productPriceAlteration[0].instalment.upfrontPayment.value + ' ' + element.productPriceAlteration[0].instalment.upfrontPayment.unit
                                };
                                content.attributes.push(attr);
                            }
                            if (installments != null && installments.length != 0) {
                                installments.filter(ele => element.productPriceAlteration[0].instalment.id == ele.id && ele.remainingPeriod != null && ele.remainingPeriod != undefined).forEach(ele => {
                                    //console.log("element in products -----", element)
                                    product.forEach(pro => {
                                        console.log("element in products ---items--", ele.duration.amount, ele.remainingPeriod);
                                        console.log("element in products ---amount--", ele.instalmentOption.totalPriceForInstalmentOption, ele.pendingAmount);
                                        let paidDuration = 0;
                                        paidDuration = parseInt(ele.duration.amount) - element.remainingPeriod;
                                        let remaingAmount = 0;
                                        remaingAmount = parseInt(ele.instalmentOption.totalPriceForInstalmentOption) - element.pendingAmount;
                                        let attr = {
                                            "name": "PAID INSTALLMENT",
                                            "value": paidDuration + " " + pro.instalmentDurationUnits + " (" + remaingAmount + " " + element.pendingAmountUnits + ")",
                                        };
                                        content.attributes.push(attr);
                                    })
                                })
                            }
                            // if (element.productPriceAlteration[0].instalment.instalmentAmount != null && element.productPriceAlteration[0].instalment.instalmentAmount.value != null) {
                            //     let attr = {
                            //         "name": "PAID INSTALLMENT",
                            //         "value": element.productPriceAlteration[0].instalment.instalmentAmount.value + ' ' + element.productPriceAlteration[0].instalment.instalmentAmount.unit,
                            //     };
                            //     content.attributes.push(attr);
                            // }
                            if (element.productPriceAlteration[0].instalment.instalmentAmount != null && element.productPriceAlteration[0].instalment.instalmentAmount.value != null) {
                                let attr = {
                                    "name": "MONTHLY INSTALLMENT",
                                    "value": element.productPriceAlteration[0].instalment.instalmentAmount.value + ' ' + element.productPriceAlteration[0].instalment.instalmentAmount.unit,
                                };
                                content.attributes.push(attr);
                            }
                            if (element.productPriceAlteration[0].instalment.lastInstalmentRevision != null && element.productPriceAlteration[0].instalment.lastInstalmentRevision.value != null) {
                                let attr = {
                                    "name": "LAST INSTALLMENT",
                                    "value": element.productPriceAlteration[0].instalment.lastInstalmentRevision.value + ' ' + element.productPriceAlteration[0].instalment.lastInstalmentRevision.unit,
                                };
                                content.attributes.push(attr);
                            }
                            prod.contentPanel.push(content);
                        }
                    });
                }
                //Simple Attributes
                let content = {};
                content.layout = "horizontal";
                content.attributes = [];
                if (subsProduct.productCharacteristic != null) {
                    subsProduct.productCharacteristic.forEach(element => {
                        if (element.name != undefined && element.name != "" && element.name != null) {
                            let attr = {
                                "name": element.name,
                                "value": element.value
                            };
                            content.attributes.push(attr);
                        }
                    })
                }
                if (subsProduct.productCharacteristicForm != null) {
                    //SimpleAttributes
                    subsProduct.productCharacteristicForm.productCharacteristicGroup.filter(group => group.formTypeInGroup == 'Simple').forEach(group => {
                        group.productSpecificationCharacteristic.forEach(element => {
                            if (element != null && element.label != null) {
                                let attr = {
                                    "name": element.label,
                                    "value": element.productSpecCharacteristicValue[0].value
                                };
                                content.attributes.push(attr);
                            }
                        })
                    })

                    if (content != null && content.attributes.length != 0)
                        prod.contentPanel.push(content);

                    //ComplexAttributes
                    subsProduct.productCharacteristicForm.productCharacteristicGroup.filter(group => group.formTypeInGroup == 'Composite').forEach(group => {
                        let content = {};
                        content.layout = "table";
                        content.attributes = [];
                        content.tableHeader = [];
                        let valuemap = {};
                        content.groupId = group.id;
                        group.productSpecificationCharacteristic.forEach(element => {
                            if (element != null && element.label != null) {
                                if (!content.tableHeader.includes(element.label)) {
                                    content.tableHeader.push(element.label);
                                }
                                valuemap[element.label] = element.productSpecCharacteristicValue[0].value[0];
                            }
                        })
                        console.log("valueMAp--->", JSON.stringify(valuemap))
                        content.attributes.push(valuemap);
                        if (content != null && content.length != 0) {
                            let added = false;
                            prod.contentPanel.filter(con => con.groupId == content.groupId).forEach(cont => {
                                added = true;
                                content.attributes.forEach(attr => {
                                    cont.attributes.push(attr);
                                })
                            })
                            if (!added)
                                prod.contentPanel.push(content);
                        }
                    })
                }
                console.log("subscriberProductsTabAPI---here---subsProduct.contracts-->", subsProduct.name);
                if (contracts != null && contracts.length != 0) {
                    let content = {};
                    content.layout = "horizontal";
                    content.attributes = [];
                    contracts.forEach(element => {
                        console.log("contracts in products -----");
                        if (element.appliedOnEntity.id == subsProduct.id) {
                            prod.headerPanel.tag = 'CONTRACT';
                            content.label = element.name;
                            let attr = {
                                "name": "REMAINING CONTRACT DURATION",
                                "value": element.remainingContractDuration.amount + " " + element.remainingContractDuration.units
                            };
                            content.attributes.push(attr);
                            let attr1 = {
                                "name": "CONTRACT START DATE",
                                "value": forDate(element.validFor.startDateTime)
                            };
                            content.attributes.push(attr1);
                            let attr2 = {
                                "name": "CONTRACT END DATE",
                                "value": forDate(element.validFor.endDateTime)
                            };
                            content.attributes.push(attr2);
                        }
                    });
                    if (content != null && content.attributes.length != 0)
                        prod.contentPanel.push(content);
                }
                productList.push(prod);
            } catch (e) {
                console.log("error in prod cons---->", prod.productName, e);
            }
        })
        console.log("productList----------->", JSON.stringify(productList));
        return productList;
    },


    //API:/getServiceIdentifer/subscriberapp
    getServiceIdentifier: function (serviceResponse, param) {
        let subs = [];
        console.log("getServiceIdentifer ------------------------------------->", serviceResponse)
        if (serviceResponse.responseObject != null) {
            serviceResponse.responseObject.forEach(ele => {
                let response = {};
                Object.keys(ele).forEach(element => {
                    console.log("element:: res", ele[element]);
                    if (element != 'relatedEntity')
                        response[element] = ele[element];
                    else {
                        ele[element].forEach(ite => {
                            let arr = ite.split(":");
                            console.log("arr--->", arr);
                            if (arr[0] == 'id' && arr[1] != param) {
                                response['subscriberId'] = arr[1];
                            } else if (arr[0] != 'id')
                                response[arr[0]] = arr[1];
                        })
                    }
                })
                subs.push(response)
            })

        }
        serviceResponse.responseObject = subs;
        serviceResponse.header = [];
        serviceResponse.externalLinkAttr = {};
        serviceResponse.externalLinkAttr = { 'id': 'subscriberId' };
        serviceResponse.header.push({ "id": "name", "label": "Description", "colStyle": "flex: 0 1 200px;" })
        serviceResponse.header.push({ "id": "id", "label": "Identifier", "colStyle": "flex: 0 1 200px;" });
        console.log("getServiceIdentifer ---serviceResponse---------------------------------->", serviceResponse)
        return serviceResponse;
    },

    //API:/getServiceIdentifer/subscriberapp
    getAddtionalServiceIdentifier: function (serviceResponse, param) {
        let subs = [];
        if (serviceResponse != null && serviceResponse.responseObject != null) {
            serviceResponse.responseObject.forEach(ele => {
                let response = {};
                Object.keys(ele).forEach(element => {
                    console.log("element:: res", ele[element]);
                    if (element != 'relatedEntity')
                        response["add_" + element] = ele[element];
                    else {
                        ele[element].forEach(ite => {
                            let arr = ite.split(":");
                            console.log("arr--->", arr);
                            if (arr[0] == 'id' && arr[1] != param) {
                                response["add_" + 'subscriberId'] = arr[1];
                            } else if (arr[0] != 'id')
                                response["add_" + arr[0]] = arr[1];
                        })
                    }
                })
                subs.push(response)
            })
            console.log("getAdditonalServiceIdentifer ------------------------------------->", subs)
        }
        serviceResponse.responseObject = subs;
        serviceResponse.header = [];
        serviceResponse.externalLinkAttr = {};
        serviceResponse.externalLinkAttr = { 'id': 'add_subscriberId' };
        serviceResponse.header.push({ "id": "add_name", "label": "Description", "colStyle": "flex: 0 1 150px;" })
        serviceResponse.header.push({ "id": "add_id", "label": "Identifier", "colStyle": "flex: 0 1 150px;" });
        serviceResponse.header.push({ "id": "add_type", "label": "Type", "colStyle": "flex: 0 1 150px;" });
        console.log("getServiceIdentifer ---serviceResponse---------------------------------->", serviceResponse)
        return serviceResponse;
    },
    //API:/getActiveInstalmentsContextMenu
    getActiveInstalmentsContextMenu: function (response) {
        let installment = [];
        let getDateFormat = (value) => {
            var options = { year: 'numeric', month: 'long', day: 'numeric' };
            const d = new Date(value);
            const newDate = d.toLocaleDateString("en-US", options);
            console.log(" getActiveInstalmentsContextMenu:::getDateFormat", newDate);
            return newDate;
        }
        if (response.responseObject != null) {
            response.responseObject.forEach(activeInstallment => {
                let instal = {};
                instal.pendingAmount = "0";
                instal.pendingAmountUnits = "";
                instal.installmentPendingAmount = "0";
                instal.duration = "0";
                instal.installmentAmount = "0.00";
                instal.instalmentAmountCurrency = "";
                instal.lastinstallmentAmount = "0.00";
                instal.lastInstalmentRevisionCurrency = "";
                instal.totalPriceForInstalmentOption = "0.00";
                instal.totalPriceForInstalmentOptionCurrency = "";
                instal.id = activeInstallment.id;
                instal.remainingPeriod = activeInstallment.remainingPeriod;
                instal.productOfferingRefId = "";
                instal.productOfferingRefName = "";

                if (undefined != activeInstallment.validFor && null != activeInstallment.validFor) {
                    instal.endDate = getDateFormat(activeInstallment.validFor.endDateTime);
                    instal.startDate = getDateFormat(activeInstallment.validFor.startDateTime);
                }
                if (activeInstallment.productOfferingRef != null) {
                    instal.productOfferingRefId = activeInstallment.productOfferingRef.id;
                    instal.productOfferingRefName = activeInstallment.productOfferingRef.name;
                }
                if (activeInstallment.pendingAmount != null) {
                    instal.pendingAmount = activeInstallment.pendingAmount.value + " " + activeInstallment.pendingAmount.unit;
                    instal.pendingAmountUnits = activeInstallment.pendingAmount.unit;
                    instal.installmentPendingAmount = activeInstallment.pendingAmount.value;
                }
                if (null != activeInstallment.instalmentOption && undefined != activeInstallment.instalmentOption.duration && null != activeInstallment.instalmentOption.duration) {
                    instal.duration = activeInstallment.instalmentOption.duration.amount + " " + activeInstallment.instalmentOption.duration.units;
                }

                if (null != activeInstallment.instalmentOption && activeInstallment.instalmentOption.instalmentAmount != null) {
                    instal.installmentAmount = activeInstallment.instalmentOption.instalmentAmount.value + " " + activeInstallment.instalmentOption.instalmentAmount.unit;
                    instal.instalmentAmountCurrency = activeInstallment.instalmentOption.instalmentAmount.unit;
                }
                if (null != activeInstallment.instalmentOption && activeInstallment.instalmentOption.lastInstalmentRevision != null) {
                    instal.lastinstallmentAmount = activeInstallment.instalmentOption.lastInstalmentRevision.value + " " + activeInstallment.instalmentOption.lastInstalmentRevision.unit;
                    instal.lastInstalmentRevisionCurrency = activeInstallment.instalmentOption.lastInstalmentRevision.unit;
                }
                if (null != activeInstallment.instalmentOption && activeInstallment.instalmentOption.totalPriceForInstalmentOption != null) {
                    instal.totalPriceForInstalmentOption = activeInstallment.instalmentOption.totalPriceForInstalmentOption.value + " " + activeInstallment.instalmentOption.totalPriceForInstalmentOption.unit;
                    instal.totalPriceForInstalmentOptionCurrency = activeInstallment.instalmentOption.totalPriceForInstalmentOption.unit;
                }

                installment.push(instal)
                console.log(" getActiveInstalmentsContextMenu:::response::instal", instal);
            })
        }
        response.responseObject = installment;
        return response;
    },

    //API:/subscriberOrderServiceDetails
    subscriberOrderServiceDetails: function (subscriberOrderServiceDetailsFinal) {
        let forDate = (value) => {
            let date = new Date(value);
            return [
                date.getDate(),
                date.toLocaleString('default', { month: 'short' }), //date.toLocaleString('fr', { month: 'short' }),
                date.getFullYear()
            ].join('-');
        }

        let forStatusObj = (status) => {
            for (let item of req.body.statusHeader) {
                if (item.id == status) {
                    return { className: item.className, label: item.display };
                }
            }
        }
        subscriberOrderServiceDetailsFinal.responseObject.orderDetailsMap = new Map();
        // let orderDetailsMap = new Map();
        subscriberOrderServiceDetailsFinal.responseObject.orderDetails.forEach(element => {
            //for formating date
            element.createdDate = forDate(element.createdDate)
            element.requestedDate = forDate(element.requestedDate)
            element.committedDate = forDate(element.committedDate)
            element.lastUpdatedDate = forDate(element.lastUpdatedDate)
            element.requestedCancellationDate = forDate(element.requestedCancellationDate)
            //for assigning class to status
            // let dummy = forClassName(element.status)
            // console.log("asdfasdfasdf:",forStatusObj(element.status));
            element.statusObj = forStatusObj(element.status);
            //this action field will be assigned when action for row is clicked
            element.action = [];
            subscriberOrderServiceDetailsFinal.responseObject.orderDetailsMap[element.id] = element;
            return subscriberOrderServiceDetailsFinal;
        });
    },

    getRelatedSubscriberSummary: function (response) {
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
                subs.userAddress = element.userAddress;
                subs.payerAddress = element.payerAddress;
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
        response.responseObject.contentMap = new Map();
        response.responseObject.contentMap = subscriberList;
        return response;
    }
}
