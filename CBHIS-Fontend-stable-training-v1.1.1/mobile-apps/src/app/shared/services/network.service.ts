import { Injectable } from '@angular/core';
import { ConnectionStatus, Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private networkStatusSubject: BehaviorSubject<ConnectionStatus> = new BehaviorSubject<ConnectionStatus>({
    connected: false,
    connectionType: 'none',
  });

  private previousStatus: ConnectionStatus | null = null;
  public networkStatus$: Observable<ConnectionStatus> = this.networkStatusSubject.asObservable();

  constructor() {
    this.initializeNetworkListener();
  }

  private async initializeNetworkListener() {
    const status = await Network.getStatus();
    this.networkStatusSubject.next(status);

    Network.addListener('networkStatusChange', async (status) => {
      if (this.hasNetworkStatusChanged(status)) {
        this.networkStatusSubject.next(status);
      }

      this.previousStatus = status;
    });
  }

  private hasNetworkStatusChanged(currentStatus: any): boolean {
    if (!this.previousStatus) {
      return true;
    }
    return this.previousStatus.connected !== currentStatus.connected;
  }

  public async getCurrentNetworkStatus(): Promise<ConnectionStatus> {
    const status = await Network.getStatus();
    return status;
  }
}
