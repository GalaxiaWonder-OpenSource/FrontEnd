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
  projectRole: string | null = null;
  organizationRole: string | null = null;

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
    return this.organizationRole === 'Contractor';
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
