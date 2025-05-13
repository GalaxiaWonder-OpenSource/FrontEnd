import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Organization } from '../../model/organization.entity';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-organization-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, TranslatePipe],
  templateUrl: './organization-card.component.html',
  styleUrl: './organization-card.component.css'
})
export class OrganizationCardComponent {
  @Input() organization!: Organization;
}
