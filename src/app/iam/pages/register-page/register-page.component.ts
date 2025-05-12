import { Component } from '@angular/core';
import { PersonService } from '../../services/person.service';
import { UserAccountService } from '../../services/user-account.service';
import { EmailAddress } from '../../../shared/model/email-adress.vo';
import { PhoneNumber } from '../../model/phone-number.vo';
import { Username } from '../../model/username.vo';
import { Password } from '../../model/password.vo';
import { Person } from '../../model/person.entity';
import { UserAccount } from '../../model/user-account.entity';
import { UserRole } from '../../model/user-role.vo';
import { AccountStatus } from '../../model/account-status.vo';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';
import {MatButton} from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RegisterFormComponent, MatButton, MatCardModule, TranslatePipe],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  isRegistered = false;
  successMessage = '';
  errorMessage = '';
  isLoading = false;
  private router: any;

  constructor(
    private personService: PersonService,
    private userAccountService: UserAccountService,
    private translate: TranslateService
  ) {}

  resetValues() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private buildPerson(formData: any): Person {
    return new Person({
      email: new EmailAddress(formData.email),
      phone: new PhoneNumber(formData.phone),
      firstName: formData.firstName,
      lastName: formData.lastName
    });
  }

  private buildAccount(personId: any, formData: any): UserAccount {
    return new UserAccount({
      username: new Username(formData.username),
      password: new Password(formData.password),
      role: UserRole.CLIENT_USER,
      status: AccountStatus.ACTIVE,
      personId
    });
  }

  private createPersonAndAccount(person: Person, formData: any) {
    this.personService.create(person).subscribe({
      next: (createdPerson: Person) => {
        const account = this.buildAccount(createdPerson.id, formData);

        this.userAccountService.create(account).subscribe({
          next: () => {
            this.successMessage = this.translate.instant('register-page.success-card.title');
            this.isLoading = false;
            this.isRegistered = true;
          },
          error: (err: any) => {
            this.setError('register-page.errors.create-account', err.message);
          }
        });
      },
      error: (err: any) => {
        this.setError('register-page.errors.create-person', err.message);
      }
    });
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
  }) {
    this.resetValues();

    this.personService.getByEmail({}, { email: formData.email }).subscribe({
      next: (existingUsers: any[]) => {
        if (existingUsers.length > 0) {
          this.setError('register-page.errors.email-taken');
          return;
        }

        const person = this.buildPerson(formData);

        this.createPersonAndAccount(person, formData);
      },
      error: (err: any) => {
        this.setError('register-page.errors.check-email', err.message);
      }
    });
  }
}

