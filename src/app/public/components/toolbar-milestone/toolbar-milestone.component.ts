import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {SessionService} from '../../../iam/services/session.service';
import {CommonModule} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {LanguageSwitcherComponent} from '../language-switcher/language-switcher.component';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIcon} from '@angular/material/icon';
import {OrganizationMemberType} from '../../../organizations/model/organization-member-type.vo';
import {UserMenuComponent} from '../user-menu/user-menu.component';

@Component({
  selector: 'app-toolbar-milestone',
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
  templateUrl: './toolbar-milestone.component.html',
  styleUrls: ['./toolbar-milestone.component.css']
})
export class ToolbarMilestoneComponent {
  projectId = 0;
  milestoneId = 0;
  isContractor = false;

  constructor(
    private router: Router,
    private session: SessionService
  ) {}

  ngOnInit() {
    const projectIdVal = this.session.getProjectId();
    this.projectId = projectIdVal !== undefined ? projectIdVal : 0;
    
    this.milestoneId = this.session.getMilestoneId?.() ?? 0; // si implementas esta función
    this.isContractor = this.session.getOrganizationRole() === OrganizationMemberType.CONTRACTOR;
  }

  navigateTo(subpath: string) {
    this.router.navigate([`/projects/${this.projectId}/milestones/${this.milestoneId}/${subpath}`]);
  }
  goBackToProject() {
    const projectId = this.session.getProjectId();
    if (projectId) {
      this.router.navigate([`/projects/${projectId}/information`]);
    }
  }

}
