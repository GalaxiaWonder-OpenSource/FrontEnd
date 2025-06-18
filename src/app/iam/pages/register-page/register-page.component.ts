import { Component } from '@angular/core';
import { UserAccountService } from '../../services/user-account.service';
import { PersonService } from '../../services/person.service';
import { UserRole } from '../../model/user-role.vo';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';
import {MatButton} from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Router} from '@angular/router';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RegisterFormComponent, MatButton, MatCardModule, TranslatePipe, RouterModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  isRegistered = false;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private userAccountService: UserAccountService,
    private personService: PersonService,
    private translate: TranslateService,
    private router: Router
  ) {}

  resetValues() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }


  private setError(translationKey: string, details?: string) {
    this.errorMessage = this.translate.instant(translationKey) + (details ? ` ${details}` : '');
    this.successMessage = '';
    this.isLoading = false;
  }


  onRegisterSubmitted(formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    role: UserRole;
  }) {
    this.resetValues();

    // For local db.json integration, we need to:
    // 1. Check if username is already taken
    // 2. Create a person entry
    // 3. Create a user account linked to that person

    // First check if username is already taken
    this.userAccountService.getAll().subscribe({
      next: (accounts: any[]) => {
        const userExists = accounts.some(account => 
          account.username?.toLowerCase() === formData.username.toLowerCase()
        );

        if (userExists) {
          this.setError('register-page.errors.username-taken', '');
          return;
        }

        // Step 1: Create a person entry
        const personData = {
          email: formData.email,
          phone: formData.phone,
          firstName: formData.firstName,
          lastName: formData.lastName
        };

        // Create the person using the Angular service
        this.personService.create(personData).subscribe({
          next: (person: any) => {
            console.log('Person created:', person);
            
            // Step 2: Create a user account with a reference to the person
            // Use the UserRole enum value directly
            let roleValue = UserRole.TYPE_WORKER; // default
            if (formData.role === UserRole.TYPE_CLIENT) {
              roleValue = UserRole.TYPE_CLIENT;
            } else if (formData.role === UserRole.TYPE_WORKER) {
              roleValue = UserRole.TYPE_WORKER;
            }
            
            const userAccountData = {
              username: formData.username.toLowerCase(),
              password: formData.password,
              personId: person.id,
              role: roleValue, // Mapped role value for the database
              status: 'ACTIVE'
            };

            // Create the user account using Angular service
            this.userAccountService.create(userAccountData).subscribe({
              next: (userAccount: any) => {
                console.log('User account created:', userAccount);
                this.isRegistered = true;
                this.isLoading = false;
              },
              error: (error: any) => {
                console.error('Error creating user account:', error);
                this.setError('register-page.errors.create-account', 'Failed to create user account');
                this.isLoading = false;
              }
            });
          },
          error: (error: any) => {
            console.error('Error creating person:', error);
            this.setError('register-page.errors.create-account', 'Failed to create person');
            this.isLoading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Error checking existing users', err);
        this.setError('register-page.errors.server-error', '');
      }
    });
  }
}

