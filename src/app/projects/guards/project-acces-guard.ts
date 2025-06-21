import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {SessionService} from '../../iam/services/session.service';
import {UserType} from '../../iam/model/user-type.vo';

@Injectable({ providedIn: 'root' })
export class ProjectAccessGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentProjectId = this.session.getProjectId();
    const urlProjectId = route.paramMap.get('projectId');
    const userType = this.session.getUserType();

    // Si el projectId en la URL coincide con el de la sesión, permite el acceso
    if (urlProjectId && currentProjectId !== undefined && parseInt(urlProjectId, 10) === currentProjectId) {
      return true;
    }

    // Si no hay un projectId en la sesión pero viene en la URL,
    // esto podría ser una navegación directa desde una tarjeta de proyecto,
    // así que establecemos el projectId en la sesión y permitimos el acceso
    if (urlProjectId && currentProjectId === undefined) {
      // Determinamos el rol basado en el tipo de usuario
      if (urlProjectId && userType) {
        const parsedId = parseInt(urlProjectId, 10);
        // Enviamos undefined como rol, ya que no podemos enviar strings donde se espera un enum
        this.session.setProject(parsedId, undefined);
        return true;
      }
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
