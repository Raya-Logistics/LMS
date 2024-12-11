import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, lastValueFrom } from "rxjs";
import CustomStore from "devextreme/data/custom_store";
import { ToastrService } from 'ngx-toastr';
import Swal from "sweetalert2";

@Injectable({
  providedIn: "root",
})
export class ApihandlerService {
  constructor(private http: HttpClient, private toaster:ToastrService) {}
  //Method For Handle Header Request
  getTokenHeader() {
    var token = localStorage.getItem("userToken");
    var header = { Authorization: `Bearer ${token}` };
    return { headers: header };
  }
  //Method Handle Requests Comming Form Dev Express Data Grid
  getStore(
    baseUrl: string,
    getUrl: string,
    getByUrl: string,
    postUrl: string,
    editUrl: string,
    deleteUrl: string
  ): any {
    return new CustomStore({
      key: "id",
      load: () => this.sendRequest(`${baseUrl}/${getUrl}`),
      insert: (values) =>
        this.sendRequest(`${baseUrl}/${postUrl}`, "POST", {
          values: values,
        }),
      update: async (key, values) => {
        const rowData = await this.sendRequest(
          `${baseUrl}/${getByUrl}/${key}`,
          "GET"
        );
        const updatedRowData = { ...rowData, ...values };
        return this.sendRequest(`${baseUrl}/${editUrl}`, "PUT", {
          key,
          values: updatedRowData,
        });
      },
      remove: (key) =>
        this.sendRequest(`${baseUrl}/${deleteUrl}`, "DELETE", {
          key,
        }),
      byKey: (key) => this.sendRequest(`${baseUrl}/${getByUrl}/${key}`, "GET"), // Implementing byKey method
    });
  }
  getStoreWithList(
    baseUrl: string,
    getUrl: string,
    getByUrl: string,
    postUrl: string,
    editUrl: string,
    deleteUrl: string
  ): any {
    return new CustomStore({
      key: "id",
      load: () => this.sendRequest(`${baseUrl}/${getUrl}`),
      insert: (values) =>
        this.sendRequest(`${baseUrl}/${postUrl}`, "POST", {
          values: values,
        }),
      update: async (key, values) => {
        const rowData = await this.sendRequest(
          `${baseUrl}/${getByUrl}/${key}`,
          "GET"
        );
        const updatedRowData = { ...rowData, ...values };
        return this.sendRequest(`${baseUrl}/${editUrl}`, "PUT", {
          key,
          values: updatedRowData,
        });
      },
      remove: (key) =>
        this.sendRequest(`${baseUrl}/${deleteUrl}`, "DELETE", {
          key,
        }),
      byKey: (key) => this.sendRequest(`${baseUrl}/${getByUrl}/${key}`, "GET"), // Implementing byKey method
    });
  }
  //Method For Send The Request To Backend
  async sendRequest(url: string, method = "GET", data: any = {}) {
    let request: Observable<Object> | undefined; // Initialize to undefined
    switch (method) {
      case "GET": {
        request = this.http.get(url, this.getTokenHeader());
        break;
      }
      case "PUT": {
        request = this.http.put(url, data.values, this.getTokenHeader());
        break;
      }
      case "POST": {
        console.log(data.values , " sended object")
        request = this.http.post(url, data.values, this.getTokenHeader());
        break;
      }
      case "DELETE": {
        request = this.http.delete(
          `${url}?Id=${data.key}`,
          this.getTokenHeader()
        );

        break;
      }
    }

    if (!request) {
      throw new Error("Request is not defined");
    }

    try {
      const result = await lastValueFrom<any>(request);
      console.log(result, " result");
      if(!result.success)
        Swal.fire({
          icon: 'error', // You can change this to 'success', 'warning', etc.
          title: 'خطأ...',
          text: result.arabicMessage,
          // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
          confirmButtonText: 'اغلاق',
          confirmButtonColor: '#3085d6'
        });
      if(Array.isArray(result.returnObject))
        result.returnObject = result.returnObject.reverse();
      return method === "GET" ? result.returnObject : {};
    } catch (e: any) {
      throw e?.error?.Message;
    }
  }
  //Method For Add Item From Form Not Dev Express Data grid
  AddItem(url: string, data: any): Observable<any> {
    return this.http.post(url, data, this.getTokenHeader());
  }
  AddItemFile(url: string, data: any): Observable<any> {
    const token = localStorage.getItem('userToken');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post(url, data, { headers, responseType: 'blob' });
  }
  AddItemWithOption(url: string, data: any, httpOption: any): Observable<any> {
    return this.http.post(url, data, httpOption);
  }
  //Method For Edit Item From Form Not Dev Express Data grid
  EditItem(url: string, data: any): Observable<any> {
    return this.http.put(url, data, this.getTokenHeader());
  }
    //Method For Get Item  Not For Dev Express Data grid
  GetItem(url: string): Observable<any> {
    return this.http.get(url, this.getTokenHeader());
  }
  GetItemFile(url: string): Observable<any> {
    const token = localStorage.getItem('userToken');
    const headers = { Authorization: `Bearer ${token}` };
  
    return this.http.get(url, { headers, responseType: 'blob' });
  }
 
