import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {SessionService} from '../../iam/services/session.service';

@Injectable({ providedIn: 'root' })
export class ProjectAccessGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentProjectId = this.session.getProjectId();
    const urlProjectId = route.paramMap.get('projectId');

    if (currentProjectId === urlProjectId) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
