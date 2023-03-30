import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http:HttpClient) { }
  url:string= 'http://localhost:3000/'
  signUP(body:any){
    return this.http.post(this.url + 'signup',body)
  }

  login(body:any){
    return this.http.post(this.url +'login',body)
  }
}
