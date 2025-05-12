// login-page.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { UserAccountService } from '../../services/user-account.service';
import { Username } from '../../model/username.vo';
import { Password } from '../../model/password.vo';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    LoginFormComponent,
    MatCardModule,
    MatButtonModule,
    TranslatePipe,
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
    private router: Router
  ) {}

  onLoginSubmitted(formData: { username: string; password: string }) {
    this.isLoading = true;
    this.errorMessage = '';

    const username = new Username(formData.username);
    const password = new Password(formData.password);

    this.userAccountService.getByUsername({}, { username: username.value }).subscribe({
      next: (accounts: any[]) => {
        const user = accounts[0];
        console.log(username.value)
        console.log(accounts);
        if (!user || user.password !== password.value) {
          this.setError('login-page.errors.invalid-credentials');
          return;
        }

        // Aquí podrías guardar en sessionStorage, redirect, etc.
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.setError('login-page.errors.server');
      }
    });
  }

  private setError(translationKey: string) {
    this.errorMessage = this.translate.instant(translationKey);
    this.isLoading = false;
  }
}
