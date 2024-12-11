import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgbToastModule
} from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDropdownModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Feather Icon
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { CountUpModule } from 'ngx-countup';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { SimplebarAngularModule } from 'simplebar-angular';
// Apex Chart Package
import { NgApexchartsModule } from 'ng-apexcharts';
// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';


//Module
import { DashboardsRoutingModule } from "./dashboards-routing.module";
import { SharedModule } from '../../shared/shared.module';
import { WidgetModule } from '../../shared/widget/widget.module';


// Component
import { AnalyticsComponent } from './analytics/analytics.component';
import { CrmComponent } from './crm/crm.component';
import { CryptoComponent } from './crypto/crypto.component';
import { ProjectsComponent } from './projects/projects.component';
import { NftComponent } from './nft/nft.component';
import { JobComponent } from './job/job.component';

//Dev Express
import { DevExtremeModule, DxCheckBoxModule } from 'devextreme-angular';
import { DxDataGridModule, DxSelectBoxModule, DxButtonModule } from 'devextreme-angular';
import { HttpClientModule } from '@angular/common/http';
import { PositioncolumnComponent } from './positioncolumn/positioncolumn.component';
import { PositiondirectionComponent } from './positiondirection/positiondirection.component';
import { PositionlevelComponent } from './positionlevel/positionlevel.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { StoragetypeComponent } from './storagetype/storagetype.component';
import { UserswarehousesComponent } from './userswarehouses/userswarehouses.component';
import { AisleComponent } from './aisle/aisle.component';
import { PositionComponent } from './position/position.component';
import { LocationComponent } from './location/location.component';
import { ItemComponent } from './item/item.component';
import { BarcodeComponent } from './barcode/barcode.component';
import { TransactionWayComponent } from './transaction-way/transaction-way.component';
import { QrcodeComponent } from './qrcode/qrcode.component';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from "ngx-spinner";
import { YardStockComponent } from './dashboard/yard-stock/yard-stock.component';


@NgModule({
  declarations: [
    AnalyticsComponent,
    CrmComponent,
    CryptoComponent,
    ProjectsComponent,
    NftComponent,
    JobComponent,
    PositioncolumnComponent,
    PositiondirectionComponent,
    PositionlevelComponent,
    WarehouseComponent,
    StoragetypeComponent,
    UserswarehousesComponent,
    AisleComponent,
    PositionComponent,
    LocationComponent,
    ItemComponent,
    BarcodeComponent,
    TransactionWayComponent,
    QrcodeComponent,
    YardStockComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgbToastModule,
    FeatherModule.pick(allIcons),
    CountUpModule,
    LeafletModule,
    NgbDropdownModule,
    NgbNavModule,
    SimplebarAngularModule,
    NgApexchartsModule,
    SlickCarouselModule,
    FlatpickrModule.forRoot(),
    DashboardsRoutingModule,
    SharedModule,
    WidgetModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    DevExtremeModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxButtonModule,
    HttpClientModule,
    DxCheckBoxModule,
    NgxSpinnerModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardsModule { }
