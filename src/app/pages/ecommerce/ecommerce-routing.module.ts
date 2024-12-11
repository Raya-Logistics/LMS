import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component pages
import { ProductsComponent } from "./products/products.component";
import { ProductDetailComponent } from "./product-detail/product-detail.component";
import { AddProductComponent } from "./add-product/add-product.component";
import { OrdersComponent } from "./orders/orders.component";
import { OrdersDetailsComponent } from "./orders-details/orders-details.component";
import { CustomersComponent } from "./customers/customers.component";
import { CartComponent } from "./cart/cart.component";
import { CheckoutComponent } from "./checkout/checkout.component";
import { SellersComponent } from "./sellers/sellers.component";
import { SellerDetailsComponent } from "./seller-details/seller-details.component";
import { ManualHandlingComponent } from './manual-handling/manual-handling.component';
import { HandlingInComponent } from './handling-in/handling-in.component';
import { HandlingOutComponent } from './handling-out/handling-out.component';
import { checkForOpenedShiftGuardGuard } from './guards/check-for-opened-shift-guard.guard';
import { OperationManagerComponent } from './operation-manager/operation-manager.component';
import { TransactionSummeryComponent } from './transaction-summery/transaction-summery.component';
import { StockComponent } from './stock/stock.component';
import { HandlingOutPrintComponent } from './handling-out-print/handling-out-print.component';
import { WarehouseQueueComponent } from './warehouse-queue/warehouse-queue.component';
import { HandlingScannerComponent } from './handling-scanner/handling-scanner.component';
import { GatesHandlerComponent } from './gates-handler/gates-handler.component';
import { checkTransactionStatusGuard } from './guards/check-transaction-status.guard';
import { HandlerGatesUpgradeComponent } from './handler-gates-upgrade/handler-gates-upgrade.component';
import { InspectionComponent } from './inspection/inspection.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { YardLocationComponent } from './yard-location/yard-location.component';
import { PrepareComponent } from './prepare/prepare.component';
import { YardStockComponent } from './yard-stock/yard-stock.component';
import { OrderRunnerSheetComponent } from './order-runner-sheet/order-runner-sheet.component';

const routes: Routes = [
  {
    path: "warehousequeue",
    component: WarehouseQueueComponent,
    canActivate: [checkForOpenedShiftGuardGuard]
  },
  {
    path: "handlingscanner",
    component: HandlingScannerComponent,
    canActivate: [checkForOpenedShiftGuardGuard]
  },
  {
    path: "handlingin",
    component: HandlingInComponent,
    canActivate: [checkForOpenedShiftGuardGuard]
  },
  {
    path: "handlingout",
    component: HandlingOutComponent,
    canActivate: [checkForOpenedShiftGuardGuard]
  },
  {
    path: "handlingIn/:transactionNumber",
    component: HandlingInComponent,
    canActivate: [checkForOpenedShiftGuardGuard, checkTransactionStatusGuard]
  },
  // {
  //   path: "handlingIn/:qrCode",
  //   component: HandlingInComponent,
  //   canActivate: [checkForOpenedShiftGuardGuard]
  // },
  {
    path: "handlingOut/:transactionNumber",
    component: HandlingOutComponent,
    canActivate: [checkForOpenedShiftGuardGuard]
  },
  {
    path: "handlingOutPrint",
    component: HandlingOutPrintComponent
  }
  ,
  // {
  //   path: "gateshandler",
  //   component: GatesHandlerComponent
  // },
  {
    path: "inspection",
    component: InspectionComponent
  },
  {
    path: "confirm",
    component: ConfirmComponent
  },
  {
    path: "gateshandler",
    component: HandlerGatesUpgradeComponent
  },
  {
    path: "assignlocation",
    component: YardLocationComponent
  },
  {
    path: "neworder",
    component: OrderRunnerSheetComponent
  },
  {
    path: "getout",
    component: PrepareComponent
  }
  ,
  {
    path: "yardstock",
    component: YardStockComponent
  },
  {
    path: "operationmanager",
    component: OperationManagerComponent,
    canActivate: [checkForOpenedShiftGuardGuard]
  },
  {
    path: "transactionSummery",
    component: TransactionSummeryComponent
  },
  {
    path: "run",
    component: OrderRunnerSheetComponent
  },
  {
    path: "stock",
    component: StockComponent
  },
  {
    path: "products",
    component: ProductsComponent
  },
  {
    path: "manualHandling",
    component: ManualHandlingComponent
  },
  {
    path: "product-detail/:any",
    component: ProductDetailComponent
  },
  {
    path: "add-product",
    component: AddProductComponent
  },
  {
    path: "orders",
    component: OrdersComponent
  },
  {
    path: "order-details",
    component: OrdersDetailsComponent
  },
  {
    path: "customers",
    component: CustomersComponent
  },
  {
    path: "cart",
    component: CartComponent
  },
  {
    path: "checkout",
    component: CheckoutComponent
  },
  {
    path: "sellers",
    component: SellersComponent
  },
  {
    path: "seller-details",
    component: SellerDetailsComponent
  }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EcommerceRoutingModule {}
