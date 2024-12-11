import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component pages
import { CalendarComponent } from './calendar/calendar/calendar.component';
import { MonthGridComponent } from './calendar/month-grid/month-grid.component';
import { ChatComponent } from "./chat/chat.component";
import { MailboxComponent } from "./mailbox/mailbox.component";
import { WidgetsComponent } from "./widgets/widgets.component";
import { EmailBasicComponent } from "./email/email-basic/email-basic.component";
import { EmailEcommerceComponent } from "./email/email-ecommerce/email-ecommerce.component";
import { FileManagerComponent } from "./file-manager/file-manager.component";
import { TodoComponent } from "./todo/todo.component";
import { ApikeyComponent } from './apikey/apikey.component';
import { CompanyoptionComponent } from './companyoption/companyoption.component';
import { CompanyComponent } from './company/company.component';
import { CustomerComponent } from './customer/customer.component';
import { CompanysettingComponent } from './companysetting/companysetting.component';
import { UsersCompanyComponent } from './users-company/users-company.component';
import { StockDetailsTypeComponent } from './stock-details-type/stock-details-type.component';
import { UnitOfMeasureComponent } from './unit-of-measure/unit-of-measure.component';
import { BrandComponent } from './brand/brand.component';
import { CategoryComponent } from './category/category.component';
import { MasterunitComponent } from './masterunit/masterunit.component';
import { ItemComponent } from '../dashboards/item/item.component';
import { PriceListComponent } from './price-list/price-list.component';
import { ShiftAttributeComponent } from './shift-attribute/shift-attribute.component';
import { ShiftSellingPriceComponent } from './shift-selling-price/shift-selling-price.component';
import { ShiftTypeComponent } from './shift-type/shift-type.component';
import { ShiftComponent } from './shift/shift.component';
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';
import { DockComponent } from './dock/dock.component';
import { TruckTypeComponent } from './truck-type/truck-type.component';
import { VendorComponent } from './vendor/vendor.component';
import { PalletCategoryComponent } from './pallet-category/pallet-category.component';
import { ShiftConfigurationComponent } from './shift-configuration/shift-configuration.component';
import { HolidayComponent } from './holiday/holiday.component';
import { UserConfigurationComponent } from './user-configuration/user-configuration.component';
import { AllShiftConfigurationComponent } from './all-shift-configuration/all-shift-configuration.component';
import { WarehouseConfigurationComponent } from './warehouse-configuration/warehouse-configuration.component';
import { MasterDataConfigurationComponent } from './master-data-configuration/master-data-configuration.component';
import { CompanyConfigurationComponent } from './company-configuration/company-configuration.component';
import { PriceListUpgradeComponent } from './price-list-upgrade/price-list-upgrade.component';

const routes: Routes = [
  {
    path: "calendar",
    component: CalendarComponent
  },
  {
    path: "dock",
    component: DockComponent
  },
  {
    path: "userconfiguration",
    component: UserConfigurationComponent
  },
  {
    path: "shiftconfiguration",
    component: AllShiftConfigurationComponent
  },
  {
    path: "pricelistupgrade",
    component: PriceListUpgradeComponent
  },
  {
    path: "warehouse",
    component: WarehouseConfigurationComponent
  },
  {
    path: "masterdata",
    component: MasterDataConfigurationComponent
  },
  {
    path: "company",
    component: CompanyConfigurationComponent
  },
  {
    path: "trucktype",
    component: TruckTypeComponent
  },
  {
    path: "shiftAtribute",
    component: ShiftAttributeComponent
  },
  {
    path: "shiftSellingPrice",
    component: ShiftSellingPriceComponent
  },
  {
    path: "shiftType",
    component: ShiftTypeComponent
  },
  {
    path: "shift",
    component: ShiftComponent
  },
  {
    path: "holiday",
    component: HolidayComponent
  },
  {
    path: "shiftConfiguration",
    component: ShiftConfigurationComponent
  },
  {
    path: "UserPermissions",
    component: UserPermissionsComponent
  },
  {
    path: "companySetting",
    component: CompanysettingComponent
  },
  {
    path: "companyUsers",
    component: UsersCompanyComponent
  },
  // {
  //   path: "company",
  //   component: CompanyComponent
  // },
  {
    path: "vendor",
    component: VendorComponent
  },
  {
    path: "customers",
    component: CustomerComponent
  },
  {
    path: "palletCategory",
    component: PalletCategoryComponent
  },
  {
    path: "pricelist",
    component: PriceListComponent
  },
  {
    path: "item",
    component: ItemComponent
  },
  {
    path: "companyOption",
    component: CompanyoptionComponent
  },
  {
    path: "stockdetailstype",
    component: StockDetailsTypeComponent
  },
  {
    path: "unitofmeasure",
    component: UnitOfMeasureComponent
  },
  {
    path: "brand",
    component: BrandComponent
  },
  {
    path: "category",
    component: CategoryComponent
  },
  {
    path: "masterunit",
    component: MasterunitComponent
  },
  {
    path: "chat",
    component: ChatComponent
  },
  {
    path: "mailbox",
    component: MailboxComponent
  },
  {
    path: "widgets",
    component: WidgetsComponent
  },
  {
    path: "email-basic",
    component: EmailBasicComponent
  },
  {
    path: "email-ecommerce",
    component: EmailEcommerceComponent
  },
  {
    path: "file-manager",
    component: FileManagerComponent
  },
  {
    path: "todo",
    component: TodoComponent
  },
  {
    path: "apikey",
    component: ApikeyComponent
  },
  {
    path: "month-grid",
    component: MonthGridComponent
  },
  {
    path: 'jobs', loadChildren: () => import('./jobs/jobs.module').then(m => m.JobsModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsRoutingModule { }
