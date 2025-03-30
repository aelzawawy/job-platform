import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ObserverService {

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall])
    .pipe(
      map((result) => result.matches),
      shareReplay()
  );
  isHandsetMd$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Small])
    .pipe(
      map((result) => result.matches),
      shareReplay()
  );
  constructor(private breakpointObserver: BreakpointObserver) { }
}
