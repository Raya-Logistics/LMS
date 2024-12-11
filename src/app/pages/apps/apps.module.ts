import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbTooltipModule, NgbDropdownModule, NgbTypeaheadModule, NgbAccordionModule, NgbProgressbarModule, NgbNavModule, NgbPaginationModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

// search module
import { NgPipesModule } from 'ngx-pipes';

// Feather Icon
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';

// Calendar package
import { FullCalendarModule } from '@fullcalendar/angular';
// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';
// Simplebar
import { SimplebarAngularModule } from 'simplebar-angular';
// Ck Editer
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
// Counter
import { CountUpModule } from 'ngx-countup';
// Apex Chart Package
import { NgApexchartsModule } from 'ng-apexcharts';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

// Routing
import { JobsModule } from './jobs/jobs.module';

// Emoji Picker
import { PickerModule } from '@ctrl/ngx-emoji-mart';

//  Drag and drop
import { DndModule } from 'ngx-drag-drop';

// Drag and Droup Row
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';

// Select Droup down
import { NgSelectModule } from '@ng-select/ng-select';

// Component Pages
import { AppsRoutingModule } from "./apps-routing.module";
import { SharedModule } from '../../shared/shared.module';
import { ChatComponent } from './chat/chat.component';
import { MailboxComponent } from './mailbox/mailbox.component';
import { WidgetsComponent } from './widgets/widgets.component';
import { EmailBasicComponent } from './email/email-basic/email-basic.component';
import { EmailEcommerceComponent } from './email/email-ecommerce/email-ecommerce.component';

// Sorting page
import { NgbdApikeySortableHeader } from './apikey/apikey-sortable.directive';

// Load Icon
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

import { DatePipe } from '@angular/common';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { TodoComponent } from './todo/todo.component';
import { MonthGridComponent } from './calendar/month-grid/month-grid.component';
import { CalendarComponent } from './calendar/calendar/calendar.component';

import { SortByPipe } from '../apps/sort-by.pipe';
import { ApikeyComponent } from './apikey/apikey.component';

// Mask
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask, IConfig } from 'ngx-mask';

// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CompanyoptionComponent } from './companyoption/companyoption.component';

//Dev Express
import { DevExtremeModule, DxCheckBoxModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { DxDataGridModule, DxSelectBoxModule, DxButtonModule } from 'devextreme-angular';
import { HttpClientModule } from '@angular/common/http';
import { CompanyComponent } from './company/company.component';
import { CustomerComponent } from './customer/customer.component';
import { CompanysettingComponent } from './companysetting/companysetting.component';
import { UsersCompanyComponent } from './users-company/users-company.component';
import { StockDetailsTypeComponent } from './stock-details-type/stock-details-type.component';
import { UnitOfMeasureComponent } from './unit-of-measure/unit-of-measure.component';
import { BrandComponent } from './brand/brand.component';
import { CategoryComponent } from './category/category.component';
import { MasterunitComponent } from './masterunit/masterunit.component';
import { ItemComponent } from './item/item.component';
import { PriceListComponent } from './price-list/price-list.component';
import { ShiftAttributeComponent } from './shift-attribute/shift-attribute.component';
import { ShiftSellingPriceComponent } from './shift-selling-price/shift-selling-price.component';
import { ShiftTypeComponent } from './shift-type/shift-type.component';
import { ShiftComponent } from './shift/shift.component';
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DockComponent } from './dock/dock.component';
import { TruckTypeComponent } from './truck-type/truck-type.component';
import { VendorComponent } from './vendor/vendor.component';
import { PalletCategoryComponent } from './pallet-category/pallet-category.component';
import { ShiftConfigurationComponent } from './shift-configuration/shift-configuration.component';
import { DialogModule } from 'primeng/dialog';
import { HolidayComponent } from './holiday/holiday.component';
import { UserConfigurationComponent } from './user-configuration/user-configuration.component';
import { NgxSpinnerModule } from "ngx-spinner";
import { AllShiftConfigurationComponent } from './all-shift-configuration/all-shift-configuration.component';
import { WarehouseConfigurationComponent } from './warehouse-configuration/warehouse-configuration.component';
import { MasterDataConfigurationComponent } from './master-data-configuration/master-data-configuration.component';
import { CompanyConfigurationComponent } from './company-configuration/company-configuration.component';
import { PriceListUpgradeComponent } from './price-list-upgrade/price-list-upgrade.component';

@NgModule({
  declarations: [
    ChatComponent,
    MailboxComponent,
    WidgetsComponent,
    EmailBasicComponent,
    EmailEcommerceComponent,
    FileManagerComponent,
    TodoComponent,
    SortByPipe,
    ApikeyComponent,
    NgbdApikeySortableHeader,
    MonthGridComponent,
    CalendarComponent,
    CompanyoptionComponent,
    CompanyComponent,
    CustomerComponent,
    CompanysettingComponent,
    UsersCompanyComponent,
    StockDetailsTypeComponent,
    UnitOfMeasureComponent,
    BrandComponent,
    CategoryComponent,
    MasterunitComponent,
    ItemComponent,
    PriceListComponent,
    ShiftAttributeComponent,
    ShiftSellingPriceComponent,
    ShiftTypeComponent,
    ShiftComponent,
    UserPermissionsComponent,
    DockComponent,
    TruckTypeComponent,
    VendorComponent,
    PalletCategoryComponent,
    ShiftConfigurationComponent,
    HolidayComponent,
    UserConfigurationComponent,
    AllShiftConfigurationComponent,
    WarehouseConfigurationComponent,
    MasterDataConfigurationComponent,
    CompanyConfigurationComponent,
    PriceListUpgradeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbAccordionModule,
    NgbProgressbarModule,
    NgbNavModule,
    NgbPaginationModule,
    NgbCollapseModule,
    NgPipesModule,
    FeatherModule.pick(allIcons),
    FullCalendarModule,
    FlatpickrModule.forRoot(),
    SimplebarAngularModule,
    CKEditorModule,
    CountUpModule,
    NgApexchartsModule,
    LeafletModule,
    AppsRoutingModule,
    SharedModule,
    PickerModule,
    DndModule,
    DragDropModule,
    MatTableModule,
    NgSelectModule,
    NgbTypeaheadModule,
    JobsModule,
    SlickCarouselModule,
    NgxMaskDirective, NgxMaskPipe,
    DevExtremeModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxButtonModule,
    HttpClientModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxTextBoxModule,
    DialogModule,
    NgxSpinnerModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  providers: [
    provideNgxMask(),
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppsModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
