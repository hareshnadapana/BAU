import { Component, OnInit, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { currentEnv, endPoint, urlNav } from 'app/URL';
import { MatPaginator } from '@angular/material/paginator';
import * as moment from 'moment';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {
  @ViewChild(MatPaginator) paginatorManual: MatPaginator;
  @ViewChild('fieldComponent', { read: ViewContainerRef })
  fieldComponent!: ViewContainerRef;
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    this.paginatorManual = value;
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  OrderHistoryForm:FormGroup = this.builder.group({
    search: [, { updateOn: "change" }],
  })
  // displayedDocumentColumns: string[] = ['tick', 'customerCategory', 'outletid', 'orderdate', 'orderdetails'];
  displayedDocumentColumns: string[] = ['customerCategory','id','createdDate','requestedDate','committedDate','lastUpdatedDate'];
  checkboxFormArray: Array<any> = [];
  checkboxFormState: Array<any> = [];
  isAll: boolean;
  isSelected: boolean;
  orderEnable: boolean;
  docsResponseDuplicate: any[];
  dataSource : MatTableDataSource<any>;
  orderHistoryDummyData: any[] = [
    {
      "orderId": "0125454545",
      "outletId": "99974",
      "orderDate": "11/01/2022 03:14:32",
      "details": "One plans",
      "isSelect": false
    },
    {
      "orderId": "0147878784",
      "outletId": "99974",
      "orderDate": "11/01/2022 03:14:32",
      "details": "Two Bundle",
      "isSelect": false
    },
    {
      "orderId": "0164578457",
      "outletId": "99974",
      "orderDate": "11/01/2022 03:14:32",
      "details": "Two Bundle",
      "isSelect": false
    },
    {
      "orderId": "0123434343",
      "outletId": "99974",
      "orderDate": "11/01/2022 03:14:32",
      "details": "Protege Voice",
      "isSelect": false
    },
    {
      "orderId": "014784354",
      "outletId": "99974",
      "orderDate": "11/01/2022 03:14:32",
      "details": "100MBps plan",
      "isSelect": false
    },
    {
      "orderId": "0132245362",
      "outletId": "99974",
      "orderDate": "11/01/2022 03:14:32",
      "details": "50MBps plan",
      "isSelect": false
    },
    {
      "orderId": "0162675346",
      "outletId": "99974",
      "orderDate": "11/01/2022 03:14:32",
      "details": "Protege Voice",
      "isSelect": false
    },
    {
      "orderId": "0194426485",
      "outletId": "99974",
      "orderDate": "11/01/2022 03:14:32",
      "details": "One Bundle",
      "isSelect": false
    }
  ]
  orderHistorySummaryMockResponse: any[];
    
  constructor(private router:Router, private http: HttpClient, private builder: FormBuilder) {}

  ngOnInit(): void {
    this.orderEnable = true;
    // this.dataSource = new MatTableDataSource(this.orderHistoryDummyData);
    this.Api();
  }

  back() {
    window.location.href = `${currentEnv}${urlNav.frontofficehome}`;
  }

  orderHistory(element) {
    console.log("element orderHistory :", element);
    window.location.href = `${currentEnv}${urlNav.frontofficeorderlineview}?orderId=${element.salesOrderRef.id}&customerid=${element.accountRef.id}`;
    // window.location.href = "https://10.8.44.4:20103/frontoffice/#/order-summary/orderLineId?orderId=O36625067";
  }

  Api() {
    const body = {
      mock: true
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' :'application/json',
        'buId': 'DEFAULT' ,
        'opId': 'HOB' ,
        'userId':'wolve_test'
      })
    };

    const responseObject = {
      "paginationDetails": {
        "size": "200",
        "from": "0",
        "totalElements": "1"
      },
      "orderDetails": [
        {
          "@baseType": "Order",
          "@schemaLocation": "http://example.com",
          "@type": "SalesOrder",
          "orderTriggerReason": "NewSale",
          "customerCategory": "B2B",
          "createdDate": "2021-08-24T14:15:22Z",
          "requestedDate": "2021-10-24T14:15:22Z",
          "committedDate": "2021-10-24T14:15:22Z",
          "lastUpdatedDate": "2021-08-24T14:15:22Z",
          "href": "/salesorder/Sales-Order-000001",
          "id": "Sales-Order-000001",
          "primaryOffer": {
            "@type": "ProductOffering",
            "href": "/productOffering/HobsMobilePlan",
            "id": "HobsMobilePlan",
            "name": "HobsMobilePlan"
          },
          "requestedCancellationDate": "2023-08-24T14:15:22Z",
          "status": "IN_PROGRESS",
          "subStatus": "ShippingConfirmationPending",
          "mode": "BulkOrder",
          "orderType": "New",
          "createdBy": "1120112",
          "triggeredBy": "11021012",
          "channel": "CSelf",
          "place": {
            "@type": "City",
            "href": "/place/City/Chennai",
            "id": "Chennai",
            "name": "Chennai"
          },
          "relatedParty": [
            {
              "@type": "Customer",
              "href": "/customer/E-Customer-00001",
              "id": "E-Customer-00001",
              "name": "Natural-salon",
              "role": "Customer"
            }
          ],
          "accountRef": {
            // "id": "EA00000001",
            "id": "C44513385",
            "href": "/account/EA00000001",
            "description": "Party Account for Customer Naturals , ECustomer-00000001",
            "name": "Naturals",
            "@type": "AccountRef",
            "@referredType": "Account"
          },
          "salesOrderRef": {
            "@baseType": "string",
            "@referredType": "string",
            "@schemaLocation": "http://example.com",
            "@type": "SalesOrder",
            "href": "/salesOrder/SalesOrder-0000001",
            // "id": "SalesOrder-0000001",
            "id": "O10474460",
            "name": "SalesOrder-0000001"
          },
          "agreementRef": {
            "@baseType": "string",
            "@referredType": "string",
            "@schemaLocation": "http://example.com",
            "@type": "Agreement",
            "href": "/agreement/Agr-0001",
            "id": "Agr-0001",
            "name": "MSA Agreement"
          },
          "priority": "10"
        }
      ]
    }
    this.orderHistorySummaryMockResponse = responseObject.orderDetails;
    this.dataSource = new MatTableDataSource(responseObject.orderDetails);

    this.http.post<any>(endPoint.getOrderList, body, httpOptions).subscribe(result => {
      if (result) return;
    })
  }

  handleChangeDate(date: any) {
    return date ? moment(date).format('DD/MM/YYYY') : date;
  }
  
  onSearch() {
    if (this.OrderHistoryForm.get('search').value) {
      let searchResult: any;
      searchResult = this.orderHistoryDummyData.filter(element => {
        ///
        return element.orderlist == this.OrderHistoryForm.get('search').value;
      });
      this.dataSource = new MatTableDataSource(searchResult);
      this.dataSource.paginator = this.paginatorManual;
    } else {
      this.dataSource= new MatTableDataSource(this.orderHistoryDummyData);
      this.dataSource.paginator = this.paginatorManual;
    }
  }

  pageChangeEvent(event: any){
    console.log("next page event :", event);
  }

  onChange(checker:string, isChecked:boolean, checkerAll: any){
    if(isChecked) {
      this.checkboxFormArray.push(checker);

      this.orderHistoryDummyData.forEach(element => {
        if (element.numberlist === checkerAll){
          element.isSelect = true;
        }
        return element;
      });

      if (!this.isAll && this.checkboxFormArray.length === this.orderHistoryDummyData.length) {
        this.isAll= true;
      }
    } else {
      let index = this.checkboxFormArray.indexOf(checker);
      this.checkboxFormArray.splice(index,1);

      this.orderHistoryDummyData.forEach(element => {
        if (element.numberlist === checkerAll) {
          element.isSelect= false;
        }
        return element;
      });

      if (this.isAll && this.checkboxFormArray.length != this.orderHistoryDummyData.length){
        this.isAll=false;
      }
    }
    this.orderEnable = this.checkboxFormArray.length > 0 ? false : true;
  }

  onAll(checker: string, isChecked: boolean, checkerAll: any) {
    if (isChecked) {
      if (this.checkboxFormArray.length > 0) {
        for(let i=0; i<checker.length; i++) {
          let index = this.checkboxFormArray.indexOf(checker[i]);
          this.checkboxFormArray.splice(index,1);
        }
      }

      for (let i=0;i<checker.length; i++) {
        this.checkboxFormArray.push(checker[i]);
        this.orderHistoryDummyData.forEach(element =>{

          if (element.numberlist === checkerAll[i].numberlist) {
            element.isSelect = true;
          }
          return element;
        });
      }
      this.isAll = true;
    } else {
      for (let i=0;i<checker.length; i++){
        let index = this.checkboxFormArray.indexOf(checker[i]);
        this.checkboxFormArray.splice(index,1);

        this.orderHistoryDummyData.forEach(element => {
          if (element.numberlist === checkerAll[i].numberlist){
            element.isSelect = false;
          }
          return element;
        });
      }
      this.isAll = false;
    }
    this.orderEnable = this.checkboxFormArray.length > 0 ? false : true;
  }
}