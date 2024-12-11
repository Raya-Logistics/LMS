import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component Pages
import { AnalyticsComponent } from "./analytics/analytics.component";
import { CrmComponent } from "./crm/crm.component";
import { CryptoComponent } from "./crypto/crypto.component";
import { ProjectsComponent } from "./projects/projects.component";
import { NftComponent } from "./nft/nft.component";
import { JobComponent } from './job/job.component';
import { PositioncolumnComponent } from './positioncolumn/positioncolumn.component';
import { PositiondirectionComponent } from './positiondirection/positiondirection.component';
import { PositionlevelComponent } from './positionlevel/positionlevel.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { StoragetypeComponent } from './storagetype/storagetype.component';
import { UserswarehousesComponent } from './userswarehouses/userswarehouses.component';
import { AisleComponent } from './aisle/aisle.component';
import { PositionComponent } from './position/position.component';
import { LocationComponent } from './location/location.component';
import { BarcodeComponent } from './barcode/barcode.component';
import { TransactionWayComponent } from './transaction-way/transaction-way.component';
import { QrcodeComponent } from './qrcode/qrcode.component';

const routes: Routes = [
  {
    path: "analytics",
    component: AnalyticsComponent
  },
  {
    path: "crm",
    component: CrmComponent
  },
  {
    path: "aisle",
    component: AisleComponent
  },
  {
    path: "location",
    component: LocationComponent
  },
  { path: 'barcode/:code', component: BarcodeComponent },
  { path: 'qrcode/:code', component: QrcodeComponent },
  {
    path: "position",
    component: PositionComponent
  },
  {
    path: "positioncolumn",
    component: PositioncolumnComponent
  },
  {
    path: "positiondirection",
    component: PositiondirectionComponent
  },
  {
    path: "positionlevel",
    component: PositionlevelComponent
  },
  // {
  //   path: "warehouse",
  //   component: WarehouseComponent
  // },
  {
    path: "storagetype",
    component: StoragetypeComponent
  },
  {
    path: "warehouseUser",
    component: UserswarehousesComponent
  },
  {
    path: "transactionWay",
    component: TransactionWayComponent
  },
  {
    path: "crypto",
    component: CryptoComponent
  },
  {
    path: "projects",
    component: ProjectsComponent
  },
  {
    path: "nft",
    component: NftComponent
  },
  {
    path: "job",
    component: JobComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DashboardsRoutingModule { }
