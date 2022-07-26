
module.exports = {

    //API:/getProductDetailsList
    getProductItemCustomizationDetailsOrderProfile: function (productItemList) {
        let orderItemList = [];
        let forDate = (value) => {
            let date = new Date(value);
            return [
                date.getDate(),
                date.toLocaleString('default', { month: 'short' }), //date.toLocaleString('fr', { month: 'short' }),
                date.getFullYear()
            ].join('-');
        }

        productItemList.forEach(product => {
            console.log("productItemList---here---gg-->", product);

            //let header = {};
            product.productOrderItem.forEach(ele => {
                try { 
                    let item = { "headerPanel": {}, "contentPanel": [] };
                    console.log("productItemList---here---product-->", product);
                    console.log("productItemList---here---product.name-->", ele);
                    item.headerPanel.productName = ele.product.description;
                    item.headerPanel.productAction = ele.actionDescription;
                    if (ele.actionDescription == "Added") {
                        item.headerPanel.color = 'bg-green-500 text-white';
                    }
                    else if (ele.actionDescription == "Modified") {
                        item.headerPanel.color = 'bg-green-350 text-white';
                    }
                    else if (ele.actionDescription == "Deleted") {
                        item.headerPanel.color = 'bg-red-500 text-white';
                    }
                    else if (ele.actionDescription == "Retained") {
                        item.headerPanel.color = 'bg-green-350 text-white';
                    }
                    else if (ele.actionDescription == "Suspended") {
                        item.headerPanel.color = 'bg-orange-350 text-white';
                    }
                    else if (ele.actionDescription == "Resumed") {
                        item.headerPanel.color = 'bg-amber-350 text-white';
                    }

                    item.headerPanel.monthlyCharge = "0.00";    
                        item.headerPanel.oneTimeCharge = "0.00"; 
                        
                    //pricing data
                    // if (ele.itemPrice['@type'] != 'DISCOUNT' && ele.itemPrice['@type'] != 'Discount') {
                    //     item.headerPanel.monthlyCharge = "0.00";    
                    //     item.headerPanel.oneTimeCharge = "0.00";    
                    // }
                    if (ele.itemPrice != null) {
                        ele.itemPrice.forEach(price => {
                            console.log("price in :::", price)
                            if (price != null && price.priceType == "RC" && price.price != null && price.price.taxIncludedAmount.value != 0) {
                                if(price.priceAlteration != null && price.priceAlteration != undefined){
                                    price.priceAlteration.forEach(alternative=>{
                                        console.log("alternative price RC:::",alternative);
                                        if(alternative.price.taxIncludedAmount != null){
                                            item.headerPanel.monthlyCharge = alternative.price.taxIncludedAmount.value + ' ' + alternative.price.taxIncludedAmount.unit;
                                        }
                                    })
                                }else{
                                    item.headerPanel.monthlyCharge = price.price.taxIncludedAmount.value + ' ' + price.price.taxIncludedAmount.unit;
                                }
                            
                            }
                            else if (price != null && price.priceType == "NRC" && price.price != null && price.price.taxIncludedAmount.value != 0) {
                                if(price.priceAlteration != null && price.priceAlteration != undefined){
                                    price.priceAlteration.forEach(alternative=>{
                                        console.log("alternative price NRC:::",alternative);
                                        if(alternative.price.taxIncludedAmount != null){
                                            item.headerPanel.oneTimeCharge = alternative.price.taxIncludedAmount.value + ' ' + alternative.price.taxIncludedAmount.unit;
                                        }
                                    })
                                }else{
                                    item.headerPanel.oneTimeCharge = price.price.taxIncludedAmount.value + ' ' + price.price.taxIncludedAmount.unit;
                                }
                            }
                            if (price.priceAlteration != null && price.priceAlteration.length != 0)
                            console.log("price.priceAlteration[0].type", price.priceAlteration[0]['@type'])
                        if (price!=null && price.priceAlteration != null && price.priceAlteration.length != 0 && price.priceAlteration[0] != null && price.priceAlteration[0]['@type'] == "DISCOUNT") {
                            item.headerPanel.tag = 'DISCOUNT';
                            let content = {};
                            if (price.priceAlteration[0] != null) {
                                content.label = price.priceAlteration[0].name;
                                content.layout = "horizontal";
                                content.attributes = [];
                                let attr = {
                                    "name": "DISCOUNT AMOUNT",
                                    "value": price.priceAlteration[0].price.discountAmount.value + ' ' + price.priceAlteration[0].price.discountAmount.unit
                                };
                                content.attributes.push(attr);
                                item.contentPanel.push(content);
                            }
                        }

                        });

                    }

                    //startdate enddate data
                    if (ele.itemTerm != null) {
                        ele.itemTerm.forEach(date => {
                            item.headerPanel.activeSince = forDate(date.validFor.startDateTime);
                            item.headerPanel.endDate = forDate(date.validFor.endDateTime);
                        })
                    }

                    console.log("item level::::", item.headerPanel);
//Simple Attributes
let content = {};
content.layout = "horizontal";
content.attributes = [];
                if (ele.product.productCharacteristic != null) {
                    ele.product.productCharacteristic.forEach(element => {
                        if (element.name != undefined && element.name != "" && element.name != null) {
                            let attr = {
                                "name": element.name,
                                "value": element.value
                            };
                            content.attributes.push(attr);
                        }
                    })
                }
                if (ele.product.productCharacteristicForm != null) {
                    // console.log("entering to product form::::",ele.product.productCharacteristicForm)
                    //SimpleAttributes
                    let content = {};
                content.layout = "horizontal";
                content.attributes = [];
                if(ele.product.productCharacteristicForm.productCharacteristicGroup != null){
                    ele.product.productCharacteristicForm.productCharacteristicGroup.filter(group => group.formTypeInGroup == 'Simple').forEach(group => {
                        // console.log("enetring to fromingroup:::",group)
                        group.productSpecificationCharacteristic.forEach(element => {
                            // console.log("enetring to productSpecificationCharacteristic:::",element)
                            if (element != null && element.label != null) {
                                let attr = {
                                    "name": element.label,
                                    "value": element.productSpecCharacteristicValue[0].value[0]
                                };
                                content.attributes.push(attr);
                            }
                        })
                    })
                }
                    

                    if (content != null && content.attributes.length != 0)
                    item.contentPanel.push(content);

                    //ComplexAttributes
                    if(ele.product.productCharacteristicForm.productCharacteristicGroup != null){
                    ele.product.productCharacteristicForm.productCharacteristicGroup.filter(group => group.formTypeInGroup == 'Composite').forEach(group => {
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
                                if(element.productSpecCharacteristicValue[0].value != null  && element.productSpecCharacteristicValue[0].value != undefined){
                                    valuemap[element.label] = element.productSpecCharacteristicValue[0].value[0];

                                }
                            }
                        })
                        console.log("valueMAp--->", JSON.stringify(valuemap))
                        content.attributes.push(valuemap);
                        if (content != null && content.length != 0) {
                            let added = false;
                            item.contentPanel.filter(con => con.groupId == content.groupId).forEach(cont => {
                                added = true;
                                content.attributes.forEach(attr => {
                                    cont.attributes.push(attr);
                                })
                            })
                            if (!added)
                            item.contentPanel.push(content);
                        }
                    })
                }
                }
                    // if (ele.product.productCharacteristic != null) {
                    //     ele.product.productCharacteristic.forEach(type => {
                    //         // console.log("type::: as simple:::",type);
                    //         if(type.valueType == "Simple"){
                    //             if (type != null && type.label != null) {
                    //                 let attr = {
                    //                     "name": type.label,
                    //                     "value": type.value
                    //                 };
                    //                 content.attributes.push(attr);
                    //             }
                    //         }

                    //     })
                    // }
                    orderItemList.push(item);
                }
                catch (e) {
                    console.log("error in orderitem cons---->", e)
                }
            })

            console.log("orderItemList:::::", orderItemList);

        })

        console.log("orderItemList----------->", JSON.stringify(orderItemList));
        return orderItemList;


    }
}
