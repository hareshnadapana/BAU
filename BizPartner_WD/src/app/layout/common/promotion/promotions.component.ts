import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { Observable, Subject } from 'rxjs';
// import * as moment from 'moment';
// import { takeUntil } from 'rxjs/operators';
// import { PromotionsStoreActions, PromotionsStoreSelectors } from '../../root-store/promotions-store';
// import { ContextStoreSelectors, RootStoreState, SubscriberServicesOffersActions, SubscriberServicesOffersSelectors } from 'src/app/root-store';
// import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
// import { StatusList } from '../../shared/models/status/statuslist';
// import { Status } from '../../shared/models/status/status';
// import { OffersNew } from '../../shared/models/services_offers/offersnew';
// import { ServiceSelectionRouterService } from '../../shared/services/serviceselectionrouter.service';
// import { EligibleOffersResponse } from '../../shared/models/services_offers/eligibleoffersResponse';
// import { QualificationCriteria } from '../../shared/models/services_offers/addtocartrequest';





@Component({
    selector: 'app-promotions',
    templateUrl: './promotions.component.html',
    styleUrls: ['./promotions.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'promotions'
})
export class PromotionsComponent implements OnInit, OnDestroy {

    @ViewChild('promotionsOrigin') private _promotionsOrigin: MatButton;
    @ViewChild('promotionsPanel') private _promotionsPanel: TemplateRef<any>;

    // promotions: PromotionsData[];
    unreadCount: number = 0;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    promotionsData$: Observable<any>;
    eligibleOffers$: Observable<any>;
    promotionsData: any;
    // eligibleOffers: EligibleOffersResponse;
    selectedServiceAttributes: any;
    applicationConstants: any;



    constructor(
        // private store: Store<RootStoreState.State>,
        // private serviceSelectionRouterService: ServiceSelectionRouterService,
        private _overlay: Overlay,
        // private router: Router,
        private _viewContainerRef: ViewContainerRef
    ) {
        // this.store.dispatch(PromotionsStoreActions.promotionsData({ payload: null }));

        // this.promotionsData$ = this.store.select(PromotionsStoreSelectors.selectPromotionsData);


        // this.promotionsData$.subscribe(ele => {
        //     console.log("promotions data::", ele);
        //     if (ele != null) {
        //         this.promotionsData = ele;
        //         this._calculateUnreadCount()
        //     }
        // });


        // this.store.select(ContextStoreSelectors.selectAppConfigJson).subscribe((data: any) => {
        //     if (null != data) {
        //         this.applicationConstants = data.applicationConstants;
        //     }
        // });
        // this.store.select(SubscriberServicesOffersSelectors.selectgetServiceAttributesDetails).subscribe(data => {
        //     if (data != null) {
        //         this.selectedServiceAttributes = data;
        //     }
        // })



    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        if (this._overlayRef) {
            this._overlayRef.dispose();
        }
    }

    openPanel(): void {
        if (!this._overlayRef) {
            this._createOverlay();
        }

        this._overlayRef.attach(new TemplatePortal(this._promotionsPanel, this._viewContainerRef));
    }
    closePanel(): void {
        this._overlayRef.detach();
    }

    private _createOverlay(): void {
        this._overlayRef = this._overlay.create({
            hasBackdrop: true,
            backdropClass: 'fuse-backdrop-on-mobile',
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._promotionsOrigin._elementRef.nativeElement)
                .withLockedPosition(true)
                .withPush(true)
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top'
                    },
                    {
                        originX: 'start',
                        originY: 'top',
                        overlayX: 'start',
                        overlayY: 'bottom'
                    },
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top'
                    },
                    {
                        originX: 'end',
                        originY: 'top',
                        overlayX: 'end',
                        overlayY: 'bottom'
                    }
                ])
        });

        // Detach the overlay from the portal on backdrop click
        this._overlayRef.backdropClick().subscribe(() => {
            this._overlayRef.detach();
        });
    }

    /**
     * Calculate the unread count
     *
     * @private
     */
    private _calculateUnreadCount(): void {
        let count = 0;
        if (this.promotionsData && this.promotionsData.responseObject && this.promotionsData.responseObject.length) {
            count = this.promotionsData.responseObject.length;
        }
        this.unreadCount = count;
        console.log("unreadCount::", this.unreadCount)
    }

    onClickPromotion(promotion) {

        console.log("display promotion", promotion);
        // let qualificationCriteria = new QualificationCriteria();

        // qualificationCriteria.channelID = this.applicationConstants.channelID;
        // qualificationCriteria.customerSegment = "VIP";
        let promotionOffers = new PromotionOffers()
        promotionOffers.channelID = this.applicationConstants.channelID;
        // promotionOffers.qualificationCriteria = qualificationCriteria;
        promotionOffers.requestObject = promotion.id;


        // this.store.select(SubscriberServicesOffersSelectors.selectCartInstanceIdentifier).subscribe(data => promotionOffers.cartInstanceIdentifier = data);
        console.log("promotion offers:", promotionOffers)
        // this.store.dispatch(PromotionsStoreActions.eligibleOffers({ payload: promotionOffers }));
        // this.eligibleOffers$ = this.store.select(PromotionsStoreSelectors.selectEligibleOffers);


        // this.eligibleOffers$.subscribe(ele => {
        //     if (ele != null) {
        //         console.log("eligible Offers", ele);
        //         let responseObject: OffersNew[] = [];
        //         responseObject = this.eligibleOffersfor(ele.responseObject)
        //         this.eligibleOffers = ele;
        //         this.eligibleOffers.responseObject = responseObject;
        //     }
        // });
        // this.store.dispatch(PromotionsStoreActions.eligibleOffersSuccess({ payload: this.eligibleOffers }));
        // this.serviceSelectionRouterService.OfferServiceSelection("MOBILE", false, null);
        // console.log("eligibleOffers::", this.eligibleOffers.responseObject[0].productCategory);


    }
    eligibleOffersfor(eligibleOffersArray) {

        // let eligibleOffRes = new EligibleOffersResponse();
        // let responseStaLis = new StatusList();
        // let stat = new Status();
        // let resObj: OffersNew[] = [];

        // eligibleOffersArray.forEach(eligibleOffers => {
            // resObj.push({
            //     "productSpecID": eligibleOffers.productOfferingID,
            //     "productDesc": eligibleOffers.name,
            //     "label": eligibleOffers.label,
            //     "isPrimary": eligibleOffers.isPrimary,
            //     "isBundle": eligibleOffers.isBundle,
            //     "isCustomerVisible": eligibleOffers.allowedOperationMap.CustomerVisible,
            //     "isAlacarte": eligibleOffers.isAlacarte,
            //     "productType": eligibleOffers.productType,
            //     "productCategory": eligibleOffers.productCategory,
            //     "isCompositeService": null,
            //     "catalogID": eligibleOffers.catalogID,
            //     "defaultState": eligibleOffers.defaultState,
            //     "lifecycleStatus": null,
            //     "productWeight": eligibleOffers.productWeight,
            //     "allowedOperations": eligibleOffers.allowedOperations,
            //     "associatedOfferInstance": [],
            //     "productRecurringCharges": {
            //         "originalAmount": null,
            //         "amount": eligibleOffers.chargeSummary.mapOfCharges.Monthly.taxIncludedAmount,
            //         "currency": eligibleOffers.chargeSummary.mapOfCharges.Monthly.taxIncludedAmount,
            //         "frequency": null,
            //     },
            //     "productNonRecurringCharges": {
            //         "currency": eligibleOffers.chargeSummary.mapOfCharges.OneTime.taxIncludedAmount,
            //         "originalAmount": null,
            //         "amount": eligibleOffers.chargeSummary.mapOfCharges.OneTime.taxIncludedAmount,
            //         "installment": {

            //         }
            //     },
            //     "productSpecCharacteristic": [],
            //     "hasVariantPricing": eligibleOffers.hasVariantPricing,
            //     "numberOfAttributesToBeCaptured": eligibleOffers.numberOfAttributesToBeCaptured,
            //     "isShippingRequired": null,
            //     "isInstalmentEnabled": eligibleOffers.isInstalmentEnabled,
            // })
        // })



        let resObj = [{
            "productSpecID": "123",
            "productDesc": "123",
            "label": "123",
            "isPrimary": "123",
            "isBundle": "123",
            "isCustomerVisible": "123",
            "isAlacarte": "123",
            "productType": "123",
            "productCategory": "123",
            "isCompositeService": null,
            "catalogID": "123",
            "defaultState": "123",
            "lifecycleStatus": null,
            "productWeight": "123",
            "allowedOperations": "123",
            "associatedOfferInstance": [],
            "productRecurringCharges": {
                "originalAmount": null,
                "amount": "123",
                "currency": "123",
                "frequency": null,
            },
            "productNonRecurringCharges": {
                "currency": "123",
                "originalAmount": null,
                "amount": "123",
                "installment": {

                }
            },
            "productSpecCharacteristic": [],
            "hasVariantPricing": "123",
            "numberOfAttributesToBeCaptured": "123",
            "isShippingRequired": null,
            "isInstalmentEnabled": "123",
        }]

        return resObj;
    }
}
export class PromotionOffers {
    // public qualificationCriteria: QualificationCriteria;
    public cartInstanceIdentifier: string;
    public requestObject: string;
    public channelID: string;
}




