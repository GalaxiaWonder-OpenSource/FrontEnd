import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {SessionService} from '../../iam/services/session.service';

@Injectable({ providedIn: 'root' })
export class MilestoneAccessGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const projectIdFromSession = this.session.getProjectId();
    const projectIdFromUrl = route.paramMap.get('projectId');

    if (projectIdFromSession === projectIdFromUrl) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
