import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Organization } from '../../model/organization.entity';
import { OrganizationCardComponent } from '../organization-card/organization-card.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, OrganizationCardComponent, TranslatePipe],
  templateUrl: './organization-list.component.html',
  styleUrl: './organization-list.component.css'
})
export class OrganizationListComponent {
  @Input() organizations: Organization[] = [];
}
