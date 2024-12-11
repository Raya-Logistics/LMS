// import { Injectable } from '@angular/core';
// import * as XLSX from 'xlsx';
// import { Workbook } from 'exceljs';
// import {saveAs} from 'file-saver';
// import { exportDataGrid } from 'devextreme/excel_exporter';
// import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
// import jsPDF from 'jspdf';
// // import { jsPDF } from 'jspdf';
// @Injectable({
//   providedIn: 'root'
// })
// export class FilehandlerService {

//   constructor() { }
//   // getjsonDataFromFile(file : any): Promise<any> {
//   //   return new Promise((resolve, reject) => {
//   //     const reader = new FileReader();
      
//   //     reader.onload = (e: any) => {
//   //       const fileContent = e.target.result;
//   //       const binaryString = atob(fileContent.split(',')[1]);
//   //       const arrayBuffer = new ArrayBuffer(binaryString.length);
//   //       const uint8Array = new Uint8Array(arrayBuffer);
//   //       for (let i = 0; i < binaryString.length; i++) {
//   //         uint8Array[i] = binaryString.charCodeAt(i);
//   //       }
        
//   //       const workbook = XLSX.read(arrayBuffer, { type: 'array' });
//   //       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//   //       const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
//   //       // Skip the first row (header)
//   //       const jsonDataWithoutHeader = jsonData.slice(1);

//   //       resolve(jsonDataWithoutHeader);
//   //     };

//   //     reader.onerror = (error) => {
//   //       reject(error);
//   //     };

//   //     reader.readAsDataURL(file);
//   //   });
//   // }
//   // getjsonDataFromFile(file: any): Promise<any> {
//   //   return new Promise((resolve, reject) => {
//   //     const reader = new FileReader();
      
//   //     reader.onload = (e: any) => {
//   //       const arrayBuffer = e.target.result;
//   //       const workbook = XLSX.read(arrayBuffer, { type: 'array' });
//   //       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//   //       const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

//   //       // Skip the first row (header)
//   //       const jsonDataWithoutHeader = jsonData.slice(1);

//   //       resolve(jsonDataWithoutHeader);
//   //     };

//   //     reader.onerror = (error) => {
//   //       reject(error);
//   //     };

//   //     reader.readAsArrayBuffer(file);
//   //   });
//   // }

//   exportGrid(e:any) {
//     if (e.format === 'xlsx') {
//         const workbook = new Workbook(); 
//         const worksheet = workbook.addWorksheet("Main sheet"); 
//         exportDataGrid({ 
//             worksheet: worksheet, 
//             component: e.component,
//         }).then(function() {
//             workbook.xlsx.writeBuffer().then(function(buffer:any) { 
//                 saveAs(new Blob([buffer], { type: "application/octet-stream" }), "DataGrid.xlsx"); 
//             }); 
//         }); 
//     } 
//     else if (e.format === 'pdf') {
//         const doc = new jsPDF();
//         exportDataGridToPdf({
//             jsPDFDocument: doc,
//             component: e.component,
//         }).then(() => {
//             doc.save('DataGrid.pdf');
//         });
//     }
//   }
// }

