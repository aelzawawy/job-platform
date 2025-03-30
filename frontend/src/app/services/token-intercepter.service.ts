import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenIntercepterService implements HttpInterceptor {
  constructor() { }

  intercept(req: HttpRequest<any>, next:HttpHandler): Observable<HttpEvent<any>>{
    // Get the token
    const token = localStorage.getItem('token');
    // Pass the token to a new, cloned request
    const newRequest = req.clone({
      setHeaders:{
        Authorization: `Bearer ${token}` 
      }
    })
    // Return new request with token
    return next.handle(newRequest);
  }
}
