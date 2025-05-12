// login-page.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { UserAccountService } from '../../services/user-account.service';
import { Username } from '../../model/username.vo';
import { Password } from '../../model/password.vo';
import {TranslateService} from '@ngx-translate/core';
import {SessionService} from '../../services/session.service';
import {UserRole} from '../../model/user-role.vo';
import {PersonService} from '../../services/person.service';

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
    private personService: PersonService,
    private translate: TranslateService,
    private router: Router,
    private session: SessionService
  ) {}

  onLoginSubmitted(formData: { username: string; password: string }) {
    this.isLoading = true;
    this.errorMessage = '';

    const username = new Username(formData.username);
    const password = new Password(formData.password);

    this.userAccountService.getByUsername({}, { username: username.value }).subscribe({
      next: (accounts: any[]) => {
        const user = accounts[0];
        if (!user || user.password !== password.value) {
          this.setError('login-page.errors.invalid-credentials');
          return;
        }

        this.personService.getById({}, { id: user.personId }).subscribe({
          next: (person: any)=> {
            this.session.setPersonId(person.id);
          }
        })

        this.session.setUserType(user.role);

        if (user.role==UserRole.ORGANIZATION_USER) {
          this.router.navigate(['/organizations']);
        }
        else {
          this.router.navigate(['/projects']);
        }
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
