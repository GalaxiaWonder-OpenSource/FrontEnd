import {Component, Input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {Organization} from '../../model/organization.entity';
import {Person} from '../../../iam/model/person.entity';

@Component({
  selector: 'app-organization-information-card',
  standalone: true,
  imports: [ MatCardModule],
  templateUrl: './organization-information-card.component.html',
  styleUrl: './organization-information-card.component.css'
})
export class OrganizationInformationCardComponent {
  @Input() organization: Organization | undefined;
  @Input() contractor: Person | undefined;
}