import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
// import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ApihandlerService } from './apihandler.service';
import { GlobalComponent } from '../global-component';
const BASE_API = GlobalComponent.BASE_API;
const CATEGORY = GlobalComponent.Controllers.CATEGORY.NAME;
const CATEGORY_LOOKUP = GlobalComponent.Controllers.CATEGORY.API_ACTIONS.GET_LOOKUP + '?IsActiveOnly=true';
const BRAND = GlobalComponent.Controllers.BRAND.NAME;
const BRAND_LOOKUP = GlobalComponent.Controllers.BRAND.API_ACTIONS.GET_LOOKUP + '?IsActiveOnly=true';
@Injectable({
  providedIn: 'root'
})
export class FilehandlerService {
  constructor(private _apihandler:ApihandlerService) { }
  exportGrid(e: any, fileName:string) {
    if (e.format === 'xlsx') {
      let data;
    if (e.selectedRowsOnly) {
      data = e.component.getSelectedRowsData();
    } else {
      data = e.component.getDataSource().items();
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Main sheet");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${fileName}.xlsx`);

    } else if (e.format === 'pdf') {
      const doc = new jsPDF();
      exportDataGridToPdf({
        jsPDFDocument: doc,
        component: e.component,
      }).then(() => {
        doc.save(`${fileName}.pdf`);
      });
    }
  }
//   exportGrid2(e: any, fileName: string) {
//     console.log(e, "Export Event");
//     console.log("allData helllllllllo")

//     // Fetch all lookup data in parallel
//     const brandDataPromise = this._apihandler.getStore(`${GlobalComponent.BASE_API}/${BRAND}`, BRAND_LOOKUP, "", "", "", "").load();
//     const categoryDataPromise = this._apihandler.getStore(`${BASE_API}/${CATEGORY}`, CATEGORY_LOOKUP, "", "", "", "").load();
//     const companyDataPromise = this._apihandler.getStore(`${BASE_API}/Company`, 'getAllCompanyLookup', "", "", "", "").load();
//     const palletCategoryDataPromise = this._apihandler.getStore(`${BASE_API}/PalletCategory`, 'GetPalletCategoryLookup?IsActiveOnly=true', "", "", "", "").load();

//     // Wait for all promises to resolve
//     Promise.all([brandDataPromise, categoryDataPromise, companyDataPromise, palletCategoryDataPromise])
//         .then(([brandData, categoryData, companyData, palletCategoryData]) => {
//             console.log({ brandData, categoryData, companyData, palletCategoryData }, "Loaded Lookup Data");

//             // Fetch all grid data
//             const dataSource = e.component.getDataSource();
//             return dataSource.store().load().then((allData: any[]) => {
//                 // Map IDs to text for brand, category, company, and pallet category
//                 const brandLookup = brandData.map((b: any) => ({ id: b.id, name: b.name }));
//                 const categoryLookup = categoryData.map((c: any) => ({ id: c.id, name: c.name }));
//                 const companyLookup = companyData.map((co: any) => ({ id: co.id, name: co.name }));
//                 const palletCategoryLookup = palletCategoryData.map((p: any) => ({ id: p.id, name: p.name }));
//                 // Flatten the data to include names instead of IDs
//                 console.log(allData, " allData")

//                 const flattenedData = allData.flatMap((masterRow: any) => {
//                     const details = masterRow.itemDetails || [];
//                     console.log(details, " details")
//                     console.log(masterRow, " masterRow")

//                     const mappedMasterRow = {
//                         ...masterRow,
//                         brand: brandLookup.find((b: any) => b.id == masterRow.brandId)?.name || '',
//                         category: categoryLookup.find((c: any) => c.id == masterRow.categoryId)?.name || '',
//                         company: companyLookup.find((co: any) => co.id == masterRow.companyId)?.name || '',
//                         palletCategory: palletCategoryLookup.find((p: any) => p.id == masterRow.palletCategoryId)?.name || '',
//                         brandId: undefined, // Remove IDs
//                         categoryId: undefined,
//                         companyId: undefined,
//                         palletCategoryId: undefined,
//                     };

//                     if (details.length > 0) {
//                         return details.map((detail: any) => ({
//                             ...mappedMasterRow,
//                             ...detail,
//                             Details: undefined, // Exclude the raw Details field
//                         }));
//                     } else {
//                         return { ...mappedMasterRow, Details: undefined };
//                     }
//                 });

//                 console.log(flattenedData, "Flattened Data for Export");

//                 // Convert to Excel worksheet
//                 const worksheet = XLSX.utils.json_to_sheet(flattenedData);

//                 // Create workbook
//                 const workbook = XLSX.utils.book_new();
//                 XLSX.utils.book_append_sheet(workbook, worksheet, "Master-Details");

//                 const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//                 saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${fileName}.xlsx`);
//             });
//         })
//         .catch((error: any) => {
//             console.error("Error loading data for export:", error);
//         });
// }

// exportGrid2(e: any, fileName: string) {
//   console.log(e, "Export Event");
//   console.log("allData helllllllllo");

//   // Fetch all lookup data in parallel
//   const brandDataPromise = this._apihandler.getStore(`${GlobalComponent.BASE_API}/${BRAND}`, BRAND_LOOKUP, "", "", "", "").load();
//   const categoryDataPromise = this._apihandler.getStore(`${BASE_API}/${CATEGORY}`, CATEGORY_LOOKUP, "", "", "", "").load();
//   const companyDataPromise = this._apihandler.getStore(`${BASE_API}/Company`, 'getAllCompanyLookup', "", "", "", "").load();
//   const palletCategoryDataPromise = this._apihandler.getStore(`${BASE_API}/PalletCategory`, 'GetPalletCategoryLookup?IsActiveOnly=true', "", "", "", "").load();

//   // Wait for all promises to resolve
//   Promise.all([brandDataPromise, categoryDataPromise, companyDataPromise, palletCategoryDataPromise])
//       .then(([brandData, categoryData, companyData, palletCategoryData]) => {
//           console.log({ brandData, categoryData, companyData, palletCategoryData }, "Loaded Lookup Data");

//           // Fetch all grid data
//           const dataSource = e.component.getDataSource();
//           return dataSource.store().load().then((allData: any[]) => {
//               // Map IDs to text for brand, category, company, and pallet category
//               const brandLookup = brandData.map((b: any) => ({ id: b.id, name: b.name }));
//               const categoryLookup = categoryData.map((c: any) => ({ id: c.id, name: c.name }));
//               const companyLookup = companyData.map((co: any) => ({ id: co.id, name: co.name }));
//               const palletCategoryLookup = palletCategoryData.map((p: any) => ({ id: p.id, name: p.name }));

//               console.log(allData, " allData");

//               // Flatten the data to include names instead of IDs
//               const flattenedData = allData.flatMap((masterRow: any) => {
//                   const details = masterRow.itemDetails || [];
//                   console.log(details, " details");
//                   console.log(masterRow, " masterRow");

//                   const mappedMasterRow = {
//                       ...masterRow,
//                       brand: brandLookup.find((b: any) => b.id == masterRow.brandId)?.name || '',
//                       category: categoryLookup.find((c: any) => c.id == masterRow.categoryId)?.name || '',
//                       company: companyLookup.find((co: any) => co.id == masterRow.companyId)?.name || '',
//                       brandId: undefined, // Remove IDs
//                       categoryId: undefined,
//                       companyId: undefined,
//                   };

//                   if (details.length > 0) {
//                       return details.map((detail: any) => {
//                           const palletCategoryName = palletCategoryLookup.find((p: any) => p.id == detail.itemDetailPalletCategoryId)?.name || '';
//                           return {
//                               ...mappedMasterRow,
//                               ...detail,
//                               palletCategory: palletCategoryName, // Include the pallet category name for details
//                               itemDetailPalletCategoryId: undefined, // Remove raw ID
//                               Details: undefined, // Exclude the raw Details field
//                           };
//                       });
//                   } else {
//                       return { ...mappedMasterRow, Details: undefined };
//                   }
//               });

//               console.log(flattenedData, "Flattened Data for Export");

//               // Convert to Excel worksheet
//               const worksheet = XLSX.utils.json_to_sheet(flattenedData);

//               // Create workbook
//               const workbook = XLSX.utils.book_new();
//               XLSX.utils.book_append_sheet(workbook, worksheet, "Master-Details");

//               const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//               saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${fileName}.xlsx`);
//           });
//       })
//       .catch((error: any) => {
//           console.error("Error loading data for export:", error);
//       });
// }
// exportGrid2(e: any, fileName: string) {
//   const brandDataPromise = this._apihandler.getStore(`${GlobalComponent.BASE_API}/${BRAND}`, BRAND_LOOKUP, "", "", "", "").load();
//   const categoryDataPromise = this._apihandler.getStore(`${BASE_API}/${CATEGORY}`, CATEGORY_LOOKUP, "", "", "", "").load();
//   const companyDataPromise = this._apihandler.getStore(`${BASE_API}/Company`, 'getAllCompanyLookup', "", "", "", "").load();
//   const palletCategoryDataPromise = this._apihandler.getStore(`${BASE_API}/PalletCategory`, 'GetPalletCategoryLookup?IsActiveOnly=true', "", "", "", "").load();
//   Promise.all([brandDataPromise, categoryDataPromise, companyDataPromise, palletCategoryDataPromise])
//       .then(([brandData, categoryData, companyData, palletCategoryData]) => {
//           const dataSource = e.component.getDataSource();
//           return dataSource.store().load().then((allData: any[]) => {
//               const brandLookup = brandData.map((b: any) => ({ id: b.id, name: b.name }));
//               const categoryLookup = categoryData.map((c: any) => ({ id: c.id, name: c.name }));
//               const companyLookup = companyData.map((co: any) => ({ id: co.id, name: co.name }));
//               const palletCategoryLookup = palletCategoryData.map((p: any) => ({ id: p.id, name: p.name }));
//               const flattenedData = allData.flatMap((masterRow: any) => {
//                   const details = masterRow.itemDetails || [];
//                   console.log(masterRow, " masterRow")
//                   const mappedMasterRow = {
//                       itemCode: masterRow.itemCode,
//                       sku:masterRow.globalSku,
//                       description: masterRow.description,
//                       brand: brandLookup.find((b: any) => b.id == masterRow.brandId)?.name || '',
//                       category: categoryLookup.find((c: any) => c.id == masterRow.categoryId)?.name || '',
//                       mainCategory: masterRow.mainCategory,
//                       company: companyLookup.find((co: any) => co.id == masterRow.companyId)?.name || '',
//                       weight: masterRow.weight,
//                       length: masterRow.itemLength,
//                       width: masterRow.width,
//                       height: masterRow.height,
//                       IsBulky: masterRow.itemIsBulky == true ? "Yes" : "No",
//                       SerializedIn: masterRow.itemIsSerializedIn == true ? "Yes" : "No",
//                       SerializedOut: masterRow.itemIsSerializedOut == true ? "Yes" : "No",
//                       IsExpiration: masterRow.itemIsExpiration == true ? "Yes" : "No",
//                       LifeTimeDays: masterRow.itemLifeTime == true ? "Yes" : "No",
//                       LifeTimePercentage: masterRow.itemLifeTimePercentage == true ? "Yes" : "No",
//                       MinExpirationDays: masterRow.itemMinExpirationDays == true ? "Yes" : "No",
//                   };

//                   if (details.length > 0) {
//                       return details.map((detail: any) => {
//                         console.log(detail, " detail")
//                           const palletCategoryName = palletCategoryLookup.find((p: any) => p.id == detail.itemDetailPalletCategoryId)?.name || '';
//                           return {
//                               ...mappedMasterRow,
//                               palletCategory: palletCategoryName,
//                               TieV:detail.itemDetailTieVertical,
//                               TieH:detail.itemDetailTieHorizontal,
//                               High:detail.itemDetailHigh,
//                               Spc:detail.itemDetailSpc,
//                               Stacking:detail.itemDetailSpcStacking,
//                               SqmPerPallet:detail.itemDetailSqmPerPallet,
//                               Cbm:detail.itemDetailCbm,
//                               SqmEmpty:detail.itemDetailSqmEmpty,
//                               Conversion: detail.itemDetailConversion
//                           };
//                       });
//                   } else {
//                       return mappedMasterRow;
//                   }
//               });

//               console.log(flattenedData, "Flattened Data for Export");
//               const worksheet = XLSX.utils.json_to_sheet(flattenedData);
//               const workbook = XLSX.utils.book_new();
//               XLSX.utils.book_append_sheet(workbook, worksheet, "Master-Details");

//               const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//               saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${fileName}.xlsx`);
//           });
//       })
//       .catch((error: any) => {
//           console.error("Error loading data for export:", error);
//       });
// }
// exportGrid2(e: any, fileName: string) {
//   const brandDataPromise = this._apihandler.getStore(`${GlobalComponent.BASE_API}/${BRAND}`, BRAND_LOOKUP, "", "", "", "").load();
//   const categoryDataPromise = this._apihandler.getStore(`${BASE_API}/${CATEGORY}`, CATEGORY_LOOKUP, "", "", "", "").load();
//   const companyDataPromise = this._apihandler.getStore(`${BASE_API}/Company`, 'getAllCompanyLookup', "", "", "", "").load();
//   const palletCategoryDataPromise = this._apihandler.getStore(`${BASE_API}/PalletCategory`, 'GetPalletCategoryLookup?IsActiveOnly=true', "", "", "", "").load();

//   Promise.all([brandDataPromise, categoryDataPromise, companyDataPromise, palletCategoryDataPromise])
//       .then(([brandData, categoryData, companyData, palletCategoryData]) => {
//           const dataSource = e.component.getDataSource();
//           return dataSource.store().load().then((allData: any[]) => {
//               const brandLookup = brandData.map((b: any) => ({ id: b.id, name: b.name }));
//               const categoryLookup = categoryData.map((c: any) => ({ id: c.id, name: c.name }));
//               const companyLookup = companyData.map((co: any) => ({ id: co.id, name: co.name }));
//               const palletCategoryLookup = palletCategoryData.map((p: any) => ({ id: p.id, name: p.name }));

//               // Prepare grouped data
//               const groupedData: any[] = [];
//               allData.forEach((masterRow: any) => {
//                   const details = masterRow.itemDetails || [];
//                   const mappedMasterRow = {
//                       itemCode: masterRow.itemCode,
//                       sku: masterRow.globalSku,
//                       description: masterRow.description,
//                       brand: brandLookup.find((b: any) => b.id == masterRow.brandId)?.name || '',
//                       category: categoryLookup.find((c: any) => c.id == masterRow.categoryId)?.name || '',
//                       mainCategory: masterRow.mainCategory,
//                       company: companyLookup.find((co: any) => co.id == masterRow.companyId)?.name || '',
//                       weight: masterRow.weight,
//                       length: masterRow.itemLength,
//                       width: masterRow.width,
//                       height: masterRow.height,
//                       IsBulky: masterRow.itemIsBulky == true ? "Yes" : "No",
//                       SerializedIn: masterRow.itemIsSerializedIn == true ? "Yes" : "No",
//                       SerializedOut: masterRow.itemIsSerializedOut == true ? "Yes" : "No",
//                       IsExpiration: masterRow.itemIsExpiration == true ? "Yes" : "No",
//                       LifeTimeDays: masterRow.itemLifeTime == true ? "Yes" : "No",
//                       LifeTimePercentage: masterRow.itemLifeTimePercentage == true ? "Yes" : "No",
//                       MinExpirationDays: masterRow.itemMinExpirationDays == true ? "Yes" : "No",
//                   };

//                   groupedData.push(mappedMasterRow); // Add the header row

//                   details.forEach((detail: any) => {
//                       groupedData.push({
//                           ...mappedMasterRow, // Include master row data for structure
//                           palletCategory: palletCategoryLookup.find((p: any) => p.id == detail.itemDetailPalletCategoryId)?.name || '',
//                           TieV: detail.itemDetailTieVertical,
//                           TieH: detail.itemDetailTieHorizontal,
//                           High: detail.itemDetailHigh,
//                           Spc: detail.itemDetailSpc,
//                           Stacking: detail.itemDetailSpcStacking,
//                           SqmPerPallet: detail.itemDetailSqmPerPallet,
//                           Cbm: detail.itemDetailCbm,
//                           SqmEmpty: detail.itemDetailSqmEmpty,
//                           Conversion: detail.itemDetailConversion
//                       });
//                   });
//               });

//               // Prepare Excel sheet
//               const worksheet = XLSX.utils.json_to_sheet(groupedData);

//               // Format worksheet for grouping
//               let lastHeaderRow:any = null;
//               Object.keys(groupedData[0]).forEach((key, colIdx) => {
//                   groupedData.forEach((row, rowIdx) => {
//                       if (row !== lastHeaderRow) {
//                           worksheet[`A${rowIdx + 1}`].s = { bold: true }; // Format header rows
//                           lastHeaderRow = row;
//                       }
//                   });
//               });

//               const workbook = XLSX.utils.book_new();
//               XLSX.utils.book_append_sheet(workbook, worksheet, "Master-Details");

//               const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//               saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${fileName}.xlsx`);
//           });
//       })
//       .catch((error: any) => {
//           console.error("Error loading data for export:", error);
//       });
// }
exportGrid2(e: any, fileName: string) {
  const brandDataPromise = this._apihandler.getStore(`${GlobalComponent.BASE_API}/${BRAND}`, BRAND_LOOKUP, "", "", "", "").load();
  const categoryDataPromise = this._apihandler.getStore(`${BASE_API}/${CATEGORY}`, CATEGORY_LOOKUP, "", "", "", "").load();
  const companyDataPromise = this._apihandler.getStore(`${BASE_API}/Company`, 'getAllCompanyLookup', "", "", "", "").load();
  const palletCategoryDataPromise = this._apihandler.getStore(`${BASE_API}/PalletCategory`, 'GetPalletCategoryLookup?IsActiveOnly=true', "", "", "", "").load();

  Promise.all([brandDataPromise, categoryDataPromise, companyDataPromise, palletCategoryDataPromise])
      .then(([brandData, categoryData, companyData, palletCategoryData]) => {
          const dataSource = e.component.getDataSource();
          return dataSource.store().load().then((allData: any[]) => {
              const brandLookup = brandData.map((b: any) => ({ id: b.id, name: b.name }));
              const categoryLookup = categoryData.map((c: any) => ({ id: c.id, name: c.name }));
              const companyLookup = companyData.map((co: any) => ({ id: co.id, name: co.name }));
              const palletCategoryLookup = palletCategoryData.map((p: any) => ({ id: p.id, name: p.name }));

              // Prepare grouped data
              const groupedData: any[] = [];
              allData.forEach((masterRow: any) => {
                  const details = masterRow.itemDetails || [];
                  const mappedMasterRow = {
                      itemCode: masterRow.itemCode,
                      sku: masterRow.globalSku,
                      description: masterRow.description,
                      brand: brandLookup.find((b: any) => b.id == masterRow.brandId)?.name || '',
                      category: categoryLookup.find((c: any) => c.id == masterRow.categoryId)?.name || '',
                      mainCategory: masterRow.mainCategory,
                      company: companyLookup.find((co: any) => co.id == masterRow.companyId)?.name || '',
                      weight: masterRow.weight,
                      length: masterRow.itemLength,
                      width: masterRow.width,
                      height: masterRow.height,
                      IsBulky: masterRow.itemIsBulky == true ? "Yes" : "No",
                      SerializedIn: masterRow.itemIsSerializedIn == true ? "Yes" : "No",
                      SerializedOut: masterRow.itemIsSerializedOut == true ? "Yes" : "No",
                      IsExpiration: masterRow.itemIsExpiration == true ? "Yes" : "No",
                      LifeTimeDays: masterRow.itemLifeTime == true ? "Yes" : "No",
                      LifeTimePercentage: masterRow.itemLifeTimePercentage == true ? "Yes" : "No",
                      MinExpirationDays: masterRow.itemMinExpirationDays == true ? "Yes" : "No",
                  };

                  // Add header row
                  groupedData.push(mappedMasterRow);

                  // Add detail rows, keeping item data blank
                  details.forEach((detail: any) => {
                      groupedData.push({
                          itemCode: '', // Blank for detail rows
                          sku: '',
                          description: '',
                          brand: '',
                          category: '',
                          mainCategory: '',
                          company: '',
                          weight: '',
                          length: '',
                          width: '',
                          height: '',
                          IsBulky: '',
                          SerializedIn: '',
                          SerializedOut: '',
                          IsExpiration: '',
                          LifeTimeDays: '',
                          LifeTimePercentage: '',
                          MinExpirationDays: '',
                          palletCategory: palletCategoryLookup.find((p: any) => p.id == detail.itemDetailPalletCategoryId)?.name || '',
                          TieV: detail.itemDetailTieVertical,
                          TieH: detail.itemDetailTieHorizontal,
                          High: detail.itemDetailHigh,
                          Spc: detail.itemDetailSpc,
                          Conversion: detail.itemDetailConversion,
                          Stacking: detail.itemDetailSpcStacking,
                          SqmPerPallet: detail.itemDetailSqmPerPallet,
                          Cbm: detail.itemDetailCbm,
                          SqmEmpty: detail.itemDetailSqmEmpty
                      });
                  });
              });

              // Prepare Excel sheet
              const worksheet = XLSX.utils.json_to_sheet(groupedData);

              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, "Master-Details");

              const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
              saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${fileName}.xlsx`);
          });
      })
      .catch((error: any) => {
          console.error("Error loading data for export:", error);
      });
}

  exportGrid4(e: any, fileName: string) {
    console.log(e, "Export Event");

    // Fetch all data
    const dataSource = e.component.getDataSource();
    const allDataPromise = dataSource.store().load({});

    allDataPromise.then((allData: any[]) => {
        // Flatten the data to include master-detail information
        const flattenedData = allData.flatMap((masterRow: any) => {
            const details = masterRow.itemDetails || [];
            if (details.length > 0) {
                return details.map((detail: any) => ({
                    ...masterRow,
                    ...detail,
                    Details: undefined, // Exclude the raw Details field
                }));
            } else {
                return { ...masterRow, Details: undefined };
            }
        });

        console.log(flattenedData, "Flattened Data for Export");

        // Convert to Excel worksheet
        const worksheet = XLSX.utils.json_to_sheet(flattenedData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Master-Details");

        // Generate buffer and save
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${fileName}.xlsx`);
    }).catch((error: any) => {
        console.error("Error fetching data for export:", error);
    });
}
  exportGrid3(e: any, fileName: string) {
    console.log(e, " eee");
    if (e.format === 'xlsx') { // Export to Excel
        let data;

        if (e.selectedRowsOnly) {
            // Get selected rows data
            data = e.component.getSelectedRowsData();
            console.log(data, " getSelectedRowsData");
        } else {
            // Get all rows data
            data = e.component.getDataSource().items();
            console.log(data, " getDataSource");
        }

        // Flatten the data
        const flattenedData = data.flatMap((masterRow: any) => {
            const details = masterRow.itemDetails || []; // Assuming details are in `itemDetails`
            if (details.length > 0) {
                // Map details to rows
                return details.map((detail: any) => ({
                    ...masterRow, // Include all master row fields
                    ...detail, // Include all detail fields, overriding duplicates if needed
                    Details: undefined // Exclude the raw `Details` field
                }));
            } else {
                // If no details, just include the master row
                return { ...masterRow, Details: undefined };
            }
        });

        console.log(flattenedData, " flattenedData");

        // Convert flattened data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(flattenedData);

        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Master-Details");

        // Generate buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // Save the file
        saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${fileName}.xlsx`);
    } else if (e.format === 'pdf') { // Export to PDF
        const doc = new jsPDF();

        exportDataGridToPdf({
            jsPDFDocument: doc,
            component: e.component,
            customizeCell: ({ gridCell, pdfCell }) => {
                if (gridCell && gridCell.rowType === "data") {
                    // Customize how the details data appears in the PDF
                    if (gridCell?.column?.dataField === "itemDetails" && (pdfCell?.text)) {
                        pdfCell.text = JSON.stringify(gridCell.data.itemDetails || []);
                    }
                }
            }
        }).then(() => {
            doc.save(`${fileName}.pdf`);
        });
    }
}

  //Read Data From Excel File And Skip First Row Because It Always Header Info
  //And Return Data in Two Dimensional Array
  getjsonDataFromFile(file : any): Promise<any> { 
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const fileContent = e.target.result;
        const binaryString = atob(fileContent.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(binaryString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip the first row (header)
        const jsonDataWithoutHeader = jsonData.slice(1);

        resolve(jsonDataWithoutHeader);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  //Using It Two Downalod File (Template)
  downloadFile(fileName:string, fileExtension:string) {
    const filepath = `assets/Template/${fileName}.${fileExtension}`; // Path to your file in assets folder
    fetch(filepath)
      .then((response) => response.blob())
      .then((blob) => {
        saveAs(blob, `${fileName}.${fileExtension}`); // Save file using file-saver library
      })
      .catch((error) => console.error("Error downloading file:", error));
  }

}
