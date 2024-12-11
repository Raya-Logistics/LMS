import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
@Injectable({
  providedIn: 'root'
})
export class SignalRNotificationService {
  private hubConnection!: signalR.HubConnection;

  startConnection() {
    const userToken = localStorage.getItem('userToken') || '';
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44310/messageHub', {  // Ensure this matches your server-side route
        accessTokenFactory: () => userToken
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.error('Error while starting connection: ', err));
  }

  listenForNotifications(callback: (messages: string[]) => void) {
    this.hubConnection.on('GetAllNotifications', (messages: string[]) => {
      callback(messages);
    });
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('Connection stopped'))
        .catch(err => console.error('Error while stopping connection: ', err));
    }
  }

  // Method to send the user ID and transaction ID to the server
  sendOffersToUser(userId: string, transactionId: number) {
    this.hubConnection.invoke('GetAllNotifications', userId, transactionId)  // Ensure method name matches the server-side
      .then(() => console.log('Offer sent to user:', userId))
      .catch(err => console.error('Error while sending offer:', err));
  }
}
