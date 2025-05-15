import {Component, Input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-organization-information-card',
  imports: [ MatCardModule],
  templateUrl: './organization-information-card.component.html',
  styleUrl: './organization-information-card.component.css'
})
export class OrganizationInformationCardComponent {
  @Input() organization!: any;
  @Input() contractor!: any;

}
