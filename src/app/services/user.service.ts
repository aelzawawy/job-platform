import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { io } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) { }
  url:string= 'https://inreach-api.onrender.com/';
  socket = io('https://inreach-api.onrender.com/');
  public message$: BehaviorSubject<any> = new BehaviorSubject('');
  public role$: BehaviorSubject<string> = new BehaviorSubject('');
  public body$: BehaviorSubject<any> = new BehaviorSubject('');

  profile(){
    return this.http.get(this.url + 'profile')
  };
  forgotPassword(email:string){
    return this.http.post(this.url + 'forgotPassword', {email})
  }
  resetPassword(token:string, password:string){
    return this.http.patch(this.url + 'resetPassword/' + token, {password})
  }

  verify(id:string, token:string){
    return this.http.get(`${this.url}verify/${id}/${token}`)
  }

  getContacts(){
    return this.http.get(this.url + 'contacts')
  };

  editProfile(body:any){
    return this.http.patch(this.url + 'profile', body)
  };
  
  profileImage(image:any){
    return this.http.post(this.url + 'profileImage', image)
  }
  
  backgoroundImage(image:any){
    return this.http.post(this.url + 'backgoroundImage', image)
  }

  resume(file:any){
    return this.http.post(this.url + 'resume', file)
  }

  removeProfileImage(){
    return this.http.delete(this.url + 'profileImage')
  }

  removeBg(){
    return this.http.delete(this.url + 'backgoroundImage')
  }

  profileById(id:any){
    return this.http.get(this.url + 'users/' + id)
  };

  currentUser(id:any){
    this.socket.emit('addUser', id);
  }
  contactChatRoom(currId:any, id:any){
    this.socket.emit('joinChat', {currUser:currId, contact:id});
  }

  users(){
    return this.http.get(this.url + 'users')
  };

  search(input:any){
    return this.http.get(this.url + 'profile/' + input)
  };

  message(id: any, message: any, file:File) {
    const encodedFileName = encodeURIComponent(file?.name);
    const formData = new FormData(); 
    formData.append('message', message);
    formData.append('encodedFileName', encodedFileName);
    formData.append('file', file);
    
    return this.http.post(this.url + 'message/' + id, formData);
  }
  emitMsg(id: any, message: any,file:any, file_name:any, file_size:any){
    this.socket.emit('message', {msg: message, to: id, file: file, fileName: file_name, fileSize: file_size});
  };
  
  getMsgs(id:any){
    return this.http.get(this.url + 'message/' + id);
  };

  delMsg(id:any){
    return this.http.get(this.url + 'delMessage/' + id)
  }
  
  editProfileSocket(body:any){
    this.socket.emit('editProfile', body);
  }

  public updatedProfile = () => {
    this.socket.on('updatedProfile', (body) =>{
      this.body$.next(body);
    });
    
    return this.body$.asObservable();
  };

  public getNewMessage = () => {
    this.socket.on('message', (message) =>{
      this.message$.next(message);
    });
    
    return this.message$.asObservable();
  };

  emitRole(role:string){
    this.socket.emit('role', role);
  };

  public getRole = () => {
    this.socket.on('role', (role) => {
      this.role$.next(role)
    });
    return this.role$.asObservable();
  }
}
