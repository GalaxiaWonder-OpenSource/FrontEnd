import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../iam/services/session.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import {LanguageSwitcherComponent} from '../language-switcher/language-switcher.component';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIcon} from '@angular/material/icon';
import { UserRole } from '../../../iam/model/user-role.vo';
import { OrganizationMemberType } from '../../../organizations/model/organization-member-type.vo';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-toolbar-project',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    LanguageSwitcherComponent,
    TranslatePipe,
    MatIcon,
    UserMenuComponent
  ],
  templateUrl: './toolbar-project.component.html',
  styleUrls: ['./toolbar-project.component.css']
})
export class ToolbarProjectComponent {
  projectId = '';
  projectRole: 'Contractor' | 'Coordinator' | 'Specialist' | 'Client' | null = null;
  organizationRole: string | null = null;
  userType: string | null = null;

  constructor(
    private session: SessionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.projectId = this.session.getProjectId() ?? '';
    this.projectRole = this.session.getProjectRole();
    this.organizationRole = this.session.getOrganizationRole();
    this.userType = this.session.getUserType();
    console.log('Toolbar loaded with projectId:', this.projectId);
    
    // Si la URL contiene un projectId pero no está en la sesión, lo extraemos y guardamos
    if (!this.projectId) {
      const currentUrl = window.location.pathname;
      const projectMatch = currentUrl.match(/\/projects\/([^\/]+)/);
      if (projectMatch && projectMatch[1]) {
        this.projectId = projectMatch[1];
        console.log('Extracted project ID from URL:', this.projectId);
      }
    }
  }

  navigateTo(subpath: string) {
    this.router.navigate([`/projects/${this.projectId}/${subpath}`]);
  }

  get isContractor() {
    return (this.organizationRole === OrganizationMemberType.CONTRACTOR || 
            this.projectRole === 'Contractor');
  }

  get isClient() {
    return this.projectRole === 'Client' && this.userType === UserRole.CLIENT_USER;
  }

  get isOrganizationUser() {
    return this.userType === UserRole.ORGANIZATION_USER;
  }

  goBackToOrganization() {
    const orgId = this.session.getOrganizationId();
    if (orgId && (this.isContractor || this.isOrganizationUser)) {
      this.router.navigate([`/organizations/${orgId}/info`]);
    }
    else{
      this.router.navigate([`/projects`]);
    }
  }
}
