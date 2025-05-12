import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {TermsAndConditionsComponent} from '../terms-and-conditions/terms-and-conditions.component';

@Component({
  selector: 'app-footer-content',
  imports: [
    MatIconModule,
    TranslatePipe,
    TermsAndConditionsComponent
  ],
  templateUrl: './footer-content.component.html',
  styleUrl: './footer-content.component.css'
})
export class FooterContentComponent {

}
