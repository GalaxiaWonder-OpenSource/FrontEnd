import {Component} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {SessionService} from '../../../iam/services/session.service';
import {CommonModule} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {LanguageSwitcherComponent} from '../language-switcher/language-switcher.component';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIcon} from '@angular/material/icon';
import {OrganizationMemberType} from '../../../organizations/model/organization-member-type.vo';

@Component({
  selector: 'app-toolbar-organization',
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
  templateUrl: './toolbar-organization.component.html',
  styleUrls: ['./toolbar-organization.component.css']
})
export class ToolbarOrganizationComponent {
  orgId = '';
  organizationRole: string | null = null;

  constructor(
    private session: SessionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.organizationRole = this.session.getOrganizationRole();

  }

  ngOnInit() {
    this.orgId = this.session.getOrganizationId() ?? '';
    this.organizationRole = this.session.getOrganizationRole();
  }

  navigateTo(subpath: string) {
    this.router.navigate([`/organizations/${this.orgId}/${subpath}`]);
  }

  get isContractor() {
    console.log("ORGANIZATION ROLE: ",this.organizationRole);
    console.log("ORGANIZATION MEMBER TYPE: ",OrganizationMemberType.CONTRACTOR);
    return this.organizationRole === OrganizationMemberType.CONTRACTOR;
  }

  goBackToDashboard() {
    this.router.navigate([`/organizations`]);
  }
}
