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
  public foundPerson: { id: string; fullName: string; email: string } | null = null;

  /** Selected member type, fixed as 'WORKER' */
  public memberType: string = 'WORKER';

  /** Loading state for email search */
  public isSearching: boolean = false;

  /** Error message for email search */
  public searchError: string | null = null;

  /** Current organization ID */
  private organizationId: number | null = null;

  /** List of existing member person IDs */
  private existingMemberIds: string[] = [];

  /** Timeout ID for debouncing */
  private searchTimeout: any = null;

  constructor(
    private dialogRef: MatDialogRef<CreateMemberModalComponent>,
    private personService: PersonService,
    private userAccountService: UserAccountService,
    private organizationMemberService: OrganizationMemberService,
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

    this.loadExistingMembers(this.organizationId.toString());
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
      this.dialogRef.close({
        personId: this.foundPerson!.id,
        memberType: this.memberType
      });
    }
  }

  /**
   * Checks if the form is complete and valid.
   * @returns true if person is found
   */
  public get isFormValid(): boolean {
    return !!this.foundPerson;
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
   * Validates email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Searches for a person by email
   */
  private searchPersonByEmail(email: string): Promise<{ id: string; fullName: string; email: string } | null> {
    return new Promise((resolve) => {
      this.personService.getAll().subscribe({
        next: (people: any[]) => {
          const person = people.find(p =>
            p.email && p.email.toLowerCase() === email.toLowerCase()
          );

          if (!person) {
            resolve(null);
            return;
          }

          // Check if person is already a member
          if (this.existingMemberIds.includes(person.id)) {
            this.searchError = 'create-member.already-member';
            resolve(null);
            return;
          }

          // Check if person has ORGANIZATION_USER account
          this.userAccountService.getAll().subscribe({
            next: (accounts: any[]) => {
              const hasOrgAccount = accounts.some(account =>
                account.personId === person.id &&
                account.role === 'ORGANIZATION_USER'
              );

              if (!hasOrgAccount) {
                this.searchError = 'create-member.not-organization-user';
                resolve(null);
                return;
              }

              resolve({
                id: person.id,
                fullName: person.firstName && person.lastName
                  ? `${person.firstName} ${person.lastName}`
                  : 'Name not available',
                email: person.email
              });
            },
            error: () => {
              resolve(null);
            }
          });
        },
        error: () => {
          resolve(null);
        }
      });
    });
  }

  /**
   * Loads existing organization members to filter them out
   */
  private loadExistingMembers(organizationId: string): void {
    this.organizationMemberService.getByOrganizationId({ organizationId }).subscribe({
      next: (members: any[]) => {
        this.existingMemberIds = members
          .filter(m => m.organizationId === organizationId)
          .map(m => m.personId);
      },
      error: (err: any) => {
        console.error('Failed to load organization members:', err);
      }
    });
  }
}
