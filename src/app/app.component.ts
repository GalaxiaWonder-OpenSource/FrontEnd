import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {LanguageSwitcherComponent} from './public/components/language-switcher/language-switcher.component';
import {FooterContentComponent} from './public/components/footer-content/footer-content.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LanguageSwitcherComponent,
    FooterContentComponent,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'prop-gms';
  options = [
    {path: '', redirectTo: 'login'},
  ]
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
}
