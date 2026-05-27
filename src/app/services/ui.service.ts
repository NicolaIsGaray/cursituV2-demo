import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  // Por defecto, la navegación es visible
  private isNavigationVisible = new BehaviorSubject<boolean>(true);
  navigationVisible$ = this.isNavigationVisible.asObservable();

  setNavigationVisibility(visible: boolean) {
    this.isNavigationVisible.next(visible);
  }
}