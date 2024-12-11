import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private loggedInUsers: string[] = [];

  startConnection() {
    var userToken = localStorage.getItem("userToken") || '';
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44310/userHub', {
        accessTokenFactory: () => userToken
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  addGetAllLogingUsersListener(callback: (users: string[]) => void) {
    this.hubConnection.on('GetAllLogingUsers', (users) => {
      this.loggedInUsers = users;
      callback(users);
    });
  }
  UpdatedLogingUsersListener(callback: (users: string[]) => void) {
    this.hubConnection.on('UpdateUserList', (users) => {
      this.loggedInUsers = users;
      callback(users);
    });
  }
  getLoggedInUsers(): string[] {
    return this.loggedInUsers;
  }
  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('Connection stopped'))
        .catch(err => console.log('Error while stopping connection: ' + err));
    }
  }
}
