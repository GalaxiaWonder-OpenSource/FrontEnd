import {Component} from '@angular/core';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcherComponent} from './public/components/language-switcher/language-switcher.component';
import {RegisterPageComponent} from './iam/pages/register-page/register-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TranslatePipe,
    LanguageSwitcherComponent,
    RegisterPageComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'prop-gms';
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
}
