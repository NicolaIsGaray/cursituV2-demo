import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private activeRequests = 0;
  
  // Definimos un Signal privado y modificable
  private _isLoading = signal<boolean>(false);

  // Exponemos un Signal de solo lectura para los componentes
  public isLoading = this._isLoading.asReadonly();

  show() {
    this.activeRequests++;
    this._isLoading.set(true); // Cambia el valor de forma reactiva
  }

  hide() {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      this._isLoading.set(false); // Cambia el valor de forma reactiva
    }
  }
}