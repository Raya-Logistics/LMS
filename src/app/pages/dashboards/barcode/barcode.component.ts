import { Component, AfterViewInit, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode',
  templateUrl: './barcode.component.html',
  styleUrls: ['./barcode.component.scss']
})
export class BarcodeComponent implements AfterViewInit, OnChanges {
  @Input() barcodeValues: string[] = [];
  @ViewChildren('barcode') barcodeElements!: QueryList<ElementRef>;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.barcodeValues = params['code'].split(","); // array of values
      console.log(this.barcodeValues);
      this.generateBarcodes();
    });
  }

  ngAfterViewInit(): void {
    this.generateBarcodes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['barcodeValues'] && !changes['barcodeValues'].isFirstChange()) {
      this.generateBarcodes();
    }
  }

  generateBarcodes(): void {
    if (this.barcodeValues && this.barcodeElements) {
      this.barcodeElements.forEach((barcodeElement, index) => {
        JsBarcode(barcodeElement.nativeElement, this.barcodeValues[index], {
          format: 'CODE128',
          displayValue: true
        });
      });
    }
  }
}