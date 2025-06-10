import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {OrgRole, ProjectRole, SessionService} from '../../../iam/services/session.service';
import {CommonModule} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {LanguageSwitcherComponent} from '../language-switcher/language-switcher.component';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIcon} from '@angular/material/icon';
import {OrganizationMemberType} from '../../../organizations/model/organization-member-type.vo';

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
    MatIcon
  ],
  templateUrl: './toolbar-project.component.html',
  styleUrls: ['./toolbar-project.component.css']
})
export class ToolbarProjectComponent {
  projectId = '';
  projectRole: ProjectRole | undefined = undefined;
  organizationRole: OrgRole | undefined = undefined;

  constructor(
    private session: SessionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.projectId = this.session.getProjectId() ?? '';
    this.projectRole = this.session.getProjectRole();
    this.organizationRole = this.session.getOrganizationRole();
  }

  navigateTo(subpath: string) {
    this.router.navigate([`/projects/${this.projectId}/${subpath}`]);
  }

  get isContractor() {
    return this.organizationRole === OrganizationMemberType.CONTRACTOR;
  }

  get isClient() {
    return this.projectRole === 'Client';
  }

  goBackToOrganization() {
    const orgId = this.session.getOrganizationId();
    if (orgId && this.isContractor) {
      this.router.navigate([`/organizations/${orgId}/info`]);
    }
    else{
      this.router.navigate([`/projects`]);
    }
  }
}
