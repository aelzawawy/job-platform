import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';
import { io } from 'socket.io-client';
import { User } from '../interfaces/user';
// import { Notification } from '../interfaces/notification';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}
  url: string = 'https://inreach-api.onrender.com/api/';
  socket = io('https://inreach-api.onrender.com/');
  public message$: BehaviorSubject<any> = new BehaviorSubject(undefined);
  public fire$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public body$: BehaviorSubject<any> = new BehaviorSubject(undefined);
  public newContacts$: BehaviorSubject<any> = new BehaviorSubject([]);
  public contactStats$: BehaviorSubject<any> = new BehaviorSubject([]);
  public notifications$: BehaviorSubject<any> = new BehaviorSubject([]);
  public msgs$: BehaviorSubject<any> = new BehaviorSubject([]);
  public unread_notifications$: BehaviorSubject<any> = new BehaviorSubject(
    undefined
  );
  public unread_msgs$: BehaviorSubject<any> = new BehaviorSubject(undefined);
  public loadingContacts$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  public loadingUsers$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public deleteOptions$: BehaviorSubject<any> = new BehaviorSubject({});
  public users$: BehaviorSubject<User[]> = new BehaviorSubject([{}]);
  public closeDialog$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public signalToDelete$: BehaviorSubject<any> = new BehaviorSubject({});
  public onlineStat$: BehaviorSubject<any> = new BehaviorSubject({});

  profile() {
    return this.http.get(this.url + 'profile');
  }

  forgotPassword(email: string) {
    return this.http.post(this.url + 'forgotPassword', { email });
  }
  resetPassword(token: string, password: string) {
    return this.http.patch(this.url + 'resetPassword/' + token, { password });
  }

  verify(id: string, token: string) {
    return this.http.get(`${this.url}verify/${id}/${token}`);
  }

  getContacts() {
    this.loadingContacts$.next(true);
    this.http.get(this.url + 'contacts').subscribe({
      next: (res: any) => {
        this.newContacts$.next(res);
        this.loadingContacts$.next(false);

        // Ckech which on my contacts is online
        this.get_online_Contacts(res.map((el: any) => el._id));
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  get_contactStats() {
    this.http.get(`${this.url}contactStats`).subscribe({
      next: (res: any) => {
        this.contactStats$.next(res);
        const unread = res.filter((el: any) => el.sent_newMsg == true).length;
        this.unread_msgs$.next(unread);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  get_notifications() {
    this.http.get(`${this.url}notifications`).subscribe({
      next: (res: any) => {
        const unread = res.filter((el: any) => !el.read).length;
        this.unread_notifications$.next(unread);
        this.notifications$.next(res.reverse());
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  markRead(id: string) {
    return this.http.patch(`${this.url}markRead/${id}`, {});
  }
  deleteNotification(id: string) {
    return this.http.delete(`${this.url}deleteNotification/${id}`);
  }

  editProfile(body: any) {
    return this.http.patch(this.url + 'profile', body);
  }

  profileImage(image: any) {
    return this.http.post(this.url + 'profileImage', image);
  }

  backgoroundImage(image: any) {
    return this.http.post(this.url + 'backgoroundImage', image);
  }

  resume(file: any) {
    return this.http.post(this.url + 'resume', file);
  }

  removeProfileImage() {
    return this.http.delete(this.url + 'profileImage');
  }

  removeBg() {
    return this.http.delete(this.url + 'backgoroundImage');
  }

  profileById(id: any) {
    return this.http.get(this.url + 'users/' + id);
  }

  currentUser(id: any) {
    this.socket.emit('addUser', id);
  }
  contactChatRoom(currId: any, id: any) {
    this.socket.emit('joinChat', { currUser: currId, contact: id });
  }

  loadUsers() {
    this.loadingUsers$.next(true);
    this.http.get(this.url + 'users').subscribe({
      next: (res) => {
        this.users$.next(res as User[]);
        this.loadingUsers$.next(false);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  searchUsers(query: any) {
    return this.http.get(
      `${this.url}user_search?search_terms=${query.search_terms}&location=${
        query.location || ''
      }&industry=${query.industry || ''}&skills=${query.skills || ''}`
    );
  }

  saveToken(token: any) {
    return this.http.patch(this.url + 'saveToken', { token });
  }
  removeToken() {
    return this.http.patch(this.url + 'removeToken', {});
  }

  message(id: any, message: any, file: File) {
    const encodedFileName = encodeURIComponent(file?.name);
    const formData = new FormData();
    formData.append('message', message);
    formData.append('encodedFileName', encodedFileName);
    formData.append('file', file);

    return this.http.post(this.url + 'message/' + id, formData);
  }
  emitMsg(id: any, message: any, file: any, file_name: any, file_size: any) {
    this.socket.emit('message', {
      msg: message,
      to: id,
      file: file,
      fileName: file_name,
      fileSize: file_size,
    });
  }

  emitToDelete(id: string, contact: string, rmContact: boolean) {
    this.socket.emit('deleteChat', {
      id,
      contact,
      rmContact,
    });
  }

  public toDeleteChat = () => {
    this.socket.on('deleteChat', (body) => {
      this.deleteOptions$.next(body);
    });
    return this.deleteOptions$.asObservable();
  };

  readMsgs(id: any) {
    return this.http.patch(this.url + 'read_messages/' + id, {});
  }
  getMsgs() {
    this.http.get(this.url + 'messages').subscribe({
      next: (res: any) => {
        this.msgs$.next(res.reverse());
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  delMsg(id: any) {
    return this.http.delete(`${this.url}delMessage/${id}`);
  }
  delChat(id: any, forBoth: boolean, rmContact: boolean) {
    return this.http.delete(`${this.url}delChat/${id}/${forBoth}/${rmContact}`);
  }

  passNewBody(body: any) {
    this.body$.next(body);
  }

  public updatedProfile = () => {
    return this.body$.asObservable().pipe(filter((x: any) => x != undefined));
  };

  public getNewMessage = () => {
    this.socket.on('message', (message) => {
      this.message$.next(message);
    });

    return this.message$
      .asObservable()
      .pipe(filter((x: any) => x != undefined));
  };

  emitSignal(signal: boolean) {
    this.fire$.next(signal);
  }

  public getSignal = () => {
    return this.fire$.asObservable().pipe(filter((x: any) => x != false));
  };
  get_online_Contacts(id: any) {
    this.socket.emit('isOnline', id);
  }
  markOnline(id: any) {
    this.http.patch(this.url + 'mark_online/', { id }).subscribe({
      error: (err) => {
        console.log(err);
      },
    });
  }
  markOfline(id: any) {
    this.http.patch(this.url + 'mark_offline/', { id }).subscribe({
      error: (err) => {
        console.log(err);
      },
    });
  }
  disconnect(id: any) {
    this.socket.emit('disconnect', id);
  }
  public onlineContacts = () => {
    this.socket.on('isOnline', (message) => {
      this.onlineStat$.next(message);
    });
    return this.onlineStat$.asObservable();
  };
}
