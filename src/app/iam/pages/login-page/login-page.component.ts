// login-page.component.ts
import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {LoginFormComponent} from '../../components/login-form/login-form.component';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {UserAccountService} from '../../services/user-account.service';
import {TranslateService} from '@ngx-translate/core';

import {SessionService} from '../../services/session.service';

import {UserType} from '../../model/user-type.vo';
import {UserAccount} from '../../model/user-account.entity';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    LoginFormComponent,
    MatCardModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  isLoading = false;
  errorMessage = '';

  constructor(
    private userAccountService: UserAccountService,
    private translate: TranslateService,
    private router: Router,
    private session: SessionService
  ) {}

  onLoginSubmitted(formData: { username: string; password: string }) {
    this.isLoading = true;
    this.errorMessage = '';

    this.userAccountService.getAll().subscribe({
      next: (response: UserAccount[]) => {
        const matchedUser = response.find(user =>
          user.username === formData.username &&
          user.password === formData.password
        );

        if (!matchedUser) return;

        this.session.setPersonId(matchedUser.personId);
        this.session.setUserType(UserType[matchedUser.role as keyof typeof UserType]);

        if (this.session.getUserType() == UserType.TYPE_WORKER) {
          this.router.navigate(['/organizations']);
        } else {
          this.router.navigate(['/projects']);
        }
      },
      error: () => {
        this.setError('login-page.errors.invalid-credentials');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private setError(translationKey: string) {
    this.errorMessage = this.translate.instant(translationKey);
    this.isLoading = false;
  }
}
