import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  constructor(private router:Router) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const authRoutes = ['/login', '/signup', '/employers/signup'];
    
    if(authRoutes.includes(state.url) && localStorage['token']) {
      this.router.navigateByUrl('/');
    }
    
    if(authRoutes.includes(state.url) && !localStorage['token']) {
      return true;
    }
    
    if(state.url == '/jobPosts' && localStorage['role'] == 'user') {
      this.router.navigateByUrl('/login');
    }
    
    if(localStorage['token']) {
      return true;
    }
    
    this.router.navigateByUrl('/login');
    return false;
  }
}
