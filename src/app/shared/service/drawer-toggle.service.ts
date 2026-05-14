import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawerToggleService {
  private drawerToggleSubject = new Subject<boolean>();

  drawerToggle$ = this.drawerToggleSubject.asObservable();

  toggleDrawer(open: boolean) {
    this.drawerToggleSubject.next(open);
  }
}
