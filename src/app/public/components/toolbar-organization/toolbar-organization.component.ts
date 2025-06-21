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
import {UserMenuComponent} from '../user-menu/user-menu.component';

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
    MatIcon,
    UserMenuComponent
  ],
  templateUrl: './toolbar-organization.component.html',
  styleUrls: ['./toolbar-organization.component.css']
})
export class ToolbarOrganizationComponent {
  orgId: number = 0;
  organizationRole: OrganizationMemberType | undefined = undefined;

  constructor(
    private session: SessionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.orgId = this.session.getOrganizationId() ?? 0;
    this.organizationRole = this.session.getOrganizationRole();
  }

  navigateTo(subpath: string) {
    this.router.navigate([`/organizations/${this.orgId}/${subpath}`]);
  }

  get isContractor() {
    return this.organizationRole === OrganizationMemberType.CONTRACTOR;
  }

  goBackToDashboard() {
    this.router.navigate([`/organizations`]);
  }
}
