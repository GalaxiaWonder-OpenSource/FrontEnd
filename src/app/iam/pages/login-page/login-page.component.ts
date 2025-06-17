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

    // For working with local db.json, we need to get all users and find the matching one
    this.userAccountService.getAll().subscribe({
      next: (accounts: any[]) => {
        // Find user with matching username and password
        const user = accounts.find(account => 
          account.username?.toLowerCase() === formData.username.toLowerCase() && 
          account.password === formData.password
        );

        if (user) {
          console.log('User found:', user);
          
          // User found, set session data
          this.session.setPersonId(user.personId);
          
          // Map the role from db.json to UserRole enum
          let userRole: UserRole;
          if (user.role === 'ORGANIZATION_USER') {
            userRole = UserRole.TYPE_WORKER;
          } else if (user.role === 'CLIENT_USER') {
            userRole = UserRole.TYPE_CLIENT;
          } else {
            userRole = UserRole.TYPE_WORKER; // Default to WORKER if role is not recognized
          }
          
          this.session.setUserType(userRole);
          
          // Get person details if needed
          this.personService.getById({ id: user.personId }).subscribe({
            next: (person: any) => {
              console.log('Person details:', person);
              // Store additional person info if needed
            },
            error: (personErr: any) => {
              console.error('Error fetching person details', personErr);
            }
          });

          // Generate a mock token for auth simulation
          const mockToken = btoa(`${user.username}:${Date.now()}`);
          this.session.setToken(mockToken);

          // Redirect based on user role
          this.router.navigate(['/organizations']);
        } else {
          this.setError('login-page.errors.invalid-credentials');
        }
      },
      error: (err: any) => {
        console.error('Error during login', err);
        this.setError('login-page.errors.server-error');
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
