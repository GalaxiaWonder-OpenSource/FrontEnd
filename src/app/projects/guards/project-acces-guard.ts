import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {SessionService} from '../../iam/services/session.service';

@Injectable({ providedIn: 'root' })
export class ProjectAccessGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentProjectId = this.session.getProjectId();
    const urlProjectId = route.paramMap.get('projectId');

    // Si el projectId en la URL coincide con el de la sesión, permite el acceso
    if (currentProjectId === urlProjectId) {
      return true;
    }

    // Si no hay un projectId en la sesión pero viene en la URL,
    // esto podría ser una navegación directa desde una tarjeta de proyecto,
    // así que establecemos el projectId en la sesión y permitimos el acceso
    if (urlProjectId && !currentProjectId) {
      this.session.setProject(urlProjectId, 'Client'); // Por defecto asumimos rol de cliente
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
