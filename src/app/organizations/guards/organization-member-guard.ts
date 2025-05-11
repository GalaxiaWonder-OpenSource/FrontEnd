import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {SessionService} from '../../iam/services/session.service';

@Injectable({ providedIn: 'root' })
export class OrganizationMemberGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  canActivate(): boolean {
    const orgId = this.session.getOrganizationId();

    if (orgId) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
