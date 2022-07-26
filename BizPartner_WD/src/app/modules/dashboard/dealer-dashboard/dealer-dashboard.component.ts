import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexTitleSubtitle,
  ApexLegend,
  ApexTooltip,
  ApexGrid,
  ApexFill,
  ApexMarkers,
  ApexAnnotations,
  ApexPlotOptions,
  ApexNoData
} from "ng-apexcharts";
import { series } from './dealer-dashboard-graph-data';
import { capitalize } from 'lodash';
import { UserDataService } from 'app/service/user/user-data.service';
import { currentEnv, endPoint, urlNav } from 'app/URL';
import { HttpClient } from '@angular/common/http';
import { loadingFalse, loadingTrue } from 'app/root-store.actions';
import { Store } from '@ngrx/store';

export type ChartOptions = {
  series: ApexAxisChartSeries,
  chart: ApexChart,
  xaxis: ApexXAxis,
  stroke: ApexStroke,
  dataLabels: ApexDataLabels,
  yaxis: ApexYAxis,
  title: ApexTitleSubtitle,
  labels: string[],
  legend: ApexLegend,
  tooltip: ApexTooltip,
  grid: ApexGrid,
  fill: ApexFill,
  markers: ApexMarkers,
  annotations: ApexAnnotations,
  plotOptions: ApexPlotOptions,
  noData: ApexNoData
}

@Component({
  selector: 'app-dealer-dashboard',
  templateUrl: './dealer-dashboard.component.html',
  styleUrls: ['./dealer-dashboard.component.scss']
})
export class DealerDashboardComponent implements OnInit  {
  @ViewChild("chart") chart: ChartComponent;
  public dealerIncentivechartOptions: Partial<ChartOptions>;
  public salesPerformancechartOptions: Partial<ChartOptions>;
  userFullName: string = 'Wolve Test';
  incentivesData: any[];
  incentivesGraphData: any[];

