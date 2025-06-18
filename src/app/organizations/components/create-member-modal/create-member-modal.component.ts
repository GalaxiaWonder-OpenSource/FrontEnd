import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PersonService } from '../../../iam/services/person.service';
import { UserAccountService } from '../../../iam/services/user-account.service';
import { OrganizationMemberService } from '../../services/organization-member.service';
import { SessionService } from '../../../iam/services/session.service';
import {Person} from '../../../iam/model/person.entity';
import {OrganizationMember} from '../../model/organization-member.entity';

/**
 * Component that displays a modal to invite a new member to the organization.
 * It allows the user to enter an email to search for a person and assign them a member type
 * (e.g., WORKER), filtering out those already in the organization.
 */
@Component({
  selector: 'app-create-member-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './create-member-modal.component.html',
  styleUrl: './create-member-modal.component.css'
})
export class CreateMemberModalComponent implements OnInit {
  /** Email input value */
  public emailInput: string = '';

  /** Found person based on email search */
  public foundPerson: Person | null = null;

  /** Selected member type, fixed as 'WORKER' */
  public memberType: string = 'WORKER';

  /** Loading state for email search */
  public isSearching: boolean = false;

  /** Error message for email search */
  public searchError: string | null = null;

  /** Current organization ID */
  private organizationId: number | null = null;

  /** Timeout ID for debouncing */
  private searchTimeout: any = null;

  constructor(
    private dialogRef: MatDialogRef<CreateMemberModalComponent>,
    private personService: PersonService,
    private session: SessionService
  ) {}

  /**
   * Angular lifecycle hook: runs when the component is initialized.
   * Closes the modal if no organization ID is available.
   */
  ngOnInit(): void {
    this.organizationId = this.session.getOrganizationId() ?? null;

    if (!this.organizationId) {
      console.error('No organization ID found in the session');
      this.dialogRef.close();
      return;
    }
  }

  /** Closes the modal without saving any changes */
  public close(): void {
    this.dialogRef.close();
  }

  /**
   * Closes the modal and returns selected member info if the form is valid.
   */
  public submit(): void {
    if (this.isFormValid) {
      this.dialogRef.close(
        this.foundPerson!
      );
    }
  }

  /**
   * Checks if the form is complete and valid.
   * @returns true if person is found
   */
  public get isFormValid(): boolean {
    return this.foundPerson != null;
  }

  /**
   * Handles email input changes and triggers search with debounce
   */
  public onEmailChange(): void {
    this.foundPerson = null;
    this.searchError = null;

    const trimmedEmail = this.emailInput.trim();

    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set up debounced search
    this.searchTimeout = setTimeout(() => {
      this.performEmailSearch(trimmedEmail);
    }, 500);
  }

  /**
   * Performs the actual email search
   */
  private performEmailSearch(email: string): void {
    this.isSearching = true;

    this.searchPersonByEmail(email).then(result => {
      this.isSearching = false;
      if (result) {
        this.foundPerson = result;
        this.searchError = null;
      } else {
        this.foundPerson = null;
        if (!this.searchError) {
          this.searchError = 'create-member.person-not-found';
        }
      }
    }).catch(err => {
      this.isSearching = false;
      this.foundPerson = null;
      this.searchError = 'create-member.search-error';
      console.error('Error searching for person:', err);
    });
  }

  /**
   * Searches for a person by email
   */
  private searchPersonByEmail(email: string): Promise<Person | null> {
    return new Promise((resolve) => {
      this.personService.getAll().subscribe({
        next: (people: Person[]) => {
          const person = people.find(p =>
            p.email && p.email.toLowerCase() === email.toLowerCase()
          );

          if (!person) {
            resolve(null);
            return;
          }

          resolve(person);
        },
        error: () => {
          resolve(null);
        }
      });
    });
  }
}
