import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDropdownModule, NgbNavModule, NgbAccordionModule, NgbRatingModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

// Mask
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask, IConfig } from 'ngx-mask'

// Range Slider
import { NgxSliderModule } from 'ngx-slider-v2';
// Simple bar
import { SimplebarAngularModule } from 'simplebar-angular';
// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

// Ck Editer
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
// File Uploads
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';
// Ng Select
import { NgSelectModule } from '@ng-select/ng-select';

// Apex Chart Package
import { NgApexchartsModule } from 'ng-apexcharts';
// Count
import { CountUpModule } from 'ngx-countup';

// Load Icon
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

// Component Pages
import { EcommerceRoutingModule } from './ecommerce-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ProductsComponent } from './products/products.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { AddProductComponent } from './add-product/add-product.component';
import { OrdersComponent } from './orders/orders.component';
import { OrdersDetailsComponent } from './orders-details/orders-details.component';
import { CustomersComponent } from './customers/customers.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SellersComponent } from './sellers/sellers.component';
import { SellerDetailsComponent } from './seller-details/seller-details.component';
import { NgbdProductsSortableHeader } from './products/products-sortable.directive';
import { NgbdOrdersSortableHeader } from './orders/orders-sortable.directive';
import {NgbdCustomerSortableHeader} from './customers/customers-sortable.directive';
import {NgbdSellersSortableHeader} from './seller-details/seller-details-sortable.directive'
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';

import { DatePipe } from '@angular/common';
import { ManualHandlingComponent } from './manual-handling/manual-handling.component';
import { HandlingInComponent } from './handling-in/handling-in.component';
import { HandlingOutComponent } from './handling-out/handling-out.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OperationManagerComponent } from './operation-manager/operation-manager.component';
import { DevExtremeModule, DxCheckBoxModule } from 'devextreme-angular';
import { DxDataGridModule, DxSelectBoxModule, DxButtonModule } from 'devextreme-angular';
import { TransactionSummeryComponent } from './transaction-summery/transaction-summery.component';
import { StockComponent } from './stock/stock.component';
import { HandlingOutPrintComponent } from './handling-out-print/handling-out-print.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { WarehouseQueueComponent } from './warehouse-queue/warehouse-queue.component';
import { HandlingScannerComponent } from './handling-scanner/handling-scanner.component';
import { NgxSpinnerModule } from "ngx-spinner";
import { GatesHandlerComponent } from './gates-handler/gates-handler.component';
import { HandlerGatesUpgradeComponent } from './handler-gates-upgrade/handler-gates-upgrade.component';
import { InspectionComponent } from './inspection/inspection.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { YardLocationComponent } from './yard-location/yard-location.component';
import { PrepareComponent } from './prepare/prepare.component';
import { YardStockComponent } from './yard-stock/yard-stock.component';
import { OrderRunnerSheetComponent } from './order-runner-sheet/order-runner-sheet.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: 'https://httpbin.org/post',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};

@NgModule({
  declarations: [
    ProductsComponent,
    ProductDetailComponent,
    AddProductComponent,
    OrdersComponent,
    OrdersDetailsComponent,
    CustomersComponent,
    CartComponent,
    CheckoutComponent,
    SellersComponent,
    SellerDetailsComponent,
    NgbdProductsSortableHeader,
    NgbdOrdersSortableHeader,
    NgbdCustomerSortableHeader,
    NgbdSellersSortableHeader,
    ManualHandlingComponent,
    HandlingInComponent,
    HandlingOutComponent,
    OperationManagerComponent,
    TransactionSummeryComponent,
    StockComponent,
    HandlingOutPrintComponent,
    WarehouseQueueComponent,
    HandlingScannerComponent,
    GatesHandlerComponent,
    HandlerGatesUpgradeComponent,
    InspectionComponent,
    ConfirmComponent,
    YardLocationComponent,
    PrepareComponent,
    YardStockComponent,
    OrderRunnerSheetComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbRatingModule,
    NgbTooltipModule,
    NgxSliderModule,
    SimplebarAngularModule,
    SlickCarouselModule,
    CKEditorModule,
    DropzoneModule,
    FlatpickrModule.forRoot(),
    NgSelectModule,
    NgApexchartsModule,
    CountUpModule,
    EcommerceRoutingModule,
    SharedModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgMultiSelectDropDownModule.forRoot(),
    TabViewModule,
    DropdownModule,
    DevExtremeModule,
    DxSelectBoxModule,
    DxDataGridModule,
    DxCheckBoxModule,
    DxButtonModule,
    DialogModule,
    ButtonModule,
    NgxSpinnerModule
  ],
  providers: [
    provideNgxMask(),
    DatePipe,
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EcommerceModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
