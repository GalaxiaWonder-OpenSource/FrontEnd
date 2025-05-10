import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Injectable({ providedIn: 'root' })
export class UserTypeGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedType = route.data['expectedUserType'];
    const currentType = this.session.getUserType();

    if (currentType === expectedType) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