  constructor(private router: Router, private userFullData: UserDataService, private http: HttpClient, private store: Store) {
    this.salesPerformancechartOptions = {
      series: [{
        name: 'Sales',
        data: series.monthDataSeries1.prices,
      }],
      chart: {
        type: 'area',
        height: 255,
        width: '100%',
        zoom: { enabled: false },
        toolbar: { show: false },
        redrawOnParentResize: true,
        redrawOnWindowResize: true,
        foreColor: '#E6E6E6',
        sparkline: { enabled: false },
      },
      fill: {
        colors: ['#038BC5'],
        type: 'solid',
        opacity: 1
      },
      dataLabels: { enabled: false },
      title: {
        text: 'Sales Performance',
        margin: 30,
        style: {
          fontSize: '20px',
          fontWeight: 500
        }
      },
      stroke: { curve: "smooth", width: 1, colors: ['#cccccc'] },
      markers: {
        size: 4,
        strokeWidth: 1,
        colors: ['#164396']
      },
      xaxis: {
        type: 'datetime',
        tooltip: { enabled: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        floating: false,
        labels: {
          show: true,
          format: 'MMM yyyy',
        }
      },
      yaxis: { show: false, axisBorder: { show: false }, axisTicks: { show: false } },
      legend: { show: false },
      tooltip: {
        enabled: true,
        theme: 'dark',
        x: { show: true },
        marker: { show: false }
      },
      grid: {
        show: true,
        xaxis: { lines: { show: true }},
        strokeDashArray: 0,
        borderColor: '#49b9e9',
        position: 'front',
        padding: { left: 0, right: 0, top: 0, bottom: 0 }
      },
    }
  }

  ngOnInit(): void {
    this.getUser();
    this.getIncentives();
    this.constructIncentiveChart();
  }

  constructIncentiveChart() {
    this.dealerIncentivechartOptions = {
      series: [{
        name: 'Incentive',
        data: [],
      }],
      chart: {
        type: 'area',
        height: 255,
        width: '100%',
        zoom: { enabled: false },
        toolbar: { show: false },
        redrawOnParentResize: true,
        redrawOnWindowResize: true,
        foreColor: '#CCCCCC',
        sparkline: { enabled: false }
      },
      noData: {
        text: 'Loading...',
        align: 'center',
        verticalAlign: 'middle'
      },
      fill: {
        colors: ['#03286b'],
        type: 'solid',
        opacity: 1
      },
      dataLabels: { enabled: false },
      title: {
        text: 'Dealer Incentives',
        margin: 30,
        style: {
          fontSize: '20px',
          fontWeight: 500
        }
      },
      stroke: { curve: "smooth", width: 1 },
      markers: {
        size: 4,
        strokeWidth: 1,
        colors: ['#164396']
      },
      xaxis: {
        // type: 'datetime',
        // tooltip: { enabled: false },
        // axisBorder: { show: false },
        // axisTicks: { show: false },
        // floating: false,
        // labels: {
        //   show: true,
        //   format: 'MMMM yyyy'
        // }
      },
      yaxis: { show: false, axisBorder: { show: false }, axisTicks: { show: false } },
      legend: { show: false },
      tooltip: {
        enabled: true,
        theme: 'dark',
        x: { show: true },
        marker: { show: false },
      },
      grid: {
        show: true,
        xaxis: { lines: { show: true ,  offsetX: 5, offsetY: 5}},
        strokeDashArray: 0,
        borderColor: '#1d4692',
        position: 'front',
        padding: { left: 30, right: 5, top: 0, bottom: 0 }
      },
    };
  }

  getIncentives() {
    this.store.dispatch(loadingTrue());
    const incentivesParams = {
      months: 6,
      vendorId: '931771'
    }
    this.http.post<any>(endPoint.getIncentives, incentivesParams).subscribe(result => {
      if (result) {
        this.incentivesData = result;
        this.changeDataToGraph();
        this.store.dispatch(loadingFalse());
      }
    }, (error => {
      console.error(error);
      this.store.dispatch(loadingFalse());
    }))
  }

  changeDataToGraph() {
    const data = [];
    this.incentivesData?.forEach((id) => {
      let splitMonth = id.month.split(" ")[0].substring(0,3);
      const individualData = { x: splitMonth + " " + id.month.split(" ")[1], y: id.totalIncentive}
      data.push(individualData);
    })
    this.incentivesGraphData = data;
   
    this.dealerIncentivechartOptions.series = [{
      data: data
    }]
  }

  getUser() {
    this.userFullData.user.subscribe(result => {
      let firstName = result?.retrieveDealerOutput?.listOfCelRetrieveDealerProfileResponse?.partnerContact[0].firstName.toLowerCase();
      let lastName = result?.retrieveDealerOutput?.listOfCelRetrieveDealerProfileResponse?.partnerContact[0].lastName.toLowerCase();
      this.userFullName = firstName && lastName ? `${capitalize(firstName)} ${capitalize(lastName)}` : 'Wolve Test';
    })
  }

  navigateTo(type: string, params: any) {
    if (type === 'frontoffice') {
      window.location.href = `${currentEnv}${urlNav.frontofficehome}`;
    }else if (type === 'NewRegistration') {
      window.location.href = `${currentEnv}${urlNav.frontofficenewreg}`;
    }else if (type === 'MNPPortIn') {
      window.location.href = `${currentEnv}${urlNav.frontofficeportin}`;
    }else if (type === 'BlackList' || type === 'ReserveNumber' || type === 'OrderHistory' || type === 'Incentives' ) {
      this.router.navigate([params]);
       //this.router.navigate([url], { queryParams: params });
    }
    else if (type === 'SearchCustomer') {
      
        window.location.href = `${currentEnv}${urlNav.frontofficesearchcust}`;
        //https://10.8.44.4:20103/frontoffice/#/customer/searchCustomer
      }

    // else if (type === 'ReserveNumber') {
    //   //this.router.navigate(['/check/reserveselection']);
    //    this.router.navigate([params]);
    // }else if (type === 'OrderHistory') {
    //   // this.router.navigate([url], { queryParams: params });
    // }
    else if (type === 'standalone') {
      // this.router.navigate([url], { queryParams: params });
    }

    
  }
}