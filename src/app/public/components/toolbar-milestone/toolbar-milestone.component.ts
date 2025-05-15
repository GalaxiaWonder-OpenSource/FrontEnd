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
    MatIcon
  ],
  templateUrl: './toolbar-milestone.component.html',
  styleUrls: ['./toolbar-milestone.component.css']
})
export class ToolbarMilestoneComponent {
  projectId = '';
  milestoneId = '';
  isContractor = false;

  constructor(
    private router: Router,
    private session: SessionService
  ) {}

  ngOnInit() {
    this.projectId = this.session.getProjectId() ?? '';
    this.milestoneId = this.session.getMilestoneId?.() ?? ''; // si implementas esta función
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
