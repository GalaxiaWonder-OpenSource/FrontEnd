import { Component, Input } from '@angular/core';
import { Organization } from '../../model/organization.entity';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-configuration-form',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './configuration-form.component.html',
  styleUrls: ['./configuration-form.component.css']
})
export class ConfigurationFormComponent {
  @Input() organization!: Organization;

  getUpdatedOrganization(): Partial<Organization> {
    return {
      legalName: this.organization.legalName,
      commercialName: this.organization.commercialName
    };
  }
}
