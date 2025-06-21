import { Component } from '@angular/core';
import { UserAccountService } from '../../services/user-account.service';
import { PersonService } from '../../services/person.service';
import { UserType } from '../../model/user-type.vo';
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
    role: UserType;
  }) {
    this.resetValues();

    const request = {
      userName: formData.username.toLowerCase(),
      password: formData.password,
      userType: formData.role.toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone
    }

    console.log('HOLA',request);

    // Call the API to create the user account
    this.userAccountService.signUp(request).subscribe({
      next: (response:{
        username: string;
        userType: string;
        personId: number;
      })=> {
        const {username, userType, personId} = response;

        this.isRegistered = true;
      },
      error: (err: any) => {
        this.setError('register-page.form.errors.create-account', err.message);
      }
    })
    this.resetValues();

    // For local db.json integration, we need to:
    // 1. Check if username is already taken
    // 2. Create a person entry
    // 3. Create a user account linked to that person
    this.resetValues();
  }
}

