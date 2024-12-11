import { Injectable } from '@angular/core';
import { getFirebaseBackend } from '../../authUtils';
import { User } from '../models/auth.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { GlobalComponent } from "../../global-component";
import { LoginRequestViewModel } from '../models/login-request-view-model';
import { Loginresponseviewmodel } from '../models/loginresponseviewmodel';
import { RegisterRequestViewModel } from '../models/register-request-view-model';
import { PermissionsVM } from 'src/app/models/permissions-vm';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { forEach } from 'lodash';
import { ResetPasswordViewModel } from '../models/resetPasswordViewModel';
import { ResultViewModel } from '../models/resultViewModel';

const AUTH_API = GlobalComponent.AUTH_API;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  

@Injectable({ providedIn: 'root' })

/**
 * Auth-service Component
 */
export class AuthenticationService {
    permissions:BehaviorSubject<PermissionsVM[] | null>;
    isLogged:BehaviorSubject<any>;
    userData : any = null;
    constructor(private http: HttpClient, private _Router:Router) {
        this.isLogged = new BehaviorSubject(null);
        this.permissions = new BehaviorSubject<PermissionsVM[] | null>(null);
        this.decodeToken();
     }
     getTokenHeader() {
        var token = localStorage.getItem("userToken");
        var header = { Authorization: `Bearer ${token}` };
        return { headers: header };
      }
     getInternalPermissionsss (allPermissions:(PermissionsVM[] | null), pageName:string) {
        if(allPermissions != null) {
            for(let item of allPermissions) {
                if(item.pageName == pageName)
                    return item.permissions
            }
        }
        return null;
     }

     getUsreLoggedPermissions(): Observable<PermissionsVM[]> {
        return this.http.get(`${GlobalComponent.BASE_API}/Account/GetUserPermissions`, this.getTokenHeader())
            .pipe(
                map((response: any) => {
                    var permissionsJson : PermissionsVM[] = response.returnObject;
                    this.permissions.next(permissionsJson);
                    return permissionsJson;
                })
            );
    }

    getPagesInternalPermissions(pageNames: string[]): Observable<{ [key: string]: string[] | null }> {
        return this.getUsreLoggedPermissions().pipe(
            map((permissions: PermissionsVM[]) => {
                const result: { [key: string]: string[] | null } = {};
                
                // Iterate over the page names array
                for (let pageName of pageNames) {
                    // Find the matching permission for each page
                    const foundPermission = permissions.find(item => item.pageName === pageName);
                    
                    // If permissions are found, add them to the result object; otherwise, set it to null
                    result[pageName] = foundPermission ? foundPermission.permissions : null;
                }
    
                // Return the result object containing permissions for all pages
                return result;
            })
        );
    }
    



    getInternalPermissionss(pageName: string): Observable<string[] | null> {
        return this.getUsreLoggedPermissions().pipe(
            switchMap((permissions: PermissionsVM[]) => {
                if (permissions != null) {
                    for (let item of permissions) {
                        if (item.pageName == pageName) {
                            return of(item.permissions); // Return the permissions as an observable
                        }
                    }
                }
                return of(null); // Return null if no permissions are found
            })
        );
    }
     getInternalPermissions (pageName:string) {
        if(this.permissions.value)
        for(let item of this.permissions.value) {
            if(item.pageName == pageName)
                return item.permissions
        }
        return null
     }
     decodeToken() {
        if(localStorage.getItem("userToken")) {
            let token: any = localStorage.getItem("userToken")
            this.userData = jwtDecode(token);
            this.isLogged.next(this.userData);
            var permissionsJson : PermissionsVM[] = JSON.parse(this.userData.permissions)
            this.permissions.next(permissionsJson)
        }
      }
      logout() {
        localStorage.removeItem('userToken');
        this.isLogged.next(null);
        this.permissions.next(null);
    }
    /**
     * Performs the register
     * @param email email
     * @param password password
     */
    register(data:RegisterRequestViewModel) : Observable<Loginresponseviewmodel>{        
        // Register Api
        return this.http.post<Loginresponseviewmodel>(`${GlobalComponent.BASE_API}/Account/register`, data)
        
    }
    /**
     * Performs the auth
     * @param email email of user
     * @param password password of user
     */
    login(data : LoginRequestViewModel) : Observable<Loginresponseviewmodel>{
        return this.http.post<Loginresponseviewmodel>(`${GlobalComponent.BASE_API}/Account/login`, data);
    }
    resetPasswrod(data: ResetPasswordViewModel) : Observable<ResultViewModel> {
        return this.http.post<ResultViewModel>(`${GlobalComponent.BASE_API}/Account/ResetPassword`, data);
    }
    /**
     * Returns the current user
     */

    /**
     * Reset password
     * @param email email
     */
    resetPassword(email: string) {
        return getFirebaseBackend()!.forgetPassword(email).then((response: any) => {
            const message = response.data;
            return message;
        });
    }

}

