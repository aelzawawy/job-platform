import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user';
import { BehaviorSubject } from 'rxjs';
import { io } from "socket.io-client";
import { JobPost } from 'src/app/interfaces/job-post';
@Injectable({
  providedIn: 'root'
})
export class JobsService {

  constructor(private http:HttpClient) { }
  url:string= 'http://localhost:3000/';
  socket = io('http://localhost:3000/');
  public saveRm$: BehaviorSubject<string> = new BehaviorSubject('');

  getJobs(body:any){
    return this.http.post(this.url + 'jobs-feed', body)
  };

  jobById(id:any){
    return this.http.get(this.url + 'jobs-feed/' + id)
  }

  getPosts(){
    return this.http.get(this.url + 'posts/')
  };

  postJob(body:any){
    return this.http.post(this.url + 'posts/', body)
  }
  updateJOb(id:any, body:any){
    return this.http.patch(this.url + 'posts/' + id, body)
  }
  delJOb(id:any){
    return this.http.delete(this.url + 'posts/' + id)
  }
  applyJob(id:any){
    return this.http.get(this.url + 'apply/' + id)
  }

  checkSaved(id:any){
    return this.http.get(this.url + 'check_saved/' + id)
  }
  saveJob(id:any){
    return this.http.get(this.url + 'save/' + id)
  }
  unSaveJob(id:any){
    return this.http.get(this.url + 'unSave/' + id)
  }


  users = []
  currUser:User = {}
  jobId = '';
  applicationId = []
  toUpdate:JobPost = {}
  getJobInfo(id:any, applicationId:any){
    this.jobId = id;
    this.applicationId = applicationId.map((el:any) => el._id);
  }

  getApplications(users:any){
    this.users = users;
  }
  
  getUser(user:any){
    this.currUser = user;
  }

  acceptOffer(id:any, appId:any){
    return this.http.get(this.url + 'accept/' + id + '/' + appId)
  }

  declineOffer(id:any, appId:any){
    return this.http.get(this.url + 'decline/' + id + '/' + appId)
  }

  searchApi(body:any){
    return this.http.post(`${this.url}api-search`, body)
  }
}
