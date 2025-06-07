import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {SessionService} from '../../iam/services/session.service';
import {OrganizationService} from '../services/organization.service';
import {Observable, map, of} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrganizationMemberGuard implements CanActivate {
  constructor(
    private session: SessionService, 
    private router: Router,
    private organizationService: OrganizationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const organizationId = this.session.getOrganizationId();
    
    if (!organizationId) {
      this.router.navigate(['/unauthorized']);
      return of(false);
    }    // Verificar si la ruta requiere que el usuario sea creador
    if (route.data && route.data['requiresCreator']) {
      const personId = this.session.getPersonId();
      
      if (!personId) {
        this.router.navigate(['/unauthorized']);
        return of(false);
      }

      return this.organizationService.isOrganizationCreator(organizationId, personId.toString()).pipe(
        map(isCreator => {
          if (!isCreator) {
            this.router.navigate(['/organizations', organizationId]);
          }
          return isCreator;
        })
      );
    }
    
    // Si no requiere ser creador, solo verificamos que sea miembro
    return of(true);
  }
}
