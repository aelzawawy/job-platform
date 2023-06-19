import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io } from 'socket.io-client';
import { JobPost } from 'src/app/interfaces/job-post';
import { User } from '../interfaces/user';
@Injectable({
  providedIn: 'root',
})
export class JobsService {
  constructor(private http: HttpClient) {}
  url: string = 'https://inreach-api.onrender.com/api/';
  socket = io('https://inreach-api.onrender.com/');
  public saveRm$: BehaviorSubject<string> = new BehaviorSubject('');
  public job$: BehaviorSubject<JobPost> = new BehaviorSubject({});
  public jobs$: BehaviorSubject<JobPost[]> = new BehaviorSubject([{}]);
  public loadingMyPosts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public jobId$: BehaviorSubject<string> = new BehaviorSubject('');
  public showApplicants$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public closeApplicants$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  getJobs(body: any) {
    return this.http.get(
      this.url + `feed/${body.page}/${body.limit}/${body.order}`
    );
  }

  public passJob = (res: any) => {
    this.job$.next(res);
  };
  getPassedJob = () => {
    return this.job$.asObservable();
  };
  jobById(id: any) {
    return this.http.get(this.url + 'posts/' + id);
  }

  getPosts() {
    this.loadingMyPosts$.next(true);
    this.http.get(this.url + 'posts/').subscribe({
      next: (res: any) => {
        this.jobs$.next(res.reverse());
        this.loadingMyPosts$.next(false);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  postJob(body: any) {
    return this.http.post(`${this.url}posts/`, body);
  }
  updateJOb(id: any, body: any) {
    return this.http.patch(`${this.url}posts/${id}`, body);
  }
  delJOb(id: any) {
    return this.http.delete(`${this.url}posts/${id}`);
  }
  applyJob(id: any) {
    return this.http.get(`${this.url}apply/${id}`);
  }

  checkSaved(id: any) {
    return this.http.get(this.url + 'check_saved/' + id);
  }
  saveJob(id: any) {
    return this.http.get(this.url + 'save/' + id);
  }
  unSaveJob(id: any) {
    return this.http.get(`${this.url}unSave/${id}`);
  }

  toUpdate: JobPost = {};

  acceptOffer(id: any, appId: any) {
    return this.http.get(this.url + 'accept/' + id + '/' + appId);
  }

  declineOffer(id: any, appId: any) {
    return this.http.get(this.url + 'decline/' + id + '/' + appId);
  }

  searchApi(query: any) {
    return this.http.get(
      `${this.url}job-search?search_terms=${query.search_terms}&location=${query.location}&sort=${query.sort}`
    );
  }
  // geoSearch(body: any) {
  //   return this.http.get(
  //     `${this.url}job-search/${body.search_terms}/${body.location}/${body.radius}/${body.unit}/${body.sort}`
  //   );
  // }
}
