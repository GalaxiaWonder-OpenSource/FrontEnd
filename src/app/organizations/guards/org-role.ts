import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { SessionService } from '../../iam/services/session.service';

@Injectable({ providedIn: 'root' })
export class OrgRoleGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles = route.data['roles'] as string[];
    const currentRole = this.session.getOrganizationRole();

    if (allowedRoles.includes(currentRole ?? '')) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
