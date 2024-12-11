// import { Component, AfterViewInit, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import * as QRCode from 'qrcode';
// import { GlobalComponent } from 'src/app/global-component';
// import { ApihandlerService } from 'src/app/services/apihandler.service';
// @Component({
//   selector: 'app-qrcode',
//   templateUrl: './qrcode.component.html',
//   styleUrls: ['./qrcode.component.scss']
// })
// export class QrcodeComponent {
//   @Input() barcodeValues: string[] = [];
//   @ViewChildren('barcode') barcodeElements!: QueryList<ElementRef>;
//   barcodeData: any[] = []; // Array to hold the API response for each barcode

//   constructor(private route: ActivatedRoute, private _apihandler:ApihandlerService) {}

//   ngOnInit(): void {
//     this.route.params.subscribe(params => {
//       this.barcodeValues = params['code'].split(","); // array of values
//       const queuesId = this.barcodeValues.map((q => Number(q.split("-")[2])));
//       queuesId.forEach((queueId, index) => {
//         this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.NAME}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.GET_BY_ID_WITH_INCLUDING}/${queueId}`).subscribe(
//           response => {
//             if (response.success) {
//               const data = response.returnObject;
//               this.barcodeData[index] = data; // Save the response data corresponding to the barcode index
//               console.log('Data for barcode index', index, data);
//               this.generateQRCodes();
//             }
//           },
//           error => {
//             console.error('API call failed for queueId:', queueId, error);
//           }
//         );
//       });
//     });
//   }

//   ngAfterViewInit(): void {
//     this.generateQRCodes();
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['barcodeValues'] && !changes['barcodeValues'].isFirstChange()) {
//       this.generateQRCodes();
//     }
//   }

//   generateQRCodes(): void {
//     if (this.barcodeValues && this.barcodeElements) {
//       this.barcodeElements.forEach((barcodeElement, index) => {
//         QRCode.toCanvas(barcodeElement.nativeElement, this.barcodeValues[index], {
//           width: 150, // Adjust the size as needed
//           margin: 1
//         }, (error:any) => {
//           if (error) console.error(error);
//         });
//       });
//     }
//   }
// }
// // import { Component, AfterViewInit, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
// // import { ActivatedRoute } from '@angular/router';
// // import * as QRCode from 'qrcode';
// // import { GlobalComponent } from 'src/app/global-component';
// // import { ApihandlerService } from 'src/app/services/apihandler.service';

// // @Component({
// //   selector: 'app-qrcode',
// //   templateUrl: './qrcode.component.html',
// //   styleUrls: ['./qrcode.component.scss']
// // })
// // export class QrcodeComponent implements AfterViewInit, OnChanges {
// //   @Input() barcodeValues: string[] = [];
// //   @ViewChildren('barcode') barcodeElements!: QueryList<ElementRef>;
// //   barcodeData: any[] = []; // Array to hold the API response for each barcode

// //   constructor(private route: ActivatedRoute, private _apihandler: ApihandlerService) {}

// //   ngOnInit(): void {
// //     this.route.params.subscribe(params => {
// //       this.barcodeValues = params['code'].split(","); // array of values
// //       const queuesId = this.barcodeValues.map((q => Number(q.split("-")[2])));
// //       queuesId.forEach((queueId, index) => {
// //         this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.NAME}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.GET_BY_ID_WITH_INCLUDING}/${queueId}`).subscribe(
// //           response => {
// //             if (response.success) {
// //               const data = response.returnObject;
// //               this.barcodeData[index] = data; // Save the response data corresponding to the barcode index
// //               console.log('Data for barcode index', index, data);
// //               this.generateQRCodes();
// //             }
// //           },
// //           error => {
// //             console.error('API call failed for queueId:', queueId, error);
// //           }
// //         );
// //       });
// //     });
// //   }

// //   ngAfterViewInit(): void {
// //     this.generateQRCodes();
// //   }

// //   ngOnChanges(changes: SimpleChanges): void {
// //     if (changes['barcodeValues'] && !changes['barcodeValues'].isFirstChange()) {
// //       this.generateQRCodes();
// //     }
// //   }

// //   generateQRCodes(): void {
// //     if (this.barcodeValues && this.barcodeElements) {
// //       this.barcodeElements.forEach((barcodeElement, index) => {
// //         QRCode.toCanvas(barcodeElement.nativeElement, this.barcodeValues[index], {
// //           width: 150, // Adjust the size as needed
// //           margin: 1
// //         }, (error: any) => {
// //           if (error) console.error(error);
// //           // Call the print function after the QR code is generated
// //           if (index === this.barcodeElements.length - 1) {
// //             this.openPrintDialog();
// //           }
// //         });
// //       });
// //     }
// //   }

// //   openPrintDialog(): void {
// //     setTimeout(() => {
// //       window.print();
// //     }, 500); // Timeout to ensure QR codes are rendered before printing
// //   }
// // }
import { Component, AfterViewInit, Input, OnChanges, SimpleChanges, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as QRCode from 'qrcode';
import * as JsBarcode from 'jsbarcode';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.scss']
})
export class QrcodeComponent implements AfterViewInit, OnChanges {
  @Input() barcodeValues: string[] = [];
  @ViewChildren('qrcode') qrCodeElements!: QueryList<ElementRef>;
  @ViewChildren('barcode') barcodeElements!: QueryList<ElementRef>;
  barcodeData: any[] = []; // Array to hold the API response for each barcode

  constructor(private route: ActivatedRoute, private _apihandler: ApihandlerService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.barcodeValues = params['code'].split(","); // array of values
      const queuesId = this.barcodeValues.map(q => Number(q.split("-")[2]));
      queuesId.forEach((queueId, index) => {
        this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.NAME}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.GET_BY_ID_WITH_INCLUDING}/${queueId}`).subscribe(
          response => {
            if (response.success) {
              const data = response.returnObject;
              this.barcodeData[index] = data; // Save the response data corresponding to the barcode index
              console.log('Data for barcode index', index, data);
              this.generateCodes(); // Generate both QR and barcodes
            }
          },
          error => {
            console.error('API call failed for queueId:', queueId, error);
          }
        );
      });
    });
  }

  ngAfterViewInit(): void {
    this.generateCodes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['barcodeValues'] && !changes['barcodeValues'].isFirstChange()) {
      this.generateCodes();
    }
  }
  separateArabicCharacters(value: string): { letters: string, numbers: string } {
    const letters = value.match(/[\u0600-\u06FF]+/g)?.join('') || ''; // Match Arabic characters
    const numbers = value.replace(/[\u0600-\u06FF]+/g, ''); // Remove Arabic characters
    return { letters, numbers };
  }
  generateCodes(): void {
    if (this.barcodeValues && this.qrCodeElements && this.barcodeElements) {
      this.qrCodeElements.forEach((qrCodeElement, index) => {
        // Generate QR Code
        QRCode.toCanvas(qrCodeElement.nativeElement, this.barcodeValues[index], {
          width: 150,
          margin: 1
        }, (error: any) => {
          if (error) console.error(error);
        });

        // Generate Barcode
        const barcodeElement = this.barcodeElements.toArray()[index]; // Access the barcode element at the same index
        JsBarcode(barcodeElement.nativeElement, this.barcodeValues[index], {
          format: 'CODE128',
          displayValue: true
        });
      });
    }
  }
}
