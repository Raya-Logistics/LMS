import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'currentUser';
const USER_INFO = 'userToken';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() { }

  signOut(): void {
    window.sessionStorage.clear();
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const user = window.localStorage.getItem(USER_KEY);    
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }
  public getUserInfo():any {
    var userInfo = localStorage.getItem(USER_INFO);
    if(userInfo != null)
      return jwtDecode(userInfo);
    return null;
  }
}
