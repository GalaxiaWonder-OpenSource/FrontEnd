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
  isContractor = false;
  orgId = '';

  constructor(
    private session: SessionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.isContractor = this.session.getOrganizationRole() === 'Contractor';
    this.orgId = this.session.getOrganizationId() ?? '';
  }

  navigateTo(subpath: string) {
    this.router.navigate([`/organizations/${this.orgId}/${subpath}`]);
  }

  goBackToDashboard() {
    this.router.navigate([`/organizations`]);
  }
}
