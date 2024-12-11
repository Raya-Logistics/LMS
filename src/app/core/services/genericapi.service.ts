import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class GenericapiService<T> {

  constructor(protected _http:HttpClient, protected _url:string) { }
  
  getAll(): Observable<T[]> {
    return this._http.get<T[]>(this._url);
  }
  get(id:Number): Observable<T> {
    return this._http.get<T>(`this._url?id=${id}`)
  }
  create(item: T): Observable<T> {
    return this._http.post<T>(this._url, item);
  }

  update(id: number, item: T): Observable<T> {
    return this._http.put<T>(`${this._url}/${id}`, item);
  }

  delete(id: number): Observable<any> {
    return this._http.delete(`${this._url}?id=${id}`);
  }
}