  //The Same Get Store Method But It Use Pagination With Dev Express
  getPagedStore(
    baseUrl: string,
    getUrl: string,
    getByUrl: string,
    postUrl: string,
    editUrl: string,
    deleteUrl: string
  ): any {
    return new CustomStore({
      key: "id",
      load: (loadOptions: any) =>
        this.loadPagedData(baseUrl, getUrl, loadOptions),
      insert: (values) =>
        this.sendPagedRequest(`${baseUrl}/${postUrl}`, "POST", { values }),
      update: async (key, values) => {
        const rowData = await this.sendPagedRequest(
          `${baseUrl}/${getByUrl}/${key}`,
          "GET"
        );
        const updatedRowData = { ...rowData, ...values };
        return this.sendPagedRequest(`${baseUrl}/${editUrl}`, "PUT", {
          key,
          values: updatedRowData,
        });
      },
      remove: (key) =>
        this.sendPagedRequest(`${baseUrl}/${deleteUrl}`, "DELETE", { key }),
      byKey: (key) =>
        this.sendPagedRequest(`${baseUrl}/${getByUrl}/${key}`, "GET"),
    });
  }

  async loadPagedData(baseUrl: string, getUrl: string, loadOptions: any) {
    const params: any = {
      pageNumber: Math.floor(loadOptions.skip / loadOptions.take) + 1,
      pageSize: loadOptions.take,
    };
    if (loadOptions.sort) {
      params.sortBy = loadOptions.sort[0].selector;
      params.sortOrder = loadOptions.sort[0].desc ? "desc" : "asc";
    }

    try {
      const result = await this.sendPagedRequest(
        `${baseUrl}/${getUrl}`,
        "GET",
        params
      );
      return {
        data: result.items,
        totalCount: result.totalCount,
      };
    } catch (e: any) {
      throw e?.error?.Message;
    }
  }

  async sendPagedRequest(url: string, method = "GET", data: any = {}) {
    const httpParams = new HttpParams({ fromObject: data });
    const httpOptions = { withCredentials: true, body: httpParams };

    let request: Observable<Object> | undefined;
    switch (method) {
      case "GET": {
        request = this.http.get(url, { params: httpParams });
        break;
      }
      case "PUT": {
        request = this.http.put(url, data.values);
        break;
      }
      case "POST": {
        request = this.http.post(url, data.values);
        break;
      }
      case "DELETE": {
        request = this.http.delete(`${url}?Id=${data.key}`);
        break;
      }
    }

    if (!request) {
      throw new Error("Request is not defined");
    }

    try {
      const result = await lastValueFrom<any>(request);
      return method === "GET" ? result.returnObject : {};
    } catch (e: any) {
      throw e?.error?.Message;
    }
  }
}
