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

    const request = {
      userName: formData.username.toLowerCase(),
      password: formData.password
    };

    this.userAccountService.signIn(request).subscribe({
      next: (response: {
        user: {
          userName: string;
          userType: string;
          personId: number;
        },
        token: string
      }) => {
        const { user, token } = response;

        // ✅ Guardamos en sesión lo necesario
        this.session.setPersonId(user.personId);
        this.session.setUserType(UserType[user.userType as keyof typeof UserType]);
        // ✅ Opcional: guardar el token si lo necesitas
        this.session.setToken?.(token);
        // ✅ Redirección según tipo de usuario
        if (user.userType === 'TYPE_WORKER') {
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
