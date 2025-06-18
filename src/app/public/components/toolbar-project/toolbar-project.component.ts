import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService} from '../../../iam/services/session.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { UserType } from '../../../iam/model/user-type.vo';
import { OrganizationMemberType } from '../../../organizations/model/organization-member-type.vo';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import {ProjectRole} from '../../../projects/model/project-role.vo';

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
  projectId: number = 0;
  projectRole: ProjectRole | null = null;
  organizationRole: OrganizationMemberType | null = null;
  userType: UserType | null = null;

  constructor(
    private session: SessionService,
    private router: Router
  ) {}

  ngOnInit() {
    const projectIdValue = this.session.getProjectId();
    this.projectId = projectIdValue !== undefined ? projectIdValue : 0;
    this.projectRole = this.session.getProjectRole() || null;
    this.organizationRole = this.session.getOrganizationRole() || null;
    this.userType = this.session.getUserType() || null;
    console.log('Toolbar loaded with projectId:', this.projectId);

    // Si la URL contiene un projectId pero no está en la sesión, lo extraemos y guardamos
    if (!this.projectId) {
      const currentUrl = window.location.pathname;
      const projectMatch = currentUrl.match(/\/projects\/([^\/]+)/);
      if (projectMatch && projectMatch[1]) {
        this.projectId = Number(projectMatch[1]);
        console.log('Extracted project ID from URL:', this.projectId);
      }
    }
  }

  navigateTo(subpath: string) {
    this.router.navigate([`/projects/${this.projectId}/${subpath}`]);
  }

  get isContractor() {
    return (this.organizationRole === OrganizationMemberType.CONTRACTOR);
    // ProjectRoleType doesn't have 'Contractor' value, so we removed that check
  }

  get isClient() {
    // ProjectRoleType doesn't have 'Client' value, so we need to check user type only
    return this.userType === UserType.TYPE_CLIENT;
  }

  get isOrganizationUser() {
    return this.userType === UserType.TYPE_WORKER;
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
